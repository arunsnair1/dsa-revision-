// ==================== DATA MANAGER ====================
const DataManager = {
  STORAGE_KEY: 'dsa_spaced_rep_data',

  getDefaultState() {
    return {
      completedQuestions: {},
      revisionSchedule: [],
      settings: {
        dailyBudget: DEFAULT_DAILY_BUDGET,
        deadline: DEADLINE,
        autoStartTimer: false
      },
      history: []
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure settings exist
        if (!parsed.settings) {
          parsed.settings = this.getDefaultState().settings;
        }
        // Ensure autoStartTimer key exists for older data
        if (parsed.settings.autoStartTimer === undefined) {
          parsed.settings.autoStartTimer = false;
        }
        if (!parsed.history) parsed.history = [];
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    return this.getDefaultState();
  },

  save(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save data:', e);
      // Notify the user so they can export before data is lost
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
        App.showSaveError('Storage quota exceeded. Your latest changes may not persist after reload. Please export your data from Settings immediately.');
      } else {
        App.showSaveError('Failed to save data. Please export your data from Settings as a backup.');
      }
    }
  },

  exportData(state) {
    return JSON.stringify(state, null, 2);
  },

  importData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      // Validate top-level structure
      if (!data || typeof data !== 'object') return null;
      if (!data.completedQuestions || typeof data.completedQuestions !== 'object') return null;
      if (!Array.isArray(data.revisionSchedule)) return null;

      // Validate each schedule entry has required numeric fields
      for (const entry of data.revisionSchedule) {
        if (!entry || typeof entry !== 'object') return null;
        if (typeof entry.questionId !== 'number') return null;
        if (typeof entry.intervalIndex !== 'number') return null;
        if (typeof entry.nextReviewDate !== 'string') return null;
      }

      // Ensure optional fields exist
      if (!data.settings || typeof data.settings !== 'object') {
        data.settings = this.getDefaultState().settings;
      }
      if (!Array.isArray(data.history)) {
        data.history = [];
      }

      return data;
    } catch (e) {
      // invalid JSON
    }
    return null;
  },

  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    return this.getDefaultState();
  }
};

// ==================== SPACED REPETITION ENGINE ====================
const SpacedRepetitionEngine = {
  getNextInterval(currentIntervalIndex, feedback) {
    // feedback: 'easy', 'good', 'struggled'
    let nextIndex = currentIntervalIndex + 1;

    if (feedback === 'easy') {
      nextIndex = currentIntervalIndex + 2; // skip one level
    } else if (feedback === 'struggled') {
      nextIndex = Math.max(0, currentIntervalIndex - 1); // go back one level
    }

    return Math.min(nextIndex, BASE_INTERVALS.length - 1);
  },

  getIntervalDays(intervalIndex) {
    return BASE_INTERVALS[Math.min(intervalIndex, BASE_INTERVALS.length - 1)];
  },

  getMasteryLevel(item) {
    if (!item) return MASTERY.NEW;
    if (item.intervalIndex >= BASE_INTERVALS.length - 1 && item.successCount >= 4) {
      return MASTERY.MASTERED;
    }
    if (item.intervalIndex >= 2) return MASTERY.REVIEWING;
    if (item.intervalIndex >= 0) return MASTERY.LEARNING;
    return MASTERY.NEW;
  },

  scheduleRevision(questionId, feedback, state, fromDate) {
    const today = fromDate || this.getToday();
    let existing = state.revisionSchedule.find(r => r.questionId === questionId);

    if (!existing) {
      // First completion - schedule first revision
      existing = {
        questionId: questionId,
        intervalIndex: 0,
        nextReviewDate: this.addDays(today, BASE_INTERVALS[0]),
        successCount: 0,
        lastFeedback: 'good',
        type: 're-solve'
      };
      state.revisionSchedule.push(existing);
    } else {
      // Update based on feedback
      const newIndex = this.getNextInterval(existing.intervalIndex, feedback);
      existing.intervalIndex = newIndex;
      existing.nextReviewDate = this.addDays(today, this.getIntervalDays(newIndex));
      existing.lastFeedback = feedback;

      if (feedback === 'struggled') {
        existing.type = 're-solve';
      } else if (feedback === 'easy' && existing.intervalIndex >= 2) {
        existing.type = 'read-notes';
      } else {
        existing.type = existing.intervalIndex >= 3 ? 'read-notes' : 're-solve';
      }

      if (feedback === 'good' || feedback === 'easy') {
        existing.successCount = (existing.successCount || 0) + 1;
      }
      // On 'struggled', only regress the interval index (done above).
      // Do NOT decrement successCount to avoid asymmetric penalty
      // that traps items below mastery after a single regression.
    }

    return state;
  },

  getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  addDays(dateStr, days) {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getDaysDiff(dateStr1, dateStr2) {
    const parts1 = dateStr1.split('-');
    const parts2 = dateStr2.split('-');
    const d1 = new Date(parseInt(parts1[0]), parseInt(parts1[1]) - 1, parseInt(parts1[2]));
    const d2 = new Date(parseInt(parts2[0]), parseInt(parts2[1]) - 1, parseInt(parts2[2]));
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  }
};

// ==================== SCHEDULER ====================
const Scheduler = {
  getDailyItems(state, budgetOverride) {
    const today = SpacedRepetitionEngine.getToday();
    const dailyBudget = state.settings.dailyBudget || DEFAULT_DAILY_BUDGET;
    const budget = Number.isFinite(budgetOverride) ? Math.max(0, budgetOverride) : dailyBudget;

    // Get all items due today or overdue
    let dueItems = state.revisionSchedule
      .filter(r => r.nextReviewDate <= today)
      .map(r => {
        const question = QUESTIONS.find(q => q.id === r.questionId);
        const daysOverdue = SpacedRepetitionEngine.getDaysDiff(r.nextReviewDate, today);
        return {
          ...r,
          question: question,
          daysOverdue: daysOverdue,
          timeEstimate: r.type === 'read-notes' ? TIME_READ_NOTES : TIME_RE_SOLVE,
          mastery: SpacedRepetitionEngine.getMasteryLevel(r)
        };
      })
      .filter(r => r.question); // filter out any orphaned records

    // Sort: overdue first, then struggled items, then by category
    dueItems.sort((a, b) => {
      // Overdue items first
      if (a.daysOverdue !== b.daysOverdue) return b.daysOverdue - a.daysOverdue;
      // Struggled items next
      if (a.lastFeedback === 'struggled' && b.lastFeedback !== 'struggled') return -1;
      if (b.lastFeedback === 'struggled' && a.lastFeedback !== 'struggled') return 1;
      // Same category together
      if (a.question.category !== b.question.category) {
        return a.question.category.localeCompare(b.question.category);
      }
      return 0;
    });

    // Apply time budget
    let totalTime = 0;
    const scheduled = [];
    const deferred = [];

    for (const item of dueItems) {
      if (totalTime + item.timeEstimate <= budget) {
        scheduled.push(item);
        totalTime += item.timeEstimate;
      } else {
        // If re-solve, try to demote to read-notes to fit within budget
        if (item.type === 're-solve' && totalTime + TIME_READ_NOTES <= budget) {
          item.type = 'read-notes';
          item.timeEstimate = TIME_READ_NOTES;
          item.demoted = true; // Flag so UI can show this was originally re-solve
          scheduled.push(item);
          totalTime += item.timeEstimate;
        } else {
          deferred.push(item);
        }
      }
    }

    return { scheduled, deferred, totalTime, budget };
  },

  getBonusItems(state, budgetOverride, remainingBudgetOverride) {
    const today = SpacedRepetitionEngine.getToday();
    const dailyBudget = state.settings.dailyBudget || DEFAULT_DAILY_BUDGET;
    const budget = Number.isFinite(budgetOverride) ? Math.max(0, budgetOverride) : dailyBudget;

    // Calculate time already spent today from history entries
    const todayHistory = state.history.filter(h => h.date === today && h.feedback !== 'completed');
    let timeSpentToday = 0;
    todayHistory.forEach(h => {
      timeSpentToday += h.timeEstimate || TIME_RE_SOLVE;
    });

    const remainingBudget = Number.isFinite(remainingBudgetOverride)
      ? Math.max(0, remainingBudgetOverride)
      : Math.max(0, budget - timeSpentToday);

    // Must have done at least one review today to show bonus
    if (todayHistory.length === 0) {
      return { bonusItems: [], remainingBudget };
    }

    // Check if all "scheduled" items have been reviewed today.
    // Simulate the same budget/priority logic as getDailyItems to determine
    // which items would be scheduled vs deferred, then verify all scheduled
    // ones have been reviewed.
    const reviewedTodayIds = new Set(todayHistory.map(h => h.questionId));

    // Get all items due today/overdue
    const allDueItems = state.revisionSchedule
      .filter(r => r.nextReviewDate <= today)
      .map(r => {
        const question = QUESTIONS.find(q => q.id === r.questionId);
        return { ...r, question, timeEstimate: r.type === 'read-notes' ? TIME_READ_NOTES : TIME_RE_SOLVE };
      })
      .filter(r => r.question);

    // Sort with same priority logic as getDailyItems
    allDueItems.sort((a, b) => {
      const daysOverdueA = SpacedRepetitionEngine.getDaysDiff(a.nextReviewDate, today);
      const daysOverdueB = SpacedRepetitionEngine.getDaysDiff(b.nextReviewDate, today);
      if (daysOverdueA !== daysOverdueB) return daysOverdueB - daysOverdueA;
      if (a.lastFeedback === 'struggled' && b.lastFeedback !== 'struggled') return -1;
      if (b.lastFeedback === 'struggled' && a.lastFeedback !== 'struggled') return 1;
      if (a.question.category !== b.question.category) return a.question.category.localeCompare(b.question.category);
      return 0;
    });

    // Simulate budget allocation to determine scheduled vs deferred
    let simTime = 0;
    const simulatedScheduled = [];
    const simulatedDeferred = [];
    for (const item of allDueItems) {
      if (simTime + item.timeEstimate <= budget) {
        simulatedScheduled.push(item);
        simTime += item.timeEstimate;
      } else if (item.type === 're-solve' && simTime + TIME_READ_NOTES <= budget) {
        simulatedScheduled.push(item);
        simTime += TIME_READ_NOTES;
      } else {
        simulatedDeferred.push(item);
      }
    }

    // If not all simulated scheduled items have been reviewed, don't show bonus yet
    const allScheduledDone = simulatedScheduled.every(item => reviewedTodayIds.has(item.questionId));
    if (!allScheduledDone) {
      return { bonusItems: [], remainingBudget };
    }

    // Gather bonus candidates from:
    // (a) Deferred items (due today/overdue, not yet reviewed)
    // (b) Any other unreviewed due items not captured in scheduled or deferred
    // NOTE: No "due tomorrow" items - pulling them early damages the spaced repetition scheme
    let candidates = [];

    const unreviewedDeferred = simulatedDeferred
      .filter(r => !reviewedTodayIds.has(r.questionId))
      .map(r => ({
        ...r,
        daysOverdue: SpacedRepetitionEngine.getDaysDiff(r.nextReviewDate, today),
        mastery: SpacedRepetitionEngine.getMasteryLevel(r),
        bonusSource: 'deferred'
      }));
    candidates = candidates.concat(unreviewedDeferred);

    // Also include any unreviewed due items not captured in scheduled or deferred
    const overdueNotCaptured = allDueItems
      .filter(r => !reviewedTodayIds.has(r.questionId))
      .filter(r => !simulatedDeferred.some(d => d.questionId === r.questionId))
      .filter(r => !simulatedScheduled.some(s => s.questionId === r.questionId))
      .map(r => ({
        ...r,
        daysOverdue: SpacedRepetitionEngine.getDaysDiff(r.nextReviewDate, today),
        mastery: SpacedRepetitionEngine.getMasteryLevel(r),
        bonusSource: 'deferred'
      }));
    candidates = candidates.concat(overdueNotCaptured);

    // Sort: overdue count desc > struggled first > category alphabetical
    candidates.sort((a, b) => {
      if (a.daysOverdue !== b.daysOverdue) return b.daysOverdue - a.daysOverdue;
      if (a.lastFeedback === 'struggled' && b.lastFeedback !== 'struggled') return -1;
      if (b.lastFeedback === 'struggled' && a.lastFeedback !== 'struggled') return 1;
      if (a.question.category !== b.question.category) {
        return a.question.category.localeCompare(b.question.category);
      }
      return 0;
    });

    // Fit within remaining time budget
    let usedTime = 0;
    const bonusItems = [];
    for (const item of candidates) {
      if (usedTime + item.timeEstimate <= remainingBudget) {
        bonusItems.push(item);
        usedTime += item.timeEstimate;
      }
    }

    return { bonusItems, remainingBudget };
  },

  carryForwardDeferred(state) {
    // Bump nextReviewDate of deferred items to tomorrow so they do not
    // accumulate overdue counts and permanently block the schedule.
    const today = SpacedRepetitionEngine.getToday();
    const tomorrow = SpacedRepetitionEngine.addDays(today, 1);
    const budget = state.settings.dailyBudget || DEFAULT_DAILY_BUDGET;

    let dueItems = state.revisionSchedule
      .filter(r => r.nextReviewDate <= today)
      .map(r => {
        const question = QUESTIONS.find(q => q.id === r.questionId);
        const daysOverdue = SpacedRepetitionEngine.getDaysDiff(r.nextReviewDate, today);
        return {
          scheduleRef: r,
          question: question,
          daysOverdue: daysOverdue,
          timeEstimate: r.type === 'read-notes' ? TIME_READ_NOTES : TIME_RE_SOLVE
        };
      })
      .filter(r => r.question);

    dueItems.sort((a, b) => {
      if (a.daysOverdue !== b.daysOverdue) return b.daysOverdue - a.daysOverdue;
      if (a.scheduleRef.lastFeedback === 'struggled' && b.scheduleRef.lastFeedback !== 'struggled') return -1;
      if (b.scheduleRef.lastFeedback === 'struggled' && a.scheduleRef.lastFeedback !== 'struggled') return 1;
      return 0;
    });

    let totalTime = 0;
    for (const item of dueItems) {
      const itemTime = item.scheduleRef.type === 'read-notes' ? TIME_READ_NOTES : TIME_RE_SOLVE;
      if (totalTime + itemTime <= budget) {
        totalTime += itemTime;
      } else {
        // Try demotion
        if (item.scheduleRef.type === 're-solve' && totalTime + TIME_READ_NOTES <= budget) {
          totalTime += TIME_READ_NOTES;
        } else {
          // This item is deferred - carry forward to tomorrow
          item.scheduleRef.nextReviewDate = tomorrow;
          item.scheduleRef.deferred = true;
        }
      }
    }

    return state;
  }
};

// ==================== PROGRESS TRACKER ====================
const ProgressTracker = {
  getStats(state) {
    const totalQuestions = QUESTIONS.length;
    const completedCount = Object.keys(state.completedQuestions).length;
    const today = SpacedRepetitionEngine.getToday();
    const deadline = state.settings.deadline || DEADLINE;
    const daysRemaining = SpacedRepetitionEngine.getDaysDiff(today, deadline);

    // Mastery breakdown
    const masteryBreakdown = { New: 0, Learning: 0, Reviewing: 0, Mastered: 0 };

    QUESTIONS.forEach(q => {
      const schedItem = state.revisionSchedule.find(r => r.questionId === q.id);
      const mastery = SpacedRepetitionEngine.getMasteryLevel(schedItem);
      masteryBreakdown[mastery]++;
    });

    // Calculate if behind schedule
    const questionsRemaining = totalQuestions - completedCount;
    const questionsPerDay = daysRemaining > 0 ? questionsRemaining / daysRemaining : questionsRemaining;
    const isBehind = questionsPerDay > 5; // more than 5 new questions per day is behind

    // Activity data (last 28 days)
    const activity = {};
    for (let i = 27; i >= 0; i--) {
      const date = SpacedRepetitionEngine.addDays(today, -i);
      activity[date] = 0;
    }
    state.history.forEach(h => {
      if (activity[h.date] !== undefined) {
        activity[h.date]++;
      }
    });

    return {
      totalQuestions,
      completedCount,
      completionPercent: Math.round((completedCount / totalQuestions) * 100),
      daysRemaining,
      masteryBreakdown,
      isBehind,
      questionsPerDay: questionsPerDay.toFixed(1),
      activity
    };
  }
};

// ==================== UI CONTROLLER ====================
const App = {
  state: null,

  init() {
    this.state = DataManager.load();
    this.bindNavigation();
    this.bindEvents();
    this.renderHeader();
    this.showView('dashboard');
  },

  bindNavigation() {
    document.querySelectorAll('.nav-links button').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.showView(view);
      });
    });
  },

  bindEvents() {
    // Settings events
    document.getElementById('budget-input').addEventListener('change', (e) => {
      this.state.settings.dailyBudget = parseInt(e.target.value) || DEFAULT_DAILY_BUDGET;
      DataManager.save(this.state);
      this.renderDashboard();
    });

    document.getElementById('deadline-input').addEventListener('change', (e) => {
      this.state.settings.deadline = e.target.value || DEADLINE;
      DataManager.save(this.state);
      this.renderHeader();
    });

    document.getElementById('autostart-timer-input').addEventListener('change', (e) => {
      this.state.settings.autoStartTimer = e.target.checked;
      DataManager.save(this.state);
    });

    document.getElementById('export-btn').addEventListener('click', () => {
      const data = DataManager.exportData(this.state);
      document.getElementById('import-export-area').value = data;
    });

    document.getElementById('import-btn').addEventListener('click', () => {
      const data = DataManager.importData(document.getElementById('import-export-area').value);
      if (data) {
        this.state = data;
        DataManager.save(this.state);
        this.showView('dashboard');
        this.renderHeader();
      } else {
        alert('Invalid data format. Please paste valid JSON.');
      }
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      this.showModal('Are you sure you want to reset all data? This cannot be undone.', () => {
        this.state = DataManager.reset();
        this.renderHeader();
        this.showView('dashboard');
      });
    });
  },

  showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));

    document.getElementById(`view-${viewName}`).classList.add('active');
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    switch(viewName) {
      case 'dashboard': this.renderDashboard(); break;
      case 'questions': this.renderQuestionBank(); break;
      case 'progress': this.renderProgress(); break;
      case 'settings': this.renderSettings(); break;
    }
  },

  renderHeader() {
    const today = SpacedRepetitionEngine.getToday();
    const deadline = this.state.settings.deadline || DEADLINE;
    const daysRemaining = SpacedRepetitionEngine.getDaysDiff(today, deadline);

    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });

    const countdownEl = document.getElementById('countdown');
    if (daysRemaining > 0) {
      countdownEl.textContent = `${daysRemaining} days to deadline`;
      countdownEl.className = 'countdown' + (daysRemaining <= 7 ? ' urgent' : '');
    } else if (daysRemaining === 0) {
      countdownEl.textContent = 'Deadline is TODAY';
      countdownEl.className = 'countdown urgent';
    } else {
      countdownEl.textContent = `${Math.abs(daysRemaining)} days past deadline`;
      countdownEl.className = 'countdown urgent';
    }
  },

  renderDashboard() {
    const container = document.getElementById('dashboard-content');
    const studyBudget = this.getRemainingStudyBudget();
    const { scheduled, deferred, totalTime, budget } = Scheduler.getDailyItems(this.state, studyBudget.remainingMinutes);
    const stats = ProgressTracker.getStats(this.state);

    let html = '';

    // Floating background shapes
    html += `<div class="floating-shapes" aria-hidden="true">
      <div class="shape shape-circle shape-1"></div>
      <div class="shape shape-square shape-2"></div>
      <div class="shape shape-circle shape-3"></div>
      <div class="shape shape-triangle shape-4"></div>
      <div class="shape shape-square shape-5"></div>
      <div class="shape shape-circle shape-6"></div>
    </div>`;

    // Decorative widgets row
    html += `<div class="dashboard-widgets">`;

    // Animated clock widget (always runs)
    html += `<div class="clock-widget card">
      <div class="clock-face">
        <div class="clock-hand clock-hour" id="clock-hour"></div>
        <div class="clock-hand clock-minute" id="clock-minute"></div>
        <div class="clock-hand clock-second" id="clock-second"></div>
        <div class="clock-center"></div>
        <div class="clock-marker clock-12"></div>
        <div class="clock-marker clock-3"></div>
        <div class="clock-marker clock-6"></div>
        <div class="clock-marker clock-9"></div>
      </div>
      <div class="clock-digital" id="clock-digital"></div>
    </div>`;

    // Study Session Countdown Timer
    const studyTimerState = studyBudget.timerState;
    const remainingSec = studyBudget.timerRemainingSeconds;
    const remainingMin = Math.floor(remainingSec / 60);
    const remainingSecPart = remainingSec % 60;
    const elapsedMin = Math.floor(studyTimerState.elapsedSeconds / 60);
    const elapsedSecPart = studyTimerState.elapsedSeconds % 60;

    html += `<div class="study-timer-widget card">
      <div class="study-timer-title">Study Session</div>
      <div class="study-timer-display" id="study-timer-display">
        ${String(remainingMin).padStart(2, '0')}:${String(remainingSecPart).padStart(2, '0')}
      </div>
      <div class="study-timer-label">Time Remaining</div>
      <div class="study-timer-elapsed" id="study-timer-elapsed">
        Elapsed: ${String(elapsedMin).padStart(2, '0')}:${String(elapsedSecPart).padStart(2, '0')}
      </div>
      <div class="study-timer-actions">
        <button class="btn btn-sm btn-success" id="study-timer-start">${this.studyTimerInterval ? 'Pause' : 'Start'}</button>
        <button class="btn btn-sm btn-warning" id="study-timer-reset">Reset</button>
      </div>
    </div>`;

    // Motivational quote widget
    html += `<div class="quote-widget card">
      <div class="quote-text" id="quote-text"></div>
      <div class="quote-author" id="quote-author"></div>
    </div>`;

    html += `</div>`;

    // Warning banners
    if (stats.isBehind && stats.daysRemaining > 0) {
      html += `<div class="warning-banner">
        You need to complete ~${stats.questionsPerDay} new questions per day to meet your deadline.
        Consider increasing your daily study time.
      </div>`;
    }
    if (stats.daysRemaining <= 0) {
      html += `<div class="danger-banner">
        Your deadline has passed. Keep going - update your deadline in Settings if needed.
      </div>`;
    }

    // Time budget
    const budgetContext = studyBudget.remainingMinutes < studyBudget.dailyBudget
      ? `Study session timer budget: ${studyBudget.remainingMinutes} min left of ${studyBudget.dailyBudget} min daily budget`
      : `Study session timer budget: ${studyBudget.dailyBudget} min`;
    const budgetProgress = budget > 0 ? Math.min(100, (totalTime / budget) * 100) : 0;
    html += `<div class="time-budget">
      <div class="time-budget-info">
        <div class="time-budget-label">Study Session Allocation</div>
        <div class="time-budget-value">${totalTime} / ${budget} min</div>
        <div class="section-subtitle">${budgetContext}</div>
      </div>
      <div style="width:120px">
        <div class="progress-bar">
          <div class="progress-bar-fill accent" style="width:${budgetProgress}%"></div>
        </div>
      </div>
    </div>`;

    if (scheduled.length === 0 && deferred.length === 0) {
      html += `<div class="empty-state">
        <p>No reviews scheduled for today!</p>
        <p style="color:var(--text-secondary);font-size:0.8125rem">
          Head to the Question Bank to mark questions as completed and start building your revision schedule.
        </p>
      </div>`;
    } else {
      // Read Notes section
      const readNotes = scheduled.filter(i => i.type === 'read-notes');
      const reSolve = scheduled.filter(i => i.type === 're-solve');

      if (readNotes.length > 0) {
        html += `<div class="dashboard-section">
          <div class="section-title">Read Notes (${TIME_READ_NOTES} min each)</div>
          ${readNotes.map(item => this.renderReviewItem(item)).join('')}
        </div>`;
      }

      if (reSolve.length > 0) {
        html += `<div class="dashboard-section">
          <div class="section-title">Re-solve (${TIME_RE_SOLVE} min each)</div>
          ${reSolve.map(item => this.renderReviewItem(item)).join('')}
        </div>`;
      }

      if (deferred.length > 0) {
        html += `<div class="dashboard-section">
          <div class="section-title">Deferred to Tomorrow</div>
          <p class="section-subtitle">These items exceed the current study session timer budget of ${budget} minutes</p>
          ${deferred.map(item => this.renderReviewItem(item, true)).join('')}
        </div>`;
      }
    }

    // Bonus items section
    const { bonusItems, remainingBudget } = Scheduler.getBonusItems(this.state, budget, Math.max(0, budget - totalTime));
    if (bonusItems.length > 0) {
      html += `<div class="dashboard-section">
        <div class="section-title">Bonus Questions</div>
        <p class="section-subtitle">All scheduled reviews done! Here are extra items within your remaining ${remainingBudget} min budget</p>
        ${bonusItems.map(item => this.renderBonusItem(item)).join('')}
      </div>`;
    }

    container.innerHTML = html;
    this.bindDashboardEvents();
    this.startClock();
    this.bindStudyTimer();
    if (this.state.settings.autoStartTimer && !this.studyTimerInterval) {
      this.startStudyTimer();
    }
    this.rotateQuote();
  },

  renderReviewItem(item, isDeferred) {
    const overdueText = item.daysOverdue > 0 ? `<span style="color:var(--danger)">${item.daysOverdue}d overdue</span>` : '';
    const masteryClass = item.mastery.toLowerCase();
    const demotedBadge = item.demoted ? `<span class="badge badge-demoted" title="Originally scheduled as re-solve, demoted to fit budget">demoted</span>` : '';

    return `<div class="review-item ${isDeferred ? 'deferred' : ''}">
      <div class="review-item-left">
        <span class="badge badge-${masteryClass}">${item.mastery}</span>
        ${demotedBadge}
        <div>
          <div class="review-item-title">${item.question.title}</div>
          <div class="review-item-meta">${item.question.category} ${overdueText}</div>
        </div>
      </div>
      ${!isDeferred ? `<div class="review-item-actions">
        <button class="btn btn-sm btn-success" data-action="feedback" data-id="${item.questionId}" data-feedback="easy">Easy</button>
        <button class="btn btn-sm btn-primary" data-action="feedback" data-id="${item.questionId}" data-feedback="good">Good</button>
        <button class="btn btn-sm btn-warning" data-action="feedback" data-id="${item.questionId}" data-feedback="struggled">Struggled</button>
      </div>` : `<span class="badge badge-deferred">Deferred</span>`}
    </div>`;
  },

  renderBonusItem(item) {
    const overdueText = item.daysOverdue > 0 ? `<span style="color:var(--danger)">${item.daysOverdue}d overdue</span>` : '';
    const masteryClass = item.mastery.toLowerCase();
    const sourceBadge = item.daysOverdue > 0
      ? '<span class="badge badge-bonus-deferred">overdue</span>'
      : '<span class="badge badge-bonus-deferred">deferred</span>';

    return `<div class="review-item bonus-item">
      <div class="review-item-left">
        <span class="badge badge-${masteryClass}">${item.mastery}</span>
        ${sourceBadge}
        <div>
          <div class="review-item-title">${item.question.title}</div>
          <div class="review-item-meta">${item.question.category} ${overdueText}</div>
        </div>
      </div>
      <div class="review-item-actions">
        <button class="btn btn-sm btn-success" data-action="feedback" data-id="${item.questionId}" data-feedback="easy">Easy</button>
        <button class="btn btn-sm btn-primary" data-action="feedback" data-id="${item.questionId}" data-feedback="good">Good</button>
        <button class="btn btn-sm btn-warning" data-action="feedback" data-id="${item.questionId}" data-feedback="struggled">Struggled</button>
      </div>
    </div>`;
  },

  bindDashboardEvents() {
    document.querySelectorAll('[data-action="feedback"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const questionId = parseInt(e.target.dataset.id);
        const feedback = e.target.dataset.feedback;
        this.handleFeedback(questionId, feedback);
      });
    });
  },

  handleFeedback(questionId, feedback) {
    // Capture timeEstimate BEFORE scheduleRevision mutates the item type
    const existingItem = this.state.revisionSchedule.find(r => r.questionId === questionId);
    const timeEstimate = existingItem && existingItem.type === 'read-notes' ? TIME_READ_NOTES : TIME_RE_SOLVE;

    this.state = SpacedRepetitionEngine.scheduleRevision(questionId, feedback, this.state);

    // Log activity with timeEstimate
    const today = SpacedRepetitionEngine.getToday();
    this.state.history.push({
      date: today,
      questionId: questionId,
      feedback: feedback,
      timeEstimate: timeEstimate,
      timestamp: Date.now()
    });

    DataManager.save(this.state);
    this.renderDashboard();
  },

  getExpandedCategories() {
    const expanded = [];
    document.querySelectorAll('.category-questions.expanded').forEach(el => {
      expanded.push(el.id);
    });
    return expanded;
  },

  restoreExpandedCategories(expandedIds) {
    expandedIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('expanded');
    });
  },

  renderQuestionBank() {
    // Save expanded state before re-rendering
    const expandedCategories = this.getExpandedCategories();

    const container = document.getElementById('questions-content');
    let html = '';

    // Batch action bar
    html += `<div class="batch-bar">
      <span>Select a category to expand and mark questions as completed</span>
    </div>`;

    CATEGORIES.forEach(category => {
      const questions = QUESTIONS.filter(q => q.category === category);
      const completedInCategory = questions.filter(q => this.state.completedQuestions[q.id]).length;

      html += `<div class="category-group">
        <div class="category-header" data-category="${category}">
          <span class="category-name">${category}</span>
          <span class="category-count">${completedInCategory}/${questions.length} completed</span>
        </div>
        <div class="category-questions" id="cat-${category.replace(/[^a-zA-Z0-9]/g, '')}">
          <div style="padding:0.5rem 0;display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn btn-sm btn-ghost batch-complete-btn" data-category="${category}">Mark All as Completed Today</button>
          </div>
          ${questions.map(q => this.renderQuestionItem(q)).join('')}
        </div>
      </div>`;
    });

    container.innerHTML = html;
    this.bindQuestionBankEvents();

    // Restore expanded state after re-rendering
    this.restoreExpandedCategories(expandedCategories);
  },

  renderQuestionItem(q) {
    const isCompleted = !!this.state.completedQuestions[q.id];
    const schedItem = this.state.revisionSchedule.find(r => r.questionId === q.id);
    const mastery = SpacedRepetitionEngine.getMasteryLevel(schedItem);
    const diffClass = q.difficulty.toLowerCase();
    const today = SpacedRepetitionEngine.getToday();

    // Build revision status text for completed questions
    let revisionStatusHtml = '';
    if (isCompleted) {
      const revisionEntries = this.state.history.filter(
        h => h.questionId === q.id && h.feedback !== 'completed'
      );
      if (revisionEntries.length > 0) {
        const latestEntry = revisionEntries[revisionEntries.length - 1];
        const formattedDate = this.formatDisplayDate(latestEntry.date);
        revisionStatusHtml = `<div class="revision-status">Rev ${revisionEntries.length} done on ${formattedDate}</div>`;
      } else {
        const completionDate = this.state.completedQuestions[q.id].date;
        const formattedDate = this.formatDisplayDate(completionDate);
        revisionStatusHtml = `<div class="revision-status">Completed on ${formattedDate}</div>`;
      }
    }

    return `<div class="question-item ${isCompleted ? 'question-completed' : ''}">
      <div class="question-info">
        <span class="badge badge-${diffClass}">${q.difficulty}</span>
        <div class="question-title-wrap">
          <span class="question-title">${q.title}</span>
          ${revisionStatusHtml}
        </div>
      </div>
      <div class="question-actions">
        ${isCompleted ?
          `<span class="badge badge-${mastery.toLowerCase()}">${mastery}</span>` :
          `<span class="date-picker-group" id="dp-group-${q.id}" style="display:none">
            <input type="date" class="date-picker-input" id="dp-${q.id}" value="${today}" max="${today}">
            <button class="btn btn-sm btn-success confirm-complete-btn" data-id="${q.id}">Confirm</button>
            <button class="btn btn-sm btn-ghost cancel-complete-btn" data-id="${q.id}">&times;</button>
          </span>
          <button class="btn btn-sm btn-primary complete-btn" data-id="${q.id}" id="done-btn-${q.id}">Mark Complete</button>`
        }
      </div>
    </div>`;
  },

  bindQuestionBankEvents() {
    // Category expand/collapse
    document.querySelectorAll('.category-header').forEach(header => {
      header.addEventListener('click', () => {
        const category = header.dataset.category;
        const questionsEl = document.getElementById(`cat-${category.replace(/[^a-zA-Z0-9]/g, '')}`);
        questionsEl.classList.toggle('expanded');
      });
    });

    // Individual complete - show date picker
    document.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const questionId = parseInt(e.target.dataset.id);
        // Hide button, show date picker group
        const doneBtn = document.getElementById(`done-btn-${questionId}`);
        const dpGroup = document.getElementById(`dp-group-${questionId}`);
        if (doneBtn) doneBtn.style.display = 'none';
        if (dpGroup) dpGroup.style.display = 'inline-flex';
      });
    });

    // Confirm complete with selected date
    document.querySelectorAll('.confirm-complete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const questionId = parseInt(e.target.dataset.id);
        const dateInput = document.getElementById(`dp-${questionId}`);
        const selectedDate = dateInput ? dateInput.value : SpacedRepetitionEngine.getToday();
        this.markCompleted(questionId, selectedDate);
      });
    });

    // Cancel complete - hide date picker, show button again
    document.querySelectorAll('.cancel-complete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const questionId = parseInt(e.target.dataset.id);
        const doneBtn = document.getElementById(`done-btn-${questionId}`);
        const dpGroup = document.getElementById(`dp-group-${questionId}`);
        if (doneBtn) doneBtn.style.display = 'inline-flex';
        if (dpGroup) dpGroup.style.display = 'none';
      });
    });

    // Batch complete
    document.querySelectorAll('.batch-complete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const category = e.target.dataset.category;
        this.batchComplete(category);
      });
    });
  },

  markCompleted(questionId, completionDate) {
    const dateToUse = completionDate || SpacedRepetitionEngine.getToday();
    if (!this.state.completedQuestions[questionId]) {
      this.state.completedQuestions[questionId] = { date: dateToUse };

      // Schedule first revision from the completion date
      this.state = SpacedRepetitionEngine.scheduleRevision(questionId, 'good', this.state, dateToUse);

      // Log activity
      this.state.history.push({
        date: dateToUse,
        questionId: questionId,
        feedback: 'completed',
        timestamp: Date.now()
      });

      DataManager.save(this.state);
      this.renderQuestionBank();
      this.renderHeader();
    }
  },

  batchComplete(category) {
    const questions = QUESTIONS.filter(q => q.category === category);
    const today = SpacedRepetitionEngine.getToday();

    questions.forEach(q => {
      if (!this.state.completedQuestions[q.id]) {
        this.state.completedQuestions[q.id] = { date: today };
        this.state = SpacedRepetitionEngine.scheduleRevision(q.id, 'good', this.state, today);
        this.state.history.push({
          date: today,
          questionId: q.id,
          feedback: 'completed',
          timestamp: Date.now()
        });
      }
    });

    DataManager.save(this.state);
    this.renderQuestionBank();
    this.renderHeader();
  },

  renderProgress() {
    const container = document.getElementById('progress-content');
    const stats = ProgressTracker.getStats(this.state);

    let html = '';

    // Warning
    if (stats.isBehind && stats.daysRemaining > 0) {
      html += `<div class="warning-banner">
        You are behind schedule. You need ~${stats.questionsPerDay} questions/day to finish by the deadline.
      </div>`;
    }

    // Stats grid
    html += `<div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.completedCount}/${stats.totalQuestions}</div>
        <div class="stat-label">Questions Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.completionPercent}%</div>
        <div class="stat-label">Completion</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.daysRemaining > 0 ? stats.daysRemaining : 0}</div>
        <div class="stat-label">Days Remaining</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${this.state.revisionSchedule.filter(r => r.nextReviewDate <= SpacedRepetitionEngine.getToday()).length}</div>
        <div class="stat-label">Due Today</div>
      </div>
    </div>`;

    // Overall progress bar
    html += `<div class="card">
      <div class="card-header"><span class="card-title">Overall Progress</span></div>
      <div class="progress-bar" style="height:12px">
        <div class="progress-bar-fill success" style="width:${stats.completionPercent}%"></div>
      </div>
      <div style="margin-top:0.5rem;font-size:0.8125rem;color:var(--text-secondary)">
        ${stats.completedCount} of ${stats.totalQuestions} questions completed
      </div>
    </div>`;

    // Mastery breakdown
    html += `<div class="section-title" style="margin-top:1.5rem">Mastery Breakdown</div>
    <div class="mastery-breakdown">
      <div class="mastery-item">
        <div class="mastery-count" style="color:var(--mastery-new)">${stats.masteryBreakdown.New}</div>
        <div class="mastery-label">New</div>
      </div>
      <div class="mastery-item">
        <div class="mastery-count" style="color:var(--mastery-learning)">${stats.masteryBreakdown.Learning}</div>
        <div class="mastery-label">Learning</div>
      </div>
      <div class="mastery-item">
        <div class="mastery-count" style="color:var(--mastery-reviewing)">${stats.masteryBreakdown.Reviewing}</div>
        <div class="mastery-label">Reviewing</div>
      </div>
      <div class="mastery-item">
        <div class="mastery-count" style="color:var(--mastery-mastered)">${stats.masteryBreakdown.Mastered}</div>
        <div class="mastery-label">Mastered</div>
      </div>
    </div>`;

    // Activity heatmap (last 28 days)
    html += `<div class="section-title">Activity (Last 28 Days)</div>
    <div class="heatmap">`;

    const activityValues = Object.values(stats.activity);
    const maxActivity = Math.max(...activityValues, 1);

    Object.entries(stats.activity).forEach(([date, count]) => {
      let level = '';
      if (count > 0) {
        const ratio = count / maxActivity;
        if (ratio > 0.75) level = 'level-4';
        else if (ratio > 0.5) level = 'level-3';
        else if (ratio > 0.25) level = 'level-2';
        else level = 'level-1';
      }
      html += `<div class="heatmap-cell ${level}" title="${date}: ${count} activities"></div>`;
    });

    html += `</div>`;

    container.innerHTML = html;
  },

  renderSettings() {
    document.getElementById('budget-input').value = this.state.settings.dailyBudget || DEFAULT_DAILY_BUDGET;
    document.getElementById('deadline-input').value = this.state.settings.deadline || DEADLINE;
    document.getElementById('autostart-timer-input').checked = !!this.state.settings.autoStartTimer;

    // Render history
    const historyContainer = document.getElementById('history-log');
    const recent = this.state.history.slice(-50).reverse();

    if (recent.length === 0) {
      historyContainer.innerHTML = '<div class="empty-state"><p>No activity recorded yet.</p></div>';
    } else {
      historyContainer.innerHTML = recent.map(h => {
        const question = QUESTIONS.find(q => q.id === h.questionId);
        const title = question ? question.title : `Question #${h.questionId}`;
        return `<div class="log-entry">
          <div class="log-date">${h.date}</div>
          <div>${title} - <em>${h.feedback}</em></div>
        </div>`;
      }).join('');
    }
  },

  // ==================== DECORATIVE WIDGETS ====================
  clockInterval: null,
  quoteInterval: null,
  studyTimerInterval: null,
  studyTimerElapsed: 0,

  STUDY_TIMER_KEY: 'dsa_study_timer_state',

  QUOTES: [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Code is like humor. When you have to explain it, it is bad.", author: "Cory House" },
    { text: "Consistency is more important than intensity.", author: "Unknown" },
    { text: "Every expert was once a beginner.", author: "Helen Hayes" },
    { text: "Practice makes permanent, not perfect.", author: "Unknown" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Repetition is the mother of learning.", author: "Latin Proverb" }
  ],

  startClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);

    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const hourDeg = (hours * 30) + (minutes * 0.5);
      const minDeg = minutes * 6;
      const secDeg = seconds * 6;

      const hourHand = document.getElementById('clock-hour');
      const minHand = document.getElementById('clock-minute');
      const secHand = document.getElementById('clock-second');
      const digital = document.getElementById('clock-digital');

      if (hourHand) hourHand.style.transform = `rotate(${hourDeg}deg)`;
      if (minHand) minHand.style.transform = `rotate(${minDeg}deg)`;
      if (secHand) secHand.style.transform = `rotate(${secDeg}deg)`;
      if (digital) {
        digital.textContent = now.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
      }
    };

    updateClock();
    this.clockInterval = setInterval(updateClock, 1000);
  },

  rotateQuote() {
    if (this.quoteInterval) clearInterval(this.quoteInterval);

    let currentIndex = Math.floor(Math.random() * this.QUOTES.length);

    const showQuote = () => {
      const textEl = document.getElementById('quote-text');
      const authorEl = document.getElementById('quote-author');
      if (!textEl || !authorEl) return;

      textEl.classList.add('quote-fade-out');
      authorEl.classList.add('quote-fade-out');

      setTimeout(() => {
        const quote = this.QUOTES[currentIndex];
        textEl.textContent = `"${quote.text}"`;
        authorEl.textContent = `- ${quote.author}`;
        textEl.classList.remove('quote-fade-out');
        authorEl.classList.remove('quote-fade-out');
        currentIndex = (currentIndex + 1) % this.QUOTES.length;
      }, 500);
    };

    showQuote();
    this.quoteInterval = setInterval(showQuote, 8000);
  },

  // ==================== STUDY SESSION TIMER ====================
  getStudyTimerState() {
    try {
      const raw = localStorage.getItem(this.STUDY_TIMER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Reset if stored date is not today
        const today = SpacedRepetitionEngine.getToday();
        if (parsed.date !== today) {
          return { date: today, elapsedSeconds: 0 };
        }
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    return { date: SpacedRepetitionEngine.getToday(), elapsedSeconds: 0 };
  },

  saveStudyTimerState(elapsedSeconds) {
    const timerState = {
      date: SpacedRepetitionEngine.getToday(),
      elapsedSeconds: elapsedSeconds
    };
    try {
      localStorage.setItem(this.STUDY_TIMER_KEY, JSON.stringify(timerState));
    } catch (e) {
      // ignore quota errors for timer
    }
  },

  getRemainingStudyBudget() {
    const dailyBudget = this.state.settings.dailyBudget || DEFAULT_DAILY_BUDGET;
    const timerState = this.getStudyTimerState();
    const timerRemainingSeconds = Math.max(0, (dailyBudget * 60) - (timerState.elapsedSeconds || 0));
    const timerRemainingMinutes = Math.ceil(timerRemainingSeconds / 60);

    return {
      dailyBudget,
      timerState,
      timerRemainingSeconds,
      timerRemainingMinutes,
      remainingMinutes: timerRemainingMinutes
    };
  },

  bindStudyTimer() {
    const startBtn = document.getElementById('study-timer-start');
    const resetBtn = document.getElementById('study-timer-reset');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (this.studyTimerInterval) {
          this.pauseStudyTimer();
        } else {
          this.startStudyTimer();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetStudyTimer();
      });
    }
  },

  startStudyTimer() {
    if (this.studyTimerInterval) return; // already running

    const timerState = this.getStudyTimerState();
    this.studyTimerElapsed = timerState.elapsedSeconds;
    const totalBudgetSec = this.state.settings.dailyBudget * 60;

    // If already exceeded budget, don't start
    if (this.studyTimerElapsed >= totalBudgetSec) {
      alert('Study session complete! Your daily budget has been used up. Reset to start a new session.');
      return;
    }

    this.studyTimerInterval = setInterval(() => {
      this.studyTimerElapsed++;
      this.saveStudyTimerState(this.studyTimerElapsed);
      this.updateStudyTimerDisplay();

      // Check if time is up
      if (this.studyTimerElapsed >= totalBudgetSec) {
        this.pauseStudyTimer();
        this.showStudyTimerAlert();
      }
    }, 1000);

    const startBtn = document.getElementById('study-timer-start');
    if (startBtn) startBtn.textContent = 'Pause';
  },

  pauseStudyTimer() {
    if (this.studyTimerInterval) {
      clearInterval(this.studyTimerInterval);
      this.studyTimerInterval = null;
    }
    const startBtn = document.getElementById('study-timer-start');
    if (startBtn) startBtn.textContent = 'Start';
  },

  resetStudyTimer() {
    this.pauseStudyTimer();
    this.studyTimerElapsed = 0;
    this.saveStudyTimerState(0);
    this.updateStudyTimerDisplay();
  },

  updateStudyTimerDisplay() {
    const totalBudgetSec = this.state.settings.dailyBudget * 60;
    const remainingSec = Math.max(0, totalBudgetSec - this.studyTimerElapsed);
    const remainingMin = Math.floor(remainingSec / 60);
    const remainingSecPart = remainingSec % 60;
    const elapsedMin = Math.floor(this.studyTimerElapsed / 60);
    const elapsedSecPart = this.studyTimerElapsed % 60;

    const display = document.getElementById('study-timer-display');
    const elapsed = document.getElementById('study-timer-elapsed');

    if (display) {
      display.textContent = `${String(remainingMin).padStart(2, '0')}:${String(remainingSecPart).padStart(2, '0')}`;
      // Add urgency class when less than 5 minutes remain
      if (remainingSec <= 300 && remainingSec > 0) {
        display.classList.add('study-timer-urgent');
      } else {
        display.classList.remove('study-timer-urgent');
      }
      if (remainingSec === 0) {
        display.classList.add('study-timer-done');
      } else {
        display.classList.remove('study-timer-done');
      }
    }
    if (elapsed) {
      elapsed.textContent = `Elapsed: ${String(elapsedMin).padStart(2, '0')}:${String(elapsedSecPart).padStart(2, '0')}`;
    }
  },

  showStudyTimerAlert() {
    // Show a non-blocking notification
    let banner = document.getElementById('study-timer-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'study-timer-banner';
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:1rem 1.5rem;background:var(--neo-mint);color:#1a1a1a;text-align:center;z-index:10000;font-size:1rem;font-weight:700;border-bottom:3px solid #1a1a1a;';
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '\u00d7';
      closeBtn.style.cssText = 'position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#1a1a1a;font-size:1.5rem;cursor:pointer;font-weight:900;';
      closeBtn.addEventListener('click', () => banner.remove());
      banner.appendChild(document.createTextNode('Study session complete! Great work today.'));
      banner.appendChild(closeBtn);
      document.body.prepend(banner);
    }
  },

  showSaveError(message) {
    // Show a non-blocking notification banner for save errors
    let banner = document.getElementById('save-error-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'save-error-banner';
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:0.75rem 1rem;background:var(--danger, #e74c3c);color:#fff;text-align:center;z-index:10000;font-size:0.875rem;';
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '\u00d7';
      closeBtn.style.cssText = 'position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;font-size:1.25rem;cursor:pointer;';
      closeBtn.addEventListener('click', () => banner.remove());
      banner.appendChild(closeBtn);
      document.body.prepend(banner);
    }
    // Set message as first text node
    banner.childNodes[0] && banner.childNodes[0].nodeType === 3
      ? banner.childNodes[0].textContent = message
      : banner.insertBefore(document.createTextNode(message), banner.firstChild);
  },

  formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  showModal(message, onConfirm) {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-message').textContent = message;
    overlay.classList.add('active');

    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');

    const cleanup = () => {
      overlay.classList.remove('active');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };

    const handleConfirm = () => { cleanup(); onConfirm(); };
    const handleCancel = () => { cleanup(); };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
