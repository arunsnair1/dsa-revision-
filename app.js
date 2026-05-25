// ==================== DATA MANAGER ====================
const DataManager = {
  STORAGE_KEY: 'dsa_spaced_rep_data',

  getDefaultState() {
    return {
      completedQuestions: {},
      revisionSchedule: [],
      settings: {
        dailyBudget: DEFAULT_DAILY_BUDGET,
        deadline: DEADLINE
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
    }
  },

  exportData(state) {
    return JSON.stringify(state, null, 2);
  },

  importData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.completedQuestions && data.revisionSchedule) {
        return data;
      }
    } catch (e) {
      // invalid
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

  scheduleRevision(questionId, feedback, state) {
    const today = this.getToday();
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
      } else {
        existing.successCount = Math.max(0, (existing.successCount || 0) - 1);
      }
    }

    return state;
  },

  getToday() {
    return new Date().toISOString().split('T')[0];
  },

  addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  },

  getDaysDiff(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  }
};

// ==================== SCHEDULER ====================
const Scheduler = {
  getDailyItems(state) {
    const today = SpacedRepetitionEngine.getToday();
    const budget = state.settings.dailyBudget || DEFAULT_DAILY_BUDGET;

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
        // If struggling and overdue, try to demote to read-notes to fit
        if (item.type === 're-solve' && totalTime + TIME_READ_NOTES <= budget) {
          item.type = 'read-notes';
          item.timeEstimate = TIME_READ_NOTES;
          scheduled.push(item);
          totalTime += item.timeEstimate;
        } else {
          deferred.push(item);
        }
      }
    }

    return { scheduled, deferred, totalTime, budget };
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
    const { scheduled, deferred, totalTime, budget } = Scheduler.getDailyItems(this.state);
    const stats = ProgressTracker.getStats(this.state);

    let html = '';

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
    html += `<div class="time-budget">
      <div class="time-budget-info">
        <div class="time-budget-label">Today's Study Time</div>
        <div class="time-budget-value">${totalTime} / ${budget} min</div>
      </div>
      <div style="width:120px">
        <div class="progress-bar">
          <div class="progress-bar-fill accent" style="width:${Math.min(100, (totalTime/budget)*100)}%"></div>
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
          <p class="section-subtitle">These items exceed today's ${budget}-minute budget</p>
          ${deferred.map(item => this.renderReviewItem(item, true)).join('')}
        </div>`;
      }
    }

    container.innerHTML = html;
    this.bindDashboardEvents();
  },

  renderReviewItem(item, isDeferred) {
    const overdueText = item.daysOverdue > 0 ? `<span style="color:var(--danger)">${item.daysOverdue}d overdue</span>` : '';
    const masteryClass = item.mastery.toLowerCase();

    return `<div class="review-item ${isDeferred ? 'deferred' : ''}">
      <div class="review-item-left">
        <span class="badge badge-${masteryClass}">${item.mastery}</span>
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
    this.state = SpacedRepetitionEngine.scheduleRevision(questionId, feedback, this.state);

    // Log activity
    const today = SpacedRepetitionEngine.getToday();
    this.state.history.push({
      date: today,
      questionId: questionId,
      feedback: feedback,
      timestamp: Date.now()
    });

    DataManager.save(this.state);
    this.renderDashboard();
  },

  renderQuestionBank() {
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
  },

  renderQuestionItem(q) {
    const isCompleted = !!this.state.completedQuestions[q.id];
    const schedItem = this.state.revisionSchedule.find(r => r.questionId === q.id);
    const mastery = SpacedRepetitionEngine.getMasteryLevel(schedItem);
    const diffClass = q.difficulty.toLowerCase();

    return `<div class="question-item ${isCompleted ? 'question-completed' : ''}">
      <div class="question-info">
        <span class="badge badge-${diffClass}">${q.difficulty}</span>
        <span class="question-title">${q.title}</span>
      </div>
      <div class="question-actions">
        ${isCompleted ?
          `<span class="badge badge-${mastery.toLowerCase()}">${mastery}</span>` :
          `<button class="btn btn-sm btn-primary complete-btn" data-id="${q.id}">Mark Complete</button>`
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

    // Individual complete
    document.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const questionId = parseInt(e.target.dataset.id);
        this.markCompleted(questionId);
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

  markCompleted(questionId) {
    const today = SpacedRepetitionEngine.getToday();
    if (!this.state.completedQuestions[questionId]) {
      this.state.completedQuestions[questionId] = { date: today };

      // Schedule first revision
      this.state = SpacedRepetitionEngine.scheduleRevision(questionId, 'good', this.state);

      // Log activity
      this.state.history.push({
        date: today,
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
        this.state = SpacedRepetitionEngine.scheduleRevision(q.id, 'good', this.state);
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
