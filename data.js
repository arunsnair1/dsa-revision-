// Neetcode 150 Question Bank
const QUESTIONS = [
  // Arrays & Hashing (9)
  {id:1,title:"Contains Duplicate",category:"Arrays & Hashing",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/contains-duplicate"},
  {id:2,title:"Valid Anagram",category:"Arrays & Hashing",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/valid-anagram"},
  {id:3,title:"Two Sum",category:"Arrays & Hashing",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/two-sum"},
  {id:4,title:"Group Anagrams",category:"Arrays & Hashing",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/group-anagrams"},
  {id:5,title:"Top K Frequent Elements",category:"Arrays & Hashing",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/top-k-frequent-elements"},
  {id:6,title:"Encode and Decode Strings",category:"Arrays & Hashing",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/encode-and-decode-strings"},
  {id:7,title:"Product of Array Except Self",category:"Arrays & Hashing",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/product-of-array-except-self"},
  {id:8,title:"Valid Sudoku",category:"Arrays & Hashing",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/valid-sudoku"},
  {id:9,title:"Longest Consecutive Sequence",category:"Arrays & Hashing",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/longest-consecutive-sequence"},

  // Two Pointers (5)
  {id:10,title:"Valid Palindrome",category:"Two Pointers",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/valid-palindrome"},
  {id:11,title:"Two Sum II",category:"Two Pointers",difficulty:"Medium",time:15,url:"https://neetcode.io/problems/two-sum-ii"},
  {id:12,title:"3Sum",category:"Two Pointers",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/three-sum"},
  {id:13,title:"Container With Most Water",category:"Two Pointers",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/container-with-most-water"},
  {id:14,title:"Trapping Rain Water",category:"Two Pointers",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/trapping-rain-water"},

  // Sliding Window (6)
  {id:15,title:"Best Time to Buy and Sell Stock",category:"Sliding Window",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/best-time-to-buy-and-sell-stock"},
  {id:16,title:"Longest Substring Without Repeating Characters",category:"Sliding Window",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/longest-substring-without-repeating-characters"},
  {id:17,title:"Longest Repeating Character Replacement",category:"Sliding Window",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/longest-repeating-character-replacement"},
  {id:18,title:"Permutation in String",category:"Sliding Window",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/permutation-in-string"},
  {id:19,title:"Minimum Window Substring",category:"Sliding Window",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/minimum-window-substring"},
  {id:20,title:"Sliding Window Maximum",category:"Sliding Window",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/sliding-window-maximum"},

  // Stack (7)
  {id:21,title:"Valid Parentheses",category:"Stack",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/valid-parentheses"},
  {id:22,title:"Min Stack",category:"Stack",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/min-stack"},
  {id:23,title:"Evaluate Reverse Polish Notation",category:"Stack",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/evaluate-reverse-polish-notation"},
  {id:24,title:"Generate Parentheses",category:"Stack",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/generate-parentheses"},
  {id:25,title:"Daily Temperatures",category:"Stack",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/daily-temperatures"},
  {id:26,title:"Car Fleet",category:"Stack",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/car-fleet"},
  {id:27,title:"Largest Rectangle in Histogram",category:"Stack",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/largest-rectangle-in-histogram"},

  // Binary Search (7)
  {id:28,title:"Binary Search",category:"Binary Search",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/binary-search"},
  {id:29,title:"Search a 2D Matrix",category:"Binary Search",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/search-a-2d-matrix"},
  {id:30,title:"Koko Eating Bananas",category:"Binary Search",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/koko-eating-bananas"},
  {id:31,title:"Find Minimum in Rotated Sorted Array",category:"Binary Search",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/find-minimum-in-rotated-sorted-array"},
  {id:32,title:"Search in Rotated Sorted Array",category:"Binary Search",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/search-in-rotated-sorted-array"},
  {id:33,title:"Time Based Key Value Store",category:"Binary Search",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/time-based-key-value-store"},
  {id:34,title:"Median of Two Sorted Arrays",category:"Binary Search",difficulty:"Hard",time:35,url:"https://neetcode.io/problems/median-of-two-sorted-arrays"},

  // Linked List (11)
  {id:35,title:"Reverse Linked List",category:"Linked List",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/reverse-linked-list"},
  {id:36,title:"Merge Two Sorted Lists",category:"Linked List",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/merge-two-sorted-lists"},
  {id:37,title:"Reorder List",category:"Linked List",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/reorder-list"},
  {id:38,title:"Remove Nth Node From End of List",category:"Linked List",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/remove-nth-node-from-end-of-list"},
  {id:39,title:"Copy List with Random Pointer",category:"Linked List",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/copy-list-with-random-pointer"},
  {id:40,title:"Add Two Numbers",category:"Linked List",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/add-two-numbers"},
  {id:41,title:"Linked List Cycle",category:"Linked List",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/linked-list-cycle"},
  {id:42,title:"Find the Duplicate Number",category:"Linked List",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/find-the-duplicate-number"},
  {id:43,title:"LRU Cache",category:"Linked List",difficulty:"Medium",time:30,url:"https://neetcode.io/problems/lru-cache"},
  {id:44,title:"Merge K Sorted Lists",category:"Linked List",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/merge-k-sorted-lists"},
  {id:45,title:"Reverse Nodes in K-Group",category:"Linked List",difficulty:"Hard",time:35,url:"https://neetcode.io/problems/reverse-nodes-in-k-group"},

  // Trees (15)
  {id:46,title:"Invert Binary Tree",category:"Trees",difficulty:"Easy",time:10,url:"https://neetcode.io/problems/invert-binary-tree"},
  {id:47,title:"Maximum Depth of Binary Tree",category:"Trees",difficulty:"Easy",time:10,url:"https://neetcode.io/problems/maximum-depth-of-binary-tree"},
  {id:48,title:"Diameter of Binary Tree",category:"Trees",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/diameter-of-binary-tree"},
  {id:49,title:"Balanced Binary Tree",category:"Trees",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/balanced-binary-tree"},
  {id:50,title:"Same Tree",category:"Trees",difficulty:"Easy",time:10,url:"https://neetcode.io/problems/same-tree"},
  {id:51,title:"Subtree of Another Tree",category:"Trees",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/subtree-of-another-tree"},
  {id:52,title:"Lowest Common Ancestor of a BST",category:"Trees",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/lowest-common-ancestor-of-a-bst"},
  {id:53,title:"Binary Tree Level Order Traversal",category:"Trees",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/binary-tree-level-order-traversal"},
  {id:54,title:"Binary Tree Right Side View",category:"Trees",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/binary-tree-right-side-view"},
  {id:55,title:"Count Good Nodes in Binary Tree",category:"Trees",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/count-good-nodes-in-binary-tree"},
  {id:56,title:"Validate Binary Search Tree",category:"Trees",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/validate-binary-search-tree"},
  {id:57,title:"Kth Smallest Element in a BST",category:"Trees",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/kth-smallest-element-in-a-bst"},
  {id:58,title:"Construct Binary Tree from Preorder and Inorder",category:"Trees",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/construct-binary-tree-from-preorder-and-inorder"},
  {id:59,title:"Binary Tree Maximum Path Sum",category:"Trees",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/binary-tree-maximum-path-sum"},
  {id:60,title:"Serialize and Deserialize Binary Tree",category:"Trees",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/serialize-and-deserialize-binary-tree"},

  // Tries (3)
  {id:61,title:"Implement Trie",category:"Tries",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/implement-trie"},
  {id:62,title:"Design Add and Search Words Data Structure",category:"Tries",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/design-add-and-search-words-data-structure"},
  {id:63,title:"Word Search II",category:"Tries",difficulty:"Hard",time:35,url:"https://neetcode.io/problems/word-search-ii"},

  // Heap / Priority Queue (7)
  {id:64,title:"Kth Largest Element in a Stream",category:"Heap / Priority Queue",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/kth-largest-element-in-a-stream"},
  {id:65,title:"Last Stone Weight",category:"Heap / Priority Queue",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/last-stone-weight"},
  {id:66,title:"K Closest Points to Origin",category:"Heap / Priority Queue",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/k-closest-points-to-origin"},
  {id:67,title:"Kth Largest Element in an Array",category:"Heap / Priority Queue",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/kth-largest-element-in-an-array"},
  {id:68,title:"Task Scheduler",category:"Heap / Priority Queue",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/task-scheduler"},
  {id:69,title:"Design Twitter",category:"Heap / Priority Queue",difficulty:"Medium",time:30,url:"https://neetcode.io/problems/design-twitter"},
  {id:70,title:"Find Median from Data Stream",category:"Heap / Priority Queue",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/find-median-from-data-stream"},

  // Backtracking (9)
  {id:71,title:"Subsets",category:"Backtracking",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/subsets"},
  {id:72,title:"Combination Sum",category:"Backtracking",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/combination-sum"},
  {id:73,title:"Permutations",category:"Backtracking",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/permutations"},
  {id:74,title:"Subsets II",category:"Backtracking",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/subsets-ii"},
  {id:75,title:"Combination Sum II",category:"Backtracking",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/combination-sum-ii"},
  {id:76,title:"Word Search",category:"Backtracking",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/word-search"},
  {id:77,title:"Palindrome Partitioning",category:"Backtracking",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/palindrome-partitioning"},
  {id:78,title:"Letter Combinations of a Phone Number",category:"Backtracking",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/letter-combinations-of-a-phone-number"},
  {id:79,title:"N-Queens",category:"Backtracking",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/n-queens"},

  // Graphs (13)
  {id:80,title:"Number of Islands",category:"Graphs",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/number-of-islands"},
  {id:81,title:"Max Area of Island",category:"Graphs",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/max-area-of-island"},
  {id:82,title:"Clone Graph",category:"Graphs",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/clone-graph"},
  {id:83,title:"Walls and Gates",category:"Graphs",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/walls-and-gates"},
  {id:84,title:"Rotting Oranges",category:"Graphs",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/rotting-oranges"},
  {id:85,title:"Pacific Atlantic Water Flow",category:"Graphs",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/pacific-atlantic-water-flow"},
  {id:86,title:"Surrounded Regions",category:"Graphs",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/surrounded-regions"},
  {id:87,title:"Course Schedule",category:"Graphs",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/course-schedule"},
  {id:88,title:"Course Schedule II",category:"Graphs",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/course-schedule-ii"},
  {id:89,title:"Graph Valid Tree",category:"Graphs",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/graph-valid-tree"},
  {id:90,title:"Number of Connected Components in an Undirected Graph",category:"Graphs",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/number-of-connected-components-in-an-undirected-graph"},
  {id:91,title:"Redundant Connection",category:"Graphs",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/redundant-connection"},
  {id:92,title:"Word Ladder",category:"Graphs",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/word-ladder"},

  // Advanced Graphs (6)
  {id:93,title:"Reconstruct Itinerary",category:"Advanced Graphs",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/reconstruct-itinerary"},
  {id:94,title:"Min Cost to Connect All Points",category:"Advanced Graphs",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/min-cost-to-connect-all-points"},
  {id:95,title:"Network Delay Time",category:"Advanced Graphs",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/network-delay-time"},
  {id:96,title:"Swim in Rising Water",category:"Advanced Graphs",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/swim-in-rising-water"},
  {id:97,title:"Alien Dictionary",category:"Advanced Graphs",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/alien-dictionary"},
  {id:98,title:"Cheapest Flights Within K Stops",category:"Advanced Graphs",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/cheapest-flights-within-k-stops"},

  // 1D Dynamic Programming (12)
  {id:99,title:"Climbing Stairs",category:"1D DP",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/climbing-stairs"},
  {id:100,title:"Min Cost Climbing Stairs",category:"1D DP",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/min-cost-climbing-stairs"},
  {id:101,title:"House Robber",category:"1D DP",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/house-robber"},
  {id:102,title:"House Robber II",category:"1D DP",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/house-robber-ii"},
  {id:103,title:"Longest Palindromic Substring",category:"1D DP",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/longest-palindromic-substring"},
  {id:104,title:"Palindromic Substrings",category:"1D DP",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/palindromic-substrings"},
  {id:105,title:"Decode Ways",category:"1D DP",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/decode-ways"},
  {id:106,title:"Coin Change",category:"1D DP",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/coin-change"},
  {id:107,title:"Maximum Product Subarray",category:"1D DP",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/maximum-product-subarray"},
  {id:108,title:"Word Break",category:"1D DP",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/word-break"},
  {id:109,title:"Longest Increasing Subsequence",category:"1D DP",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/longest-increasing-subsequence"},
  {id:110,title:"Partition Equal Subset Sum",category:"1D DP",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/partition-equal-subset-sum"},

  // 2D Dynamic Programming (11)
  {id:111,title:"Unique Paths",category:"2D DP",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/unique-paths"},
  {id:112,title:"Longest Common Subsequence",category:"2D DP",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/longest-common-subsequence"},
  {id:113,title:"Best Time to Buy and Sell Stock with Cooldown",category:"2D DP",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/best-time-to-buy-and-sell-stock-with-cooldown"},
  {id:114,title:"Coin Change II",category:"2D DP",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/coin-change-ii"},
  {id:115,title:"Target Sum",category:"2D DP",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/target-sum"},
  {id:116,title:"Interleaving String",category:"2D DP",difficulty:"Medium",time:30,url:"https://neetcode.io/problems/interleaving-string"},
  {id:117,title:"Longest Increasing Path in a Matrix",category:"2D DP",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/longest-increasing-path-in-a-matrix"},
  {id:118,title:"Distinct Subsequences",category:"2D DP",difficulty:"Hard",time:30,url:"https://neetcode.io/problems/distinct-subsequences"},
  {id:119,title:"Edit Distance",category:"2D DP",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/edit-distance"},
  {id:120,title:"Burst Balloons",category:"2D DP",difficulty:"Hard",time:35,url:"https://neetcode.io/problems/burst-balloons"},
  {id:121,title:"Regular Expression Matching",category:"2D DP",difficulty:"Hard",time:35,url:"https://neetcode.io/problems/regular-expression-matching"},

  // Greedy (8)
  {id:122,title:"Maximum Subarray",category:"Greedy",difficulty:"Medium",time:15,url:"https://neetcode.io/problems/maximum-subarray"},
  {id:123,title:"Jump Game",category:"Greedy",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/jump-game"},
  {id:124,title:"Jump Game II",category:"Greedy",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/jump-game-ii"},
  {id:125,title:"Gas Station",category:"Greedy",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/gas-station"},
  {id:126,title:"Hand of Straights",category:"Greedy",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/hand-of-straights"},
  {id:127,title:"Merge Triplets to Form Target Triplet",category:"Greedy",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/merge-triplets-to-form-target-triplet"},
  {id:128,title:"Partition Labels",category:"Greedy",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/partition-labels"},
  {id:129,title:"Valid Parenthesis String",category:"Greedy",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/valid-parenthesis-string"},

  // Intervals (6)
  {id:130,title:"Insert Interval",category:"Intervals",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/insert-interval"},
  {id:131,title:"Merge Intervals",category:"Intervals",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/merge-intervals"},
  {id:132,title:"Non-Overlapping Intervals",category:"Intervals",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/non-overlapping-intervals"},
  {id:133,title:"Meeting Rooms",category:"Intervals",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/meeting-rooms"},
  {id:134,title:"Meeting Rooms II",category:"Intervals",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/meeting-rooms-ii"},
  {id:135,title:"Minimum Interval to Include Each Query",category:"Intervals",difficulty:"Hard",time:35,url:"https://neetcode.io/problems/minimum-interval-to-include-each-query"},

  // Math & Geometry (8)
  {id:136,title:"Rotate Image",category:"Math & Geometry",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/rotate-image"},
  {id:137,title:"Spiral Matrix",category:"Math & Geometry",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/spiral-matrix"},
  {id:138,title:"Set Matrix Zeroes",category:"Math & Geometry",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/set-matrix-zeroes"},
  {id:139,title:"Happy Number",category:"Math & Geometry",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/happy-number"},
  {id:140,title:"Plus One",category:"Math & Geometry",difficulty:"Easy",time:10,url:"https://neetcode.io/problems/plus-one"},
  {id:141,title:"Pow(x, n)",category:"Math & Geometry",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/pow-x-n"},
  {id:142,title:"Multiply Strings",category:"Math & Geometry",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/multiply-strings"},
  {id:143,title:"Detect Squares",category:"Math & Geometry",difficulty:"Medium",time:25,url:"https://neetcode.io/problems/detect-squares"},

  // Bit Manipulation (7)
  {id:144,title:"Single Number",category:"Bit Manipulation",difficulty:"Easy",time:10,url:"https://neetcode.io/problems/single-number"},
  {id:145,title:"Number of 1 Bits",category:"Bit Manipulation",difficulty:"Easy",time:10,url:"https://neetcode.io/problems/number-of-1-bits"},
  {id:146,title:"Counting Bits",category:"Bit Manipulation",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/counting-bits"},
  {id:147,title:"Reverse Bits",category:"Bit Manipulation",difficulty:"Easy",time:15,url:"https://neetcode.io/problems/reverse-bits"},
  {id:148,title:"Missing Number",category:"Bit Manipulation",difficulty:"Easy",time:10,url:"https://neetcode.io/problems/missing-number"},
  {id:149,title:"Sum of Two Integers",category:"Bit Manipulation",difficulty:"Medium",time:20,url:"https://neetcode.io/problems/sum-of-two-integers"},
  {id:150,title:"Reverse Integer",category:"Bit Manipulation",difficulty:"Medium",time:15,url:"https://neetcode.io/problems/reverse-integer"}
];

const CATEGORIES = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1D DP",
  "2D DP",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation"
];

// Spaced repetition intervals in days
const BASE_INTERVALS = [1, 3, 7, 14, 30];

// Mastery levels
const MASTERY = {
  NEW: "New",
  LEARNING: "Learning",
  REVIEWING: "Reviewing",
  MASTERED: "Mastered"
};

// Time estimates in minutes
const TIME_READ_NOTES = 5;
const TIME_RE_SOLVE = 20;

// Daily time budget in minutes
const DEFAULT_DAILY_BUDGET = 180;

// Deadline
const DEADLINE = "2025-06-25";
