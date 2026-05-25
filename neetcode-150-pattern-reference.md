# Neetcode 150 Pattern Reference Guide

## How to Use This File

Upload this file as **project context** to Claude, Gemini, or any AI assistant. It gives the AI everything it needs to:

- Generate pattern-focused revision notes for any Neetcode 150 question
- Explain WHY a pattern applies (not just what the solution is)
- Connect problems to each other through shared patterns
- Create spaced repetition prompts that test pattern recognition
- Suggest which problems to tackle next based on pattern mastery

**When asking for help, say something like:**
> "Using the pattern reference, generate revision notes for [Problem Name]. Focus on the pattern hook, the template adaptation, and how it connects to other problems I've solved."

---

## Pattern Decision Flowchart

Use this text-based decision tree when you see a new problem and need to identify the pattern:

```
START: Read the problem statement
|
|-- Is the input a string/array and you need to find/check something?
|   |-- Is it sorted (or can it be sorted)?
|   |   |-- Need to find a target value? --> BINARY SEARCH
|   |   |-- Need pairs that satisfy a condition? --> TWO POINTERS
|   |   |-- Need triplets? --> TWO POINTERS (sort + fix one)
|   |
|   |-- Need a contiguous subarray/substring?
|   |   |-- Fixed or variable window with a constraint? --> SLIDING WINDOW
|   |
|   |-- Need frequency counts, grouping, or deduplication? --> ARRAYS & HASHING
|   |-- Need to validate nesting/matching? --> STACK
|   |-- Need to track a "next greater/smaller" element? --> STACK (monotonic)
|
|-- Does it ask for ALL combinations/permutations/subsets?
|   --> BACKTRACKING
|
|-- Does it ask for min/max/optimal value?
|   |-- Can you make a locally optimal choice at each step? --> GREEDY
|   |-- Do subproblems overlap (same inputs recalculated)? --> DYNAMIC PROGRAMMING
|   |   |-- Single array/string? --> 1-D DP
|   |   |-- Two arrays/strings or grid? --> 2-D DP
|   |-- Need min/max from a stream or top-K? --> HEAP / PRIORITY QUEUE
|
|-- Is the input a graph or grid?
|   |-- Need to explore/traverse all connected nodes? --> GRAPHS (BFS/DFS)
|   |-- Need shortest path with weights? --> ADVANCED GRAPHS (Dijkstra/Bellman-Ford)
|   |-- Need minimum spanning tree? --> ADVANCED GRAPHS (Prim/Kruskal)
|   |-- Need topological ordering? --> ADVANCED GRAPHS (Topological Sort)
|
|-- Is the input a tree?
|   |-- Need level-by-level processing? --> TREES (BFS)
|   |-- Need path/depth/ancestor info? --> TREES (DFS)
|   |-- Need prefix-based string operations? --> TRIES
|
|-- Is the input a linked list?
|   |-- Need to detect cycle or find middle? --> LINKED LIST (fast/slow pointers)
|   |-- Need to reverse or reorder? --> LINKED LIST (pointer manipulation)
|
|-- Does it involve merging/overlapping time ranges? --> INTERVALS
|
|-- Does it involve bit-level operations or XOR tricks? --> BIT MANIPULATION
|
|-- Does it involve matrix rotation, spiral, or number math? --> MATH & GEOMETRY
```

---

## Pattern 1: Arrays & Hashing

### Questions (9)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Contains Duplicate | Easy |
| 2 | Valid Anagram | Easy |
| 3 | Two Sum | Easy |
| 4 | Group Anagrams | Medium |
| 5 | Top K Frequent Elements | Medium |
| 6 | Encode and Decode Strings | Medium |
| 7 | Product of Array Except Self | Medium |
| 8 | Valid Sudoku | Medium |
| 9 | Longest Consecutive Sequence | Medium |

### The Hook
- "Find duplicates" or "check if exists" --> HashSet
- "Count frequency" or "group by property" --> HashMap
- "Find pair with target sum" --> HashMap (complement lookup)
- Any time brute force is O(n^2) and you need O(n) --> HashMap trades space for time

### Core Template
```python
def array_hash_pattern(arr):
    seen = {}  # or set()
    for i, val in enumerate(arr):
        complement = target - val  # or whatever lookup you need
        if complement in seen:
            return [seen[complement], i]
        seen[val] = i  # store value -> index (or value -> count)
    return []
```

### Key Insight
A HashMap lets you answer "have I seen X before?" in O(1). Convert any O(n^2) nested loop into O(n) by storing what you have seen and checking if the complement/match exists.

### Common Variations
- **Set for existence**: Contains Duplicate, Longest Consecutive Sequence
- **Map for frequency**: Top K Frequent, Group Anagrams
- **Map for complement**: Two Sum
- **Map for encoding**: Encode/Decode Strings
- **Prefix/suffix products**: Product of Array Except Self (no division trick)

### Time/Space Complexity
- Time: O(n) for single pass with hash lookups
- Space: O(n) for the hash map/set

### Gotchas
1. Forgetting to handle duplicate keys in HashMap (use list of values or count)
2. Using sorting O(n log n) when hashing gives O(n)
3. Off-by-one with index storage (storing index vs value)
4. Not considering that hash collisions can degrade to O(n) in worst case
5. For Longest Consecutive Sequence: only start counting from sequence beginnings (check if num-1 NOT in set)

### Pattern Connections
- Combines with **Two Pointers** (sorted array complement search)
- Combines with **Sliding Window** (tracking character frequencies in window)
- Combines with **Heap** (Top K after frequency counting)

---

## Pattern 2: Two Pointers

### Questions (5)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Valid Palindrome | Easy |
| 2 | Two Sum II (Input Array is Sorted) | Medium |
| 3 | 3Sum | Medium |
| 4 | Container With Most Water | Medium |
| 5 | Trapping Rain Water | Hard |

### The Hook
- Input is **sorted** (or can be sorted)
- Need to find **pairs** that satisfy a condition
- "Two elements" + "sorted array" = Two Pointers
- Need to shrink/expand from both ends
- Palindrome check (compare from outside in)

### Core Template
```python
def two_pointer_pattern(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        current = arr[left] + arr[right]  # or some condition
        if current == target:
            return [left, right]
        elif current < target:
            left += 1   # need bigger, move left pointer right
        else:
            right -= 1  # need smaller, move right pointer left
    return []
```

### Key Insight
When the array is sorted, two pointers from opposite ends give you a way to systematically eliminate possibilities. Moving left pointer increases the sum; moving right pointer decreases it. You never need to re-check eliminated pairs.

### Common Variations
- **Opposite ends**: Palindrome, Two Sum II, Container With Most Water
- **Fix one + two pointers**: 3Sum (sort, fix i, two pointers on rest)
- **Squeeze from both sides**: Trapping Rain Water (track max from left/right)
- **Same direction (fast/slow)**: Sometimes overlaps with Linked List pattern

### Time/Space Complexity
- Time: O(n) for two pointers, O(n^2) for 3Sum (nested with two pointers)
- Space: O(1) extra space (the whole point is avoiding extra data structures)

### Gotchas
1. Forgetting to sort first (Two Pointers only works on sorted data for sum problems)
2. Not skipping duplicates in 3Sum (leads to duplicate triplets)
3. Using `left <= right` instead of `left < right` (off-by-one when pointers meet)
4. For Container With Most Water: moving the TALLER pointer is wrong; always move the shorter one
5. Trapping Rain Water: confusing "water at position i" with "total water"

### Pattern Connections
- Combines with **Binary Search** (sorted array operations)
- Combines with **Arrays & Hashing** (when not sorted, hash might be better)
- Combines with **Sliding Window** (both use pointer movement, but sliding window is same-direction)

---

## Pattern 3: Sliding Window

### Questions (6)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Best Time to Buy and Sell Stock | Easy |
| 2 | Longest Substring Without Repeating Characters | Medium |
| 3 | Longest Repeating Character Replacement | Medium |
| 4 | Permutation in String | Medium |
| 5 | Minimum Window Substring | Hard |
| 6 | Sliding Window Maximum | Hard |

### The Hook
- "Contiguous subarray" or "substring"
- "Longest/shortest" with a constraint
- "At most K" distinct elements/changes
- Need to track a window that expands and contracts
- "Find minimum/maximum window satisfying condition"

### Core Template
```python
def sliding_window(s):
    left = 0
    window = {}  # track window state (counts, sum, etc.)
    result = 0
    for right in range(len(s)):
        window[s[right]] = window.get(s[right], 0) + 1  # expand
        while window_invalid(window):  # shrink until valid
            window[s[left]] -= 1
            if window[s[left]] == 0:
                del window[s[left]]
            left += 1
        result = max(result, right - left + 1)  # update answer
    return result
```

### Key Insight
Instead of checking every possible subarray (O(n^2)), maintain a window that only expands right and shrinks left. The window state (character count, sum, etc.) is updated incrementally. The left pointer only moves forward, so total work is O(n).

### Common Variations
- **Fixed-size window**: Permutation in String (window size = len(pattern))
- **Variable expanding window**: Longest Substring Without Repeating
- **Shrinking to find minimum**: Minimum Window Substring
- **Monotonic deque for max in window**: Sliding Window Maximum
- **Count-based constraint**: Longest Repeating Character Replacement (max_count + k >= window_size)

### Time/Space Complexity
- Time: O(n) - each element enters and leaves the window at most once
- Space: O(k) where k is the alphabet/distinct elements size

### Gotchas
1. Forgetting to shrink the window (expanding without contracting = brute force)
2. Off-by-one on window size: `right - left + 1` not `right - left`
3. For "minimum" problems: update result INSIDE the while loop (when window is valid)
4. For "maximum" problems: update result OUTSIDE the while loop (after shrinking)
5. Not properly decrementing/removing from window state when left pointer moves

### Pattern Connections
- Combines with **Arrays & Hashing** (HashMap to track window contents)
- Combines with **Heap** (Sliding Window Maximum can use monotonic deque or heap)
- Combines with **Two Pointers** (sliding window IS two pointers moving in same direction)

---

## Pattern 4: Stack

### Questions (7)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Valid Parentheses | Easy |
| 2 | Min Stack | Medium |
| 3 | Evaluate Reverse Polish Notation | Medium |
| 4 | Generate Parentheses | Medium |
| 5 | Daily Temperatures | Medium |
| 6 | Car Fleet | Medium |
| 7 | Largest Rectangle in Histogram | Hard |

### The Hook
- "Matching/nested parentheses or brackets"
- "Next greater/smaller element"
- "Most recent" or "last in, first out" ordering
- "Evaluate expression" (postfix notation)
- "Monotonically increasing/decreasing" sequence needed
- "Histogram" or "largest rectangle"

### Core Template
```python
def monotonic_stack(arr):
    stack = []  # stores indices (or values)
    result = [0] * len(arr)
    for i in range(len(arr)):
        while stack and arr[stack[-1]] < arr[i]:  # or > for decreasing
            idx = stack.pop()
            result[idx] = i - idx  # distance to next greater
        stack.append(i)
    return result
```

### Key Insight
A stack naturally handles "find the nearest element satisfying a condition" problems. A **monotonic stack** maintains elements in sorted order -- when a new element breaks the monotonic property, you pop and process all elements it "answers" for.

### Common Variations
- **Matching pairs**: Valid Parentheses (push open, pop on close)
- **Auxiliary stack**: Min Stack (maintain parallel stack of minimums)
- **Expression evaluation**: RPN (push numbers, pop two on operator)
- **Monotonic decreasing stack**: Daily Temperatures, Largest Rectangle
- **Process in reverse**: Car Fleet (process from end to start)

### Time/Space Complexity
- Time: O(n) - each element pushed and popped at most once
- Space: O(n) for the stack

### Gotchas
1. Forgetting to handle remaining elements in stack after iteration
2. Storing values vs indices (usually indices are more useful)
3. Monotonic stack direction: increasing vs decreasing depends on whether you want "next greater" or "next smaller"
4. For Largest Rectangle: need to add sentinel values (0) at start/end to flush the stack
5. Car Fleet: must process from the target backward and compare arrival times

### Pattern Connections
- Combines with **Backtracking** (Generate Parentheses uses implicit stack via recursion)
- Combines with **Arrays & Hashing** (pre-computing next greater elements)
- Combines with **Sliding Window** (monotonic deque is a double-ended stack)

---

## Pattern 5: Binary Search

### Questions (7)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Binary Search | Easy |
| 2 | Search a 2D Matrix | Medium |
| 3 | Koko Eating Bananas | Medium |
| 4 | Find Minimum in Rotated Sorted Array | Medium |
| 5 | Search in Rotated Sorted Array | Medium |
| 6 | Time Based Key-Value Store | Medium |
| 7 | Median of Two Sorted Arrays | Hard |

### The Hook
- "Sorted array" + "find target" = classic Binary Search
- "Minimum speed/capacity/value that satisfies constraint" = Binary Search on Answer Space
- "Rotated sorted" = modified Binary Search
- Whenever you can define: "all values below X fail, all values at/above X pass" (monotonic predicate)

### Core Template
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2  # avoid overflow
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1  # or left for insertion point
```

```python
# Binary Search on Answer Space
def search_on_answer(lo, hi):
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid):  # can we achieve this with given constraints?
            hi = mid        # try smaller
        else:
            lo = mid + 1   # need bigger
    return lo
```

### Key Insight
Binary Search is not just for "find element in sorted array." It works ANY time you have a monotonic property: everything to the left is False and everything to the right is True (or vice versa). The boundary between them is your answer.

### Common Variations
- **Classic sorted array**: Binary Search, Search a 2D Matrix
- **Search on answer space**: Koko Eating Bananas (min speed such that finishes in time)
- **Rotated sorted array**: Find Minimum, Search in Rotated (determine which half is sorted)
- **Search with timestamp**: Time Based Key-Value Store (find latest timestamp <= query)
- **Two arrays**: Median of Two Sorted Arrays (binary search on partition)

### Time/Space Complexity
- Time: O(log n) for the search itself; O(n) per feasibility check in answer-space variant
- Space: O(1)

### Gotchas
1. Off-by-one: `left <= right` vs `left < right` (depends on whether you want exact match or boundary)
2. Integer overflow: use `left + (right - left) // 2` not `(left + right) // 2`
3. Rotated array: must determine which half is sorted FIRST, then decide which half to search
4. Search on answer: getting the feasibility function wrong (inclusive vs exclusive bounds)
5. Forgetting that Binary Search on answer space requires identifying the correct lo/hi range

### Pattern Connections
- Combines with **Two Pointers** (both work on sorted data)
- Combines with **Greedy** (binary search on answer + greedy feasibility check)
- Combines with **Math & Geometry** (Median of Two Sorted Arrays uses partitioning math)

---

## Pattern 6: Linked List

### Questions (11)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Reverse Linked List | Easy |
| 2 | Merge Two Sorted Lists | Easy |
| 3 | Reorder List | Medium |
| 4 | Remove Nth Node From End of List | Medium |
| 5 | Copy List with Random Pointer | Medium |
| 6 | Add Two Numbers | Medium |
| 7 | Linked List Cycle | Easy |
| 8 | Find the Duplicate Number | Medium |
| 9 | LRU Cache | Medium |
| 10 | Merge K Sorted Lists | Hard |
| 11 | Reverse Nodes in K-Group | Hard |

### The Hook
- "Reverse a list" or "reverse in groups"
- "Find middle" or "find cycle" = fast/slow pointers
- "Merge sorted lists"
- "Remove nth from end" = two pointers with gap
- "Deep copy with random pointers" = HashMap for old-to-new mapping
- "LRU/LFU Cache" = doubly linked list + HashMap

### Core Template
```python
def reverse_linked_list(head):
    prev, curr = None, head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev

def find_middle(head):  # fast/slow pointer
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```

### Key Insight
Linked list problems are all about **pointer manipulation**. Draw it out. Track prev/curr/next. The fast/slow pointer technique (Floyd's algorithm) solves cycle detection AND finding the middle in one pass.

### Common Variations
- **Reversal**: Reverse Linked List, Reverse Nodes in K-Group
- **Fast/Slow pointers**: Linked List Cycle, Find Middle (used in Reorder List)
- **Merge**: Merge Two Sorted Lists, Merge K Sorted Lists
- **Two pointer with offset**: Remove Nth Node From End (advance one pointer n steps ahead)
- **HashMap + DLL**: LRU Cache (O(1) get and put)
- **Deep copy**: Copy List with Random Pointer (map old nodes to new nodes)

### Time/Space Complexity
- Time: O(n) for most operations, O(n log n) for Merge K using divide and conquer
- Space: O(1) for in-place operations, O(n) for copy/cache problems

### Gotchas
1. Losing the reference to next node before reassigning pointers (always save `next = curr.next` first)
2. Not handling edge cases: empty list, single node, even/odd length
3. Fast/slow: `while fast and fast.next` -- checking both prevents null pointer errors
4. For Remove Nth: using a dummy head node simplifies edge cases (removing the actual head)
5. LRU Cache: forgetting to update the position in the DLL on `get()` (not just `put()`)

### Pattern Connections
- Combines with **Two Pointers** (fast/slow is a two-pointer technique on linked lists)
- Combines with **Heap** (Merge K Sorted Lists uses a min-heap)
- Combines with **Arrays & Hashing** (LRU Cache = HashMap + Doubly Linked List)

---

## Pattern 7: Trees

### Questions (15)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Invert Binary Tree | Easy |
| 2 | Maximum Depth of Binary Tree | Easy |
| 3 | Diameter of Binary Tree | Easy |
| 4 | Balanced Binary Tree | Easy |
| 5 | Same Tree | Easy |
| 6 | Subtree of Another Tree | Easy |
| 7 | Lowest Common Ancestor of BST | Medium |
| 8 | Binary Tree Level Order Traversal | Medium |
| 9 | Binary Tree Right Side View | Medium |
| 10 | Count Good Nodes in Binary Tree | Medium |
| 11 | Validate Binary Search Tree | Medium |
| 12 | Kth Smallest Element in BST | Medium |
| 13 | Construct Binary Tree from Preorder and Inorder | Medium |
| 14 | Binary Tree Maximum Path Sum | Hard |
| 15 | Serialize and Deserialize Binary Tree | Hard |

### The Hook
- "Binary tree" in the problem = Tree DFS/BFS
- "All nodes at same depth" or "level by level" = BFS
- "Height/depth/diameter" = DFS (post-order)
- "BST" + "search/validate" = use BST property (left < root < right)
- "Path sum" = DFS tracking running sum
- "Construct tree" = divide and conquer with index manipulation

### Core Template
```python
def dfs(node):
    if not node:
        return 0  # base case
    left = dfs(node.left)
    right = dfs(node.right)
    # Process current node using left/right results (post-order)
    self.answer = max(self.answer, left + right)  # example: diameter
    return 1 + max(left, right)  # return value up to parent

def bfs(root):
    queue = deque([root])
    while queue:
        level_size = len(queue)
        for _ in range(level_size):
            node = queue.popleft()
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
```

### Key Insight
Most tree problems follow ONE of two patterns: (1) DFS where you return information UP from children to parent (post-order), or (2) DFS where you pass information DOWN from parent to children (pre-order). Knowing which direction the information flows tells you the approach.

### Common Variations
- **Return up (post-order)**: Max Depth, Diameter, Balanced, Same Tree
- **Pass down (pre-order)**: Count Good Nodes, Validate BST (pass valid range)
- **Level-order BFS**: Level Order Traversal, Right Side View
- **BST property exploitation**: LCA of BST, Validate BST, Kth Smallest (inorder = sorted)
- **Construction**: Build from traversals using hash map for index lookup
- **Path problems**: Max Path Sum (track both "through node" and "ending at node" sums)

### Time/Space Complexity
- Time: O(n) - visit each node once
- Space: O(h) for recursion stack where h = height (O(log n) balanced, O(n) skewed)

### Gotchas
1. Confusing "global answer" vs "return value" (Diameter: answer = left+right, return = 1+max(left,right))
2. Not handling None/null base cases properly
3. BST validation: passing (-inf, inf) range and narrowing, NOT just checking node.left < node < node.right (that only checks immediate children)
4. Forgetting that BST inorder traversal gives sorted order (useful for Kth Smallest)
5. Serialize/Deserialize: must encode null nodes to maintain structure

### Pattern Connections
- Combines with **DFS/BFS from Graphs** (trees are just acyclic connected graphs)
- Combines with **Backtracking** (path-finding problems in trees)
- Combines with **1-D DP** (tree DP: compute optimal substructure at each subtree)

---

## Pattern 8: Tries

### Questions (3)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Implement Trie (Prefix Tree) | Medium |
| 2 | Design Add and Search Words Data Structure | Medium |
| 3 | Word Search II | Hard |

### The Hook
- "Prefix matching" or "starts with"
- "Dictionary of words" + "search/autocomplete"
- "Multiple string searches" on same text (batch lookups)
- "Wildcard character matching" in a word dictionary

### Core Template
```python
class TrieNode:
    def __init__(self):
        self.children = {}  # char -> TrieNode
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True

    def search(self, word):  # or starts_with
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end  # True for search, True always for startsWith
```

### Key Insight
A Trie stores strings character by character in a tree structure so that common prefixes share nodes. This makes prefix operations O(L) where L = word length, regardless of how many words are stored. It is essentially a "prefix elimination" data structure.

### Common Variations
- **Basic prefix tree**: Implement Trie (insert, search, startsWith)
- **Wildcard search**: Add/Search Words (DFS when hitting '.', explore all children)
- **Batch word search**: Word Search II (build trie of words, DFS on grid with trie pruning)

### Time/Space Complexity
- Time: O(L) per operation where L = word length
- Space: O(N * L) where N = number of words, L = average length (worst case)

### Gotchas
1. Forgetting `is_end` flag (prefix exists != word exists)
2. Word Search II: forgetting to remove words from trie after finding them (causes duplicates)
3. Wildcard search: need DFS/backtracking at wildcard positions
4. Space can blow up with large alphabets -- consider using arrays vs dicts for children
5. Not pruning empty trie branches after deletion (memory leak)

### Pattern Connections
- Combines with **Backtracking** (Word Search II = Trie + DFS backtracking on grid)
- Combines with **Graphs/DFS** (traversing the trie is a tree/graph traversal)
- Combines with **Arrays & Hashing** (alternative to HashMap for string lookups)

---

## Pattern 9: Heap / Priority Queue

### Questions (7)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Kth Largest Element in a Stream | Easy |
| 2 | Last Stone Weight | Easy |
| 3 | K Closest Points to Origin | Medium |
| 4 | Kth Largest Element in an Array | Medium |
| 5 | Task Scheduler | Medium |
| 6 | Design Twitter | Medium |
| 7 | Find Median from Data Stream | Hard |

### The Hook
- "Kth largest/smallest" = min-heap of size K
- "Top K" or "K closest" = heap
- "Repeatedly pick max/min" = max-heap / min-heap
- "Median of stream" = two heaps (max-heap for lower half, min-heap for upper half)
- "Schedule tasks with cooldown" = max-heap for greedy scheduling

### Core Template
```python
import heapq

def top_k_pattern(arr, k):
    heap = []  # min-heap of size k
    for val in arr:
        heapq.heappush(heap, val)
        if len(heap) > k:
            heapq.heappop(heap)  # remove smallest, keep k largest
    return heap[0]  # kth largest is the min of the k largest

# Two heaps for median
# max_heap (negate for max behavior): stores smaller half
# min_heap: stores larger half
```

### Key Insight
A heap gives you O(1) access to min or max and O(log n) insertion/removal. For "Kth largest," maintain a min-heap of size K -- the top is always the Kth largest. For median, split into two heaps: the max of the lower half and the min of the upper half.

### Common Variations
- **Top K / Kth element**: Kth Largest, K Closest Points
- **Repeated max extraction**: Last Stone Weight (repeatedly smash two largest)
- **Two heaps for median**: Find Median from Data Stream
- **Greedy scheduling**: Task Scheduler (always do most frequent task first)
- **Merge multiple sorted streams**: Design Twitter (merge K sorted feeds)

### Time/Space Complexity
- Time: O(n log k) for top-K problems, O(log n) per insert/remove
- Space: O(k) for top-K, O(n) for all-elements heap

### Gotchas
1. Python only has min-heap; negate values for max-heap behavior
2. For Kth largest: use min-heap of size K (not max-heap of size n)
3. Two heaps median: must keep heaps balanced (sizes differ by at most 1)
4. Task Scheduler: the insight is `idle_slots = (max_freq - 1) * n`, not simulation
5. Forgetting that heappush/heappop are O(log n), not O(1)

### Pattern Connections
- Combines with **Linked List** (Merge K Sorted Lists uses min-heap)
- Combines with **Arrays & Hashing** (frequency count + heap for Top K)
- Combines with **Greedy** (heap enables "always pick best" strategy)
- Combines with **Graphs** (Dijkstra uses a min-heap)

---

## Pattern 10: Backtracking

### Questions (9)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Subsets | Medium |
| 2 | Combination Sum | Medium |
| 3 | Permutations | Medium |
| 4 | Subsets II | Medium |
| 5 | Combination Sum II | Medium |
| 6 | Word Search | Medium |
| 7 | Palindrome Partitioning | Medium |
| 8 | Letter Combinations of a Phone Number | Medium |
| 9 | N-Queens | Hard |

### The Hook
- "Find ALL possible" combinations/permutations/subsets
- "Generate all valid" arrangements
- "Can you partition/split in all ways"
- "Place N items with constraints" (N-Queens)
- Problem explicitly asks for multiple solutions, not just count or optimal

### Core Template
```python
def backtrack(start, current_path, result):
    if is_goal(current_path):  # base case: valid solution found
        result.append(current_path[:])  # append a COPY
        return
    for i in range(start, len(choices)):
        if not is_valid(choices[i]):  # pruning
            continue
        current_path.append(choices[i])  # choose
        backtrack(i + 1, current_path, result)  # explore (i+1 for combos, i for reuse)
        current_path.pop()  # un-choose (backtrack)
```

### Key Insight
Backtracking = DFS through a decision tree. At each node, you make a choice, recurse, then UNDO the choice. The three key decisions: (1) What are my choices at this step? (2) When do I stop (base case)? (3) How do I avoid duplicates?

### Common Variations
- **Subsets**: Include or exclude each element (start = i+1, no explicit goal)
- **Combinations**: Choose k elements (goal = len(path) == k)
- **Permutations**: Use each element once (use visited set, start always 0)
- **With duplicates**: Sort first + skip if `nums[i] == nums[i-1]` and `i > start`
- **Reuse allowed**: Combination Sum (recurse with same index, not i+1)
- **Grid search**: Word Search (DFS with backtracking on 2D grid, mark visited)

### Time/Space Complexity
- Time: O(2^n) for subsets, O(n!) for permutations, varies by problem
- Space: O(n) for recursion depth + O(2^n) for storing all results

### Gotchas
1. Forgetting to append a COPY of the path (`path[:]` or `list(path)`), not a reference
2. Not sorting input before handling duplicates (the skip logic requires sorted order)
3. Duplicate skipping condition: `i > start` not `i > 0` (allow first use at each level)
4. Word Search: forgetting to unmark visited cells after backtracking
5. Confusing "start from i+1" (combinations) vs "start from 0 with visited" (permutations)

### Pattern Connections
- Combines with **Trees/DFS** (backtracking IS DFS on an implicit tree)
- Combines with **Tries** (Word Search II prunes search using Trie)
- Combines with **DP** (if you only need count/optimal, DP might replace backtracking)
- Combines with **Graphs** (grid-based problems like Word Search)

---

## Pattern 11: Graphs

### Questions (13)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Number of Islands | Medium |
| 2 | Clone Graph | Medium |
| 3 | Max Area of Island | Medium |
| 4 | Pacific Atlantic Water Flow | Medium |
| 5 | Surrounded Regions | Medium |
| 6 | Rotting Oranges | Medium |
| 7 | Walls and Gates | Medium |
| 8 | Course Schedule | Medium |
| 9 | Course Schedule II | Medium |
| 10 | Redundant Connection | Medium |
| 11 | Number of Connected Components in an Undirected Graph | Medium |
| 12 | Graph Valid Tree | Medium |
| 13 | Word Ladder | Hard |

### The Hook
- "Grid" with connected regions (islands, areas) = DFS/BFS on 2D grid
- "Prerequisites" or "dependencies" = Topological Sort
- "Shortest transformation/path" (unweighted) = BFS
- "Connected components" or "union/find" = Union-Find or DFS
- "Cycle detection" in directed graph = DFS with coloring or Topological Sort
- "Clone/copy a graph" = BFS/DFS with HashMap

### Core Template
```python
# BFS on grid
def bfs_grid(grid, start_r, start_c):
    queue = deque([(start_r, start_c)])
    visited = set()
    visited.add((start_r, start_c))
    while queue:
        r, c = queue.popleft()
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr,nc) not in visited:
                if grid[nr][nc] == 1:  # valid cell
                    visited.add((nr, nc))
                    queue.append((nr, nc))

# Topological Sort (Kahn's BFS)
def topo_sort(num_nodes, prerequisites):
    indegree = [0] * num_nodes
    graph = defaultdict(list)
    for dest, src in prerequisites:
        graph[src].append(dest)
        indegree[dest] += 1
    queue = deque([i for i in range(num_nodes) if indegree[i] == 0])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)
    return order if len(order) == num_nodes else []  # empty = cycle
```

### Key Insight
Graphs come in two flavors: (1) **Exploration** problems where you traverse all reachable nodes (use DFS or BFS), and (2) **Ordering** problems where you need to respect dependencies (use Topological Sort). For grids, treat each cell as a node with 4 edges to neighbors.

### Common Variations
- **Connected components**: Number of Islands, Components (DFS/BFS from each unvisited node)
- **Multi-source BFS**: Rotting Oranges, Walls and Gates (start BFS from ALL sources simultaneously)
- **Topological sort**: Course Schedule I & II (detect cycle / find valid order)
- **Union-Find**: Redundant Connection, Graph Valid Tree, Components
- **Clone**: Clone Graph (BFS + HashMap old-to-new)
- **Bidirectional BFS**: Word Ladder (search from both ends)

### Time/Space Complexity
- Time: O(V + E) for adjacency list traversal, O(m*n) for grid problems
- Space: O(V + E) for adjacency list, O(m*n) for visited grid

### Gotchas
1. Forgetting to mark as visited BEFORE adding to queue (causes duplicates in BFS)
2. DFS on large grids can hit recursion limits -- use iterative DFS or BFS instead
3. Topological sort: if order length != num_nodes, there is a cycle
4. Union-Find: must use path compression AND union by rank for O(alpha(n))
5. Multi-source BFS: add ALL sources to queue first, then process level by level

### Pattern Connections
- Combines with **Trees** (trees are special cases of graphs)
- Combines with **Backtracking** (DFS exploration with constraint checking)
- Combines with **DP** (shortest path can sometimes be DP on DAG)
- Combines with **Heap** (weighted shortest path = Dijkstra)

---

## Pattern 12: Advanced Graphs

### Questions (6)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Reconstruct Itinerary | Hard |
| 2 | Min Cost to Connect All Points | Medium |
| 3 | Network Delay Time | Medium |
| 4 | Swim in Rising Water | Hard |
| 5 | Alien Dictionary | Hard |
| 6 | Cheapest Flights Within K Stops | Medium |

### The Hook
- "Shortest path with WEIGHTED edges" = Dijkstra (or Bellman-Ford if negative weights)
- "Minimum spanning tree" or "connect all with min cost" = Prim's or Kruskal's
- "Shortest path with limited steps" = modified Bellman-Ford or BFS with constraints
- "Determine order from constraints" = Topological Sort
- "Visit all edges exactly once" = Eulerian Path (Hierholzer's algorithm)

### Core Template
```python
# Dijkstra's Algorithm
def dijkstra(graph, source):
    dist = {node: float('inf') for node in graph}
    dist[source] = 0
    heap = [(0, source)]  # (distance, node)
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue  # skip stale entries
        for v, weight in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(heap, (dist[v], v))
    return dist

# Prim's MST
def prim(points):
    visited = set()
    heap = [(0, 0)]  # (cost, node)
    total_cost = 0
    while len(visited) < n:
        cost, node = heapq.heappop(heap)
        if node in visited:
            continue
        visited.add(node)
        total_cost += cost
        for neighbor, weight in graph[node]:
            if neighbor not in visited:
                heapq.heappush(heap, (weight, neighbor))
    return total_cost
```

### Key Insight
Advanced graph problems add **weights** or **constraints** to basic traversal. Dijkstra handles "shortest path with non-negative weights." Bellman-Ford handles negative weights and limited hops. MST algorithms connect all nodes with minimum total edge weight. Know which algorithm matches which constraint.

### Common Variations
- **Shortest weighted path**: Network Delay Time (Dijkstra)
- **K-limited shortest path**: Cheapest Flights (Bellman-Ford with K iterations)
- **MST**: Min Cost to Connect All Points (Prim's with all-pairs Manhattan distance)
- **Topological ordering from data**: Alien Dictionary (build graph from adjacent word pairs)
- **Eulerian path**: Reconstruct Itinerary (Hierholzer's algorithm)
- **Binary search + BFS/DFS**: Swim in Rising Water (can we reach end with threshold T?)

### Time/Space Complexity
- Dijkstra: O((V + E) log V) with binary heap
- Bellman-Ford: O(V * E)
- Prim's/Kruskal's: O(E log E)
- Space: O(V + E)

### Gotchas
1. Dijkstra does NOT work with negative edge weights (use Bellman-Ford)
2. Forgetting the `if d > dist[u]: continue` optimization in Dijkstra (processes stale entries)
3. Cheapest Flights: Dijkstra with stops limit is tricky; Bellman-Ford with K+1 iterations is cleaner
4. Alien Dictionary: only ADJACENT words in the sorted list give ordering information
5. MST: Kruskal's needs Union-Find; Prim's needs min-heap -- know both

### Pattern Connections
- Combines with **Heap** (Dijkstra and Prim both use priority queues)
- Combines with **Binary Search** (Swim in Rising Water: binary search on answer + BFS to verify)
- Combines with **Graphs** (advanced graphs BUILD on basic DFS/BFS/topological sort)
- Combines with **Union-Find** (Kruskal's MST uses Union-Find)

---

## Pattern 13: 1-D Dynamic Programming

### Questions (12)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Climbing Stairs | Easy |
| 2 | Min Cost Climbing Stairs | Easy |
| 3 | House Robber | Medium |
| 4 | House Robber II | Medium |
| 5 | Longest Palindromic Substring | Medium |
| 6 | Palindromic Substrings | Medium |
| 7 | Decode Ways | Medium |
| 8 | Coin Change | Medium |
| 9 | Maximum Product Subarray | Medium |
| 10 | Word Break | Medium |
| 11 | Longest Increasing Subsequence | Medium |
| 12 | Partition Equal Subset Sum | Medium |

### The Hook
- "How many ways" or "minimum/maximum" with **overlapping subproblems**
- "Can you reach the end" with choices at each step
- Current decision depends on PREVIOUS decisions
- "Optimal substructure": optimal solution contains optimal sub-solutions
- If brute force is exponential and you see repeated computations = DP

### Core Template
```python
# Bottom-up tabulation
def dp_pattern(n):
    dp = [0] * (n + 1)
    dp[0] = 1  # base case
    dp[1] = 1  # base case
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]  # recurrence relation
    return dp[n]

# Space-optimized (when only need last few states)
def dp_optimized(n):
    prev2, prev1 = 1, 1
    for i in range(2, n + 1):
        curr = prev1 + prev2
        prev2, prev1 = prev1, curr
    return prev1
```

### Key Insight
Define `dp[i]` as "the answer for the subproblem ending at/using the first i elements." Then find the RECURRENCE: how does dp[i] relate to smaller subproblems? Start with brute force recursion, add memoization, then convert to bottom-up if needed.

### Common Variations
- **Linear sequence**: Climbing Stairs (dp[i] = dp[i-1] + dp[i-2])
- **Take or skip**: House Robber (dp[i] = max(dp[i-1], dp[i-2] + nums[i]))
- **Unbounded knapsack**: Coin Change (dp[amount] = min over all coins)
- **Subsequence**: LIS (dp[i] = longest ending at i, check all j < i)
- **Expand from center**: Palindromic Substrings (not classic DP, but uses DP thinking)
- **Circular**: House Robber II (run twice: exclude first OR exclude last)
- **Boolean DP**: Word Break (dp[i] = True if any valid split exists up to i)

### Time/Space Complexity
- Time: O(n) for linear DP, O(n^2) for quadratic (LIS, palindromes), O(n*amount) for knapsack
- Space: O(n) for full table, O(1) if space-optimized

### Gotchas
1. Getting the base cases wrong (dp[0] is often tricky -- what does "0 items" mean?)
2. Off-by-one in loop bounds (starting at 1 vs 2, ending at n vs n+1)
3. House Robber II (circular): do NOT just ignore -- run the algorithm twice
4. Maximum Product Subarray: must track BOTH max AND min (negative * negative = positive)
5. Coin Change: initialize dp array to float('inf'), not 0 (you want minimum)

### Pattern Connections
- Combines with **Greedy** (sometimes greedy works instead of DP; prove greedy choice property)
- Combines with **Binary Search** (LIS in O(n log n) uses patience sorting with binary search)
- Combines with **Backtracking** (if you need all solutions, backtrack; if count/optimal, DP)
- Leads into **2-D DP** (add a second dimension for more complex state)

---

## Pattern 14: 2-D Dynamic Programming

### Questions (11)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Unique Paths | Medium |
| 2 | Longest Common Subsequence | Medium |
| 3 | Best Time to Buy and Sell Stock with Cooldown | Medium |
| 4 | Coin Change II | Medium |
| 5 | Target Sum | Medium |
| 6 | Interleaving String | Medium |
| 7 | Longest Increasing Path in a Matrix | Hard |
| 8 | Distinct Subsequences | Hard |
| 9 | Edit Distance | Hard |
| 10 | Burst Balloons | Hard |
| 11 | Regular Expression Matching | Hard |

### The Hook
- Two strings/sequences being compared = 2D table where dp[i][j] uses prefixes of both
- Grid traversal with constraints = dp[i][j] on the grid itself
- State needs TWO dimensions (position + some other variable like "holding stock" or "cooldown")
- "Interleave" or "match" two sequences

### Core Template
```python
def dp_2d(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    # Fill base cases (first row and column)
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1  # match: take diagonal
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])  # no match: take best
    return dp[m][n]
```

### Key Insight
2D DP adds a second dimension to the state. For two-string problems, dp[i][j] represents the answer considering the first i characters of string1 and first j characters of string2. For grid problems, dp[i][j] represents the answer at cell (i,j). Draw the table and fill it manually for small inputs to see the pattern.

### Common Variations
- **Two sequences**: LCS, Edit Distance, Distinct Subsequences, Interleaving String
- **Grid paths**: Unique Paths (dp[i][j] = dp[i-1][j] + dp[i][j-1])
- **State machine DP**: Stock with Cooldown (states: hold, sold, rest)
- **Knapsack 2D**: Coin Change II, Target Sum (items x capacity)
- **Interval DP**: Burst Balloons (dp[i][j] = best for subarray i..j)
- **DFS + memoization**: Longest Increasing Path in Matrix (DFS with cache)
- **Pattern matching**: Regular Expression Matching (dp[i][j] = does s[:i] match p[:j])

### Time/Space Complexity
- Time: O(m * n) for most two-sequence problems
- Space: O(m * n) for full table, O(n) if row-by-row optimization possible

### Gotchas
1. Index confusion: dp is (m+1) x (n+1) but strings are 0-indexed, so `s1[i-1]` not `s1[i]`
2. Base case initialization: first row/column often represents "empty string" cases
3. Coin Change II: order of loops matters (items outer, amount inner for combinations; reverse for permutations)
4. Edit Distance: three operations map to three adjacent cells (diagonal=replace, left=insert, up=delete)
5. Burst Balloons: the trick is "which balloon do I burst LAST" (not first)

### Pattern Connections
- Combines with **1-D DP** (2D is an extension; sometimes you can reduce 2D to 1D with space optimization)
- Combines with **Graphs/DFS** (Longest Increasing Path = DFS + memoization on grid)
- Combines with **Backtracking** (memoized backtracking IS top-down DP)
- Combines with **Greedy** (Stock problems sometimes have greedy solutions too)

---

## Pattern 15: Greedy

### Questions (8)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Maximum Subarray | Medium |
| 2 | Jump Game | Medium |
| 3 | Jump Game II | Medium |
| 4 | Gas Station | Medium |
| 5 | Hand of Straights | Medium |
| 6 | Merge Triplets to Form Target Triplet | Medium |
| 7 | Partition Labels | Medium |
| 8 | Valid Parenthesis String | Medium |

### The Hook
- "Can you reach the end" or "minimum jumps to reach end"
- "Is there a valid starting point" (circular problems)
- Making the locally optimal choice leads to globally optimal solution
- The problem has the "greedy choice property" (you never need to undo a decision)
- Sorting + processing in order often signals greedy

### Core Template
```python
def greedy_pattern(nums):
    result = 0
    current_best = 0  # track the best option so far
    for i in range(len(nums)):
        if not can_reach(i, current_best):  # greedy fails
            return False
        current_best = max(current_best, compute_local(i, nums))
        result = update_result(result, current_best)
    return result

# Kadane's Algorithm (Maximum Subarray - classic greedy)
def max_subarray(nums):
    max_sum = nums[0]
    current_sum = 0
    for num in nums:
        current_sum = max(num, current_sum + num)  # restart or extend
        max_sum = max(max_sum, current_sum)
    return max_sum
```

### Key Insight
Greedy works when making the best choice at each step guarantees the best overall result. The trick is proving this property holds. If you can show "choosing greedily never makes future decisions worse," greedy is correct. If not, you need DP.

### Common Variations
- **Kadane's**: Maximum Subarray (extend current or restart)
- **Farthest reachable**: Jump Game (track max reachable index)
- **Interval scheduling**: Jump Game II (BFS-like level approach)
- **Circular greedy**: Gas Station (if total gas >= total cost, solution exists; find start)
- **Sort + greedy**: Hand of Straights (sort, greedily form consecutive groups)
- **Track last occurrence**: Partition Labels (extend partition to include all of each char)
- **Balance tracking**: Valid Parenthesis String (track range of possible open counts)

### Time/Space Complexity
- Time: O(n) for most greedy algorithms, O(n log n) if sorting is needed
- Space: O(1) typically (greedy avoids storing subproblem results)

### Gotchas
1. Assuming greedy works without proof (always verify: does locally optimal = globally optimal?)
2. Maximum Subarray: forgetting to handle all-negative arrays (Kadane's handles it if initialized correctly)
3. Gas Station: the key insight is that if total surplus >= 0, a valid start exists
4. Jump Game II: it is BFS in disguise (each "level" is the range reachable in k jumps)
5. Valid Parenthesis String: tracking min/max possible open count simultaneously

### Pattern Connections
- Combines with **1-D DP** (Jump Game can be solved with DP or Greedy; greedy is more efficient)
- Combines with **Intervals** (interval scheduling often uses greedy: sort by end time)
- Combines with **Arrays & Hashing** (frequency counting before greedy decisions)
- Combines with **Binary Search** (greedy feasibility check with binary search on answer)

---

## Pattern 16: Intervals

### Questions (6)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Insert Interval | Medium |
| 2 | Merge Intervals | Medium |
| 3 | Non-overlapping Intervals | Medium |
| 4 | Meeting Rooms | Easy |
| 5 | Meeting Rooms II | Medium |
| 6 | Minimum Interval to Include Each Query | Hard |

### The Hook
- Input is a list of [start, end] intervals
- "Merge overlapping" or "find conflicts"
- "Minimum number of rooms/resources" (sweep line / min-heap)
- "Can someone attend all meetings" (overlap detection)
- Any scheduling or time-range problem

### Core Template
```python
def merge_intervals(intervals):
    intervals.sort(key=lambda x: x[0])  # sort by start
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:  # overlaps with last merged
            merged[-1][1] = max(merged[-1][1], end)  # extend
        else:
            merged.append([start, end])  # no overlap, add new
    return merged

# Meeting Rooms II (min concurrent)
def min_rooms(intervals):
    events = []
    for start, end in intervals:
        events.append((start, 1))   # meeting starts
        events.append((end, -1))    # meeting ends
    events.sort()
    max_rooms = current = 0
    for time, delta in events:
        current += delta
        max_rooms = max(max_rooms, current)
    return max_rooms
```

### Key Insight
Almost all interval problems start with **sorting by start time** (or end time for scheduling). After sorting, intervals that overlap are adjacent in the list. The sweep line technique processes events in chronological order, tracking how many intervals are "active" at any point.

### Common Variations
- **Merge**: Merge Intervals (sort by start, extend if overlap)
- **Insert**: Insert Interval (find where it fits, merge affected)
- **Count removals**: Non-overlapping Intervals (sort by end time, greedily keep shortest)
- **Conflict detection**: Meeting Rooms (any overlap = False)
- **Max concurrent**: Meeting Rooms II (sweep line or min-heap of end times)
- **Query-based**: Minimum Interval to Include Each Query (sort both, sweep with heap)

### Time/Space Complexity
- Time: O(n log n) due to sorting
- Space: O(n) for result/events list, O(1) extra for in-place

### Gotchas
1. Edge case: `[1,5]` and `[5,7]` -- does touching count as overlapping? (usually yes)
2. Non-overlapping Intervals: sort by END time (not start) for greedy approach
3. Meeting Rooms II: using a min-heap of end times is more intuitive than sweep line
4. Insert Interval: handle three phases (before, overlapping, after) separately
5. Forgetting to handle empty input or single interval

### Pattern Connections
- Combines with **Greedy** (interval scheduling is a classic greedy problem)
- Combines with **Heap** (Meeting Rooms II uses min-heap of end times)
- Combines with **Binary Search** (finding insertion point for new interval)
- Combines with **Arrays & Hashing** (sweep line with event counting)

---

## Pattern 17: Math & Geometry

### Questions (8)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Rotate Image | Medium |
| 2 | Spiral Matrix | Medium |
| 3 | Set Matrix Zeroes | Medium |
| 4 | Happy Number | Easy |
| 5 | Plus One | Easy |
| 6 | Pow(x, n) | Medium |
| 7 | Multiply Strings | Medium |
| 8 | Detect Squares | Medium |

### The Hook
- "Rotate matrix" or "spiral order" = matrix manipulation with index math
- "Detect cycle in a sequence" = Floyd's cycle detection (like Happy Number)
- "Implement arithmetic" without built-in operators
- Problems that require geometric reasoning (distance, area, coordinates)
- "In-place matrix transformation"

### Core Template
```python
# Rotate matrix 90 degrees clockwise
def rotate(matrix):
    n = len(matrix)
    # Step 1: Transpose (swap rows and columns)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Step 2: Reverse each row
    for row in matrix:
        row.reverse()

# Fast exponentiation
def power(x, n):
    if n < 0:
        x, n = 1/x, -n
    result = 1
    while n > 0:
        if n % 2 == 1:
            result *= x
        x *= x
        n //= 2
    return result
```

### Key Insight
Math & Geometry problems usually have a "trick" or formula that simplifies what looks complex. Rotate = transpose + reverse. Spiral = layer by layer with boundaries. Power = binary exponentiation. Once you know the trick, implementation is straightforward.

### Common Variations
- **Matrix rotation**: Rotate Image (transpose + reverse rows)
- **Spiral traversal**: Spiral Matrix (maintain top/bottom/left/right boundaries)
- **In-place marking**: Set Matrix Zeroes (use first row/col as markers)
- **Cycle detection**: Happy Number (Floyd's algorithm on number transformation)
- **Big number arithmetic**: Plus One, Multiply Strings (digit-by-digit with carry)
- **Binary exponentiation**: Pow(x, n) (O(log n) instead of O(n))
- **Coordinate geometry**: Detect Squares (HashMap of points, check perpendicular distances)

### Time/Space Complexity
- Matrix operations: O(m*n) time, O(1) extra space for in-place
- Power: O(log n) time, O(1) space
- Multiply Strings: O(m*n) where m,n are string lengths

### Gotchas
1. Rotate: doing it in one pass is error-prone; transpose + reverse is cleaner
2. Spiral Matrix: boundary updates -- shrink boundaries AFTER completing each direction
3. Set Matrix Zeroes: using first row/column as markers requires special handling of first row/col itself
4. Happy Number: infinite loop detection (use set or Floyd's slow/fast pointer)
5. Pow(x, n): handle negative exponents and n = -2^31 (overflow when negating)

### Pattern Connections
- Combines with **Arrays & Hashing** (Detect Squares uses HashMap of coordinates)
- Combines with **Linked List** (Floyd's cycle detection appears in both contexts)
- Combines with **Bit Manipulation** (binary exponentiation relates to bit operations)

---

## Pattern 18: Bit Manipulation

### Questions (7)
| # | Problem | Difficulty |
|---|---------|-----------|
| 1 | Single Number | Easy |
| 2 | Number of 1 Bits | Easy |
| 3 | Counting Bits | Easy |
| 4 | Reverse Bits | Easy |
| 5 | Missing Number | Easy |
| 6 | Sum of Two Integers | Medium |
| 7 | Reverse Integer | Medium |

### The Hook
- "Single/unique element" among duplicates = XOR
- "Count bits" or "reverse bits" = bit shifting
- "Without using +/-" = bit manipulation for arithmetic
- "Missing number in 0..n" = XOR or math trick
- Problems that explicitly mention binary representation

### Core Template
```python
# XOR to find single unique element
def single_number(nums):
    result = 0
    for num in nums:
        result ^= num  # duplicates cancel out
    return result

# Count set bits (Brian Kernighan's)
def count_bits(n):
    count = 0
    while n:
        n &= (n - 1)  # removes lowest set bit
        count += 1
    return count

# Sum without + operator
def add(a, b):
    while b != 0:
        carry = a & b
        a = a ^ b          # sum without carry
        b = carry << 1     # carry shifted left
    return a
```

### Key Insight
XOR is the star of bit manipulation: `a ^ a = 0` and `a ^ 0 = a`. This means XORing all elements cancels duplicates, leaving only unique elements. For arithmetic without operators, remember: XOR = addition without carry, AND = carry detection, shift left = carry propagation.

### Common Variations
- **XOR for uniqueness**: Single Number, Missing Number
- **Bit counting**: Number of 1 Bits (Brian Kernighan's: n & (n-1) removes lowest set bit)
- **DP on bits**: Counting Bits (dp[i] = dp[i >> 1] + (i & 1))
- **Bit reversal**: Reverse Bits (shift and build result bit by bit)
- **Bitwise arithmetic**: Sum of Two Integers (XOR + AND + shift)
- **Digit manipulation**: Reverse Integer (not truly bit manipulation, but mod/divide)

### Time/Space Complexity
- Time: O(n) for array traversal, O(32) = O(1) for single number bit operations
- Space: O(1) for most bit manipulation

### Gotchas
1. Python integers are unbounded, so negative number handling differs from C/Java (use masks for 32-bit)
2. Sum of Two Integers in Python: need to handle negatives with 32-bit mask (0xFFFFFFFF)
3. Missing Number: both XOR approach and math approach (n*(n+1)/2 - sum) work
4. Reverse Integer: check for overflow BEFORE multiplying by 10 (compare with INT_MAX/10)
5. `n & (n-1)` removes the LOWEST set bit (useful for both counting and power-of-2 check)

### Pattern Connections
- Combines with **Arrays & Hashing** (alternative to HashMap for finding unique elements)
- Combines with **Math & Geometry** (mathematical properties of XOR, arithmetic without operators)
- Combines with **1-D DP** (Counting Bits uses DP recurrence on bit patterns)

---

---

## Pattern Overlap Matrix

This table shows which patterns frequently combine in problems. Use this to build compound pattern recognition.

```
                    A&H  2P  SW  STK  BS  LL  TRE  TRI  HP  BT  GR  AG  1DP  2DP  GRD  INT  M&G  BIT
Arrays & Hashing     -   *       *         *            **  *              *              *         *
Two Pointers        *    -   *        **        *            *
Sliding Window           *   -   *                       *
Stack               *         *   -                               *
Binary Search            **            -                  *                      **
Linked List         *                       -            **
Trees                    *              *        -   *        *   *         *
Tries                                                *   -        **
Heap / PQ           **             *    *   **            -        *         *        *
Backtracking                  *                   *  **       -   **               *
Graphs                                      *         *  **   -   **         *
Adv Graphs                         *                  **       **  -
1-D DP                                                    *              -   *    *              *
2-D DP                                           *                  *    *   -
Greedy              *                  *                  *              *         -    *
Intervals                                                *                       *    -
Math & Geometry     *                            *                                         -    *
Bit Manipulation    *                                                         *              *   -

Legend: * = sometimes combines, ** = frequently combines
```

### Most Common Pattern Combinations in Interviews

| Combination | Example Problems |
|-------------|-----------------|
| HashMap + Heap | Top K Frequent Elements, Design Twitter |
| DFS + Memoization (= Top-Down DP) | Longest Increasing Path, Word Break (recursive) |
| Binary Search + Greedy | Koko Eating Bananas, Swim in Rising Water |
| Trie + Backtracking | Word Search II |
| Graph + Heap (Dijkstra) | Network Delay Time, Cheapest Flights |
| Sliding Window + HashMap | Minimum Window Substring, Longest Substring Without Repeating |
| Sort + Two Pointers | 3Sum, Container With Most Water |
| Stack + Monotonic Property | Daily Temperatures, Largest Rectangle in Histogram |
| DFS + Union-Find | Number of Connected Components, Redundant Connection |
| DP + Binary Search | Longest Increasing Subsequence (O(n log n)) |
| Linked List + Heap | Merge K Sorted Lists |
| HashMap + Linked List | LRU Cache |
| Tree DFS + Post-order | Diameter, Maximum Path Sum, Balanced Tree |
| Intervals + Heap | Meeting Rooms II, Minimum Interval to Include Query |
| BFS + Multi-source | Rotting Oranges, Walls and Gates |

---

## Difficulty Progression Guide

Learn patterns in this order, from most foundational to most advanced. Each tier builds on the previous.

### Tier 1: Foundation (Learn First)
These are the building blocks. Every other pattern uses ideas from these.

1. **Arrays & Hashing** - Teaches you HashMap thinking (trade space for time)
2. **Two Pointers** - Teaches you pointer manipulation and sorted array tricks
3. **Stack** - Teaches you LIFO thinking and monotonic structures
4. **Linked List** - Teaches you pointer manipulation without random access

### Tier 2: Core Techniques (Learn Second)
These patterns appear in 60%+ of medium problems.

5. **Sliding Window** - Builds on Two Pointers (same direction movement)
6. **Binary Search** - Fundamental divide-and-conquer; search on answer space is a key unlock
7. **Trees** - Builds on Stack/recursion; teaches DFS/BFS thinking
8. **Heap / Priority Queue** - Builds on Arrays; enables "always pick best" problems

### Tier 3: Problem-Solving Patterns (Learn Third)
These are the core algorithmic patterns that solve the hardest problems.

9. **Backtracking** - Builds on Trees/DFS; systematic exploration of all possibilities
10. **Graphs** - Builds on Trees + BFS/DFS; adds cycles and multiple components
11. **1-D Dynamic Programming** - The biggest unlock; teaches optimal substructure thinking
12. **Greedy** - Complement to DP; faster when greedy choice property holds

### Tier 4: Advanced (Learn Last)
These extend earlier patterns with more complex state or algorithms.

13. **2-D Dynamic Programming** - Extends 1-D DP to grids and two-sequence problems
14. **Advanced Graphs** - Extends Graphs with weights (Dijkstra, MST, etc.)
15. **Intervals** - Specialized pattern; sort + sweep/merge
16. **Tries** - Specialized pattern for string prefix problems

### Tier 5: Supplementary (Learn Anytime)
These are less common but good to know.

17. **Math & Geometry** - Trick-based; learn individual tricks as you encounter them
18. **Bit Manipulation** - Niche but appears in easy problems; XOR is the key insight

### Suggested Study Schedule (8 weeks)

| Week | Patterns | Focus |
|------|----------|-------|
| 1 | Arrays & Hashing, Two Pointers | Build HashMap instinct, pointer movement |
| 2 | Sliding Window, Stack | Window management, monotonic thinking |
| 3 | Binary Search, Linked List | Search on answer space, pointer tricks |
| 4 | Trees, Tries | DFS/BFS mastery, prefix trees |
| 5 | Heap, Backtracking | Priority selection, systematic exploration |
| 6 | Graphs, Advanced Graphs | BFS/DFS on graphs, Dijkstra, topological sort |
| 7 | 1-D DP, 2-D DP | State definition, recurrence relations |
| 8 | Greedy, Intervals, Math, Bits | Polish remaining patterns, review combinations |

---

## Quick Pattern Lookup by Problem Type

| If the problem says... | Think... |
|------------------------|----------|
| "Find pair/triplet with sum = target" | Two Pointers (sorted) or HashMap (unsorted) |
| "Longest/shortest contiguous subarray" | Sliding Window |
| "Valid parentheses/brackets" | Stack |
| "Next greater/smaller element" | Monotonic Stack |
| "Kth largest/smallest" | Heap (min-heap of size K) |
| "Find in sorted array" | Binary Search |
| "Minimum speed/capacity to finish in time" | Binary Search on Answer Space |
| "All subsets/combinations/permutations" | Backtracking |
| "Connected components / regions" | Graph DFS/BFS or Union-Find |
| "Shortest path (unweighted)" | BFS |
| "Shortest path (weighted)" | Dijkstra |
| "Prerequisites / dependencies" | Topological Sort |
| "How many ways / minimum cost" | Dynamic Programming |
| "Can we do it? (optimization)" | Greedy (try) or DP (guaranteed) |
| "Overlapping time intervals" | Sort + Merge / Sweep Line |
| "Prefix/autocomplete" | Trie |
| "Find unique among duplicates" | XOR (Bit Manipulation) |
| "In-place matrix operation" | Math & Geometry tricks |
| "LRU/LFU Cache" | HashMap + Doubly Linked List |
| "Merge K sorted things" | Heap |
| "Detect cycle" | Floyd's (fast/slow) or DFS coloring |
| "Level-by-level tree processing" | BFS with queue |
| "Maximum path/depth in tree" | DFS (post-order return values) |

---

*This reference covers all 150 problems across 18 patterns in the Neetcode 150 curriculum. Upload it to your AI assistant for pattern-focused revision note generation.*
