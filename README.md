# Travel Itinerary Optimizer: Multi-City Itinerary with Time Windows & Duration Constraints

An algorithm-centric Design and Analysis of Algorithms (DAA) working prototype that generates optimal multi-city travel itineraries while minimizing transit costs and strictly satisfying maximum trip duration budgets and location-specific visiting hours.

---

## 1. Problem Statement
Given a set of destination cities/landmarks $V = \{0, 1, \dots, N-1\}$, a designated origin hub $c_0$, pairwise travel costs $C_{ij}$, transit durations $T_{ij}$, location visit durations $S_i$, opening hours $E_i$, closing deadlines $L_i$, and an overall trip budget $T_{\max}$:

Find a closed tour sequence $P = [c_0, c_1, \dots, c_{N-1}, c_0]$ that:
1. **Minimizes Total Expenditure:** $\min \sum_{(u,v) \in P} C_{uv} + \sum_{v \in V} \text{AdmissionFee}(v)$
2. **Satisfies Visiting Time Windows:** Arrive at each city before its closing hour ($t_{\text{arr}} \le L_v$). If arriving before opening ($t_{\text{arr}} < E_v$), traveler waits until $E_v$.
3. **Satisfies Trip Duration Budget:** Total elapsed duration $\le T_{\max}$.
4. **Guarantees Tour Validity:** Every selected location is visited exactly once before returning to the origin hub.

---

## 2. Core DAA Algorithms Implemented

### A. Branch and Bound (B&B) with Dual Pruning
- **State-Space Tree:** Each node represents a partial tour sequence $[c_0, c_1, \dots, c_k]$.
- **Admissible Lower Bound:**
  $$LB(P) = \text{Cost}(P) + \min_{u \in U} C(c_k, u) + \sum_{u \in U} \min_{w \in (U \setminus \{u\}) \cup \{c_0\}} C(u, w)$$
  Where $U = V \setminus P$ is the set of unvisited locations.
- **Dual Pruning Mechanisms:**
  - **Cost Prune:** If $LB(P) \ge \text{BestKnownCost}$, the branch is discarded immediately.
  - **Schedule Prune:** If arrival time at next city exceeds its closing hour or total time exceeds $T_{\max}$, the branch is pruned.
- **Explainability:** Full search tree visualizer showing expanded nodes, pruned nodes, lower bounds, and step-by-step playback.

### B. Dynamic Programming (Bellman-Held-Karp for TSPTW)
- **Subproblem Decomposition:** Avoids redundant exploration of permutation subsets by memoizing states:
  $$DP(S, u) = \min_{v \in S \setminus \{u\}} [ DP(S \setminus \{u\}, v) + C(v, u) ]$$
  subject to $t_{\text{arr}} \le L_u$ and elapsed time $\le T_{\max}$.
- **Bitmask Representation:** Subsets $S \subseteq V$ represented as binary bitmasks (e.g., `0b1101`).
- **Optimal Substructure & Reconstruction:** Reconstructs the exact global optimum sequence in $O(N)$ time via predecessor pointers.
- **Explainability:** Interactive subproblem table showing subsets, bitmasks, optimal sub-costs, and memo cache hit counters.

### C. Greedy Nearest-Neighbor Heuristic (Benchmark)
- Runs in $O(N^2)$ polynomial time.
- Serves as an instant educational baseline to highlight the **optimality gap** (how greedy gets trapped in local minima).
- Primes Branch & Bound with a rapid initial upper bound to accelerate branch pruning.

---

## 3. Key Interactive Features
- **Multi-Location Selection:** Checkbox list allowing users to pick any subset of cities/landmarks.
- **Origin Hub Designation:** Set any destination as the starting and return hub.
- **Custom Location Creator:** Add arbitrary custom destinations with coordinates, fees, and visiting hours.
- **Time Schedule Manager:** Customize stay durations (e.g. 2h at a museum), opening times (e.g. 09:00), and closing deadlines (e.g. 18:00).
- **Interactive SVG Map:** Animated tour route showing directions, sequence numbers, coordinates, and full graph mesh.
- **Chronological Day Itinerary:** Step-by-step clock-time timeline (Departure $\to$ Transit $\to$ Wait time $\to$ Visit $\to$ Return).
- **Branch & Bound Tree Visualizer:** Step through tree exploration with play/pause and filter by prune reasons.
- **DP Subproblem Table:** Inspect Held-Karp subproblems, bitmasks, and memoization hit counts.
- **DAA Benchmark Dashboard:** Compare costs, durations, runtimes (ms), nodes evaluated, and prune efficiency.

---

## 4. How to Run

### Prerequisites
- Python 3.9+ (with `flask` and `flask-cors`)
- Node.js 18+ (with `npm`)

### Option 1: 1-Click Launch (Recommended)
Double-click `run.bat` or run in PowerShell:
```powershell
.\run.ps1
```

### Option 2: Manual Start

**Backend:**
```bash
cd backend
python app.py
# Runs on http://127.0.0.1:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## 5. Running Automated Tests
```bash
python backend/tests/test_algorithms.py
python backend/tests/test_api.py
```
Both test suites verify:
- Distance, cost, and time matrix symmetry and mathematical validity.
- Exact equivalence of optimal tour costs found by Dynamic Programming and Branch & Bound.
- Time-window pruning and deadline violation detection.
- Trip duration budget ($T_{\max}$) enforcement.
- REST API endpoint response schemas.

# travel-itinerary-optimizer
Algorithm-centric Travel Itinerary Optimizer using TSP with Time Windows and Maximum Trip Duration constraints.
