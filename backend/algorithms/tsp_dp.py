import time
from typing import List, Dict, Any, Tuple, Optional
try:
    from models.graph import TravelGraph
except ImportError:
    from ..models.graph import TravelGraph

class DPEntry:
    def __init__(self, cost: float, clock_time: float, parent: Optional[int]):
        self.cost = cost
        self.clock_time = clock_time
        self.parent = parent
        self.hits = 0  # Number of times this subproblem state was referenced

class DynamicProgrammingTSP:
    def __init__(self, graph: TravelGraph, trip_start_hour: float = 8.0, max_trip_duration: float = 72.0):
        self.graph = graph
        self.n = graph.n
        self.trip_start_hour = trip_start_hour
        self.max_trip_duration = max_trip_duration

        # Metrics & Logs
        self.subproblems_computed = 0
        self.total_memo_hits = 0
        self.dp_table_log: List[Dict[str, Any]] = []

    def _calculate_arrival_and_depart(self, from_city: int, to_city: int, current_clock: float) -> Tuple[float, float, bool, str]:
        transit_time = self.graph.time_matrix[from_city][to_city]
        arrival_time = current_clock + transit_time

        to_loc = self.graph.locations[to_city]
        open_hr = to_loc.get_open_hours_float()
        close_hr = to_loc.get_close_hours_float()

        day_arrival_hr = arrival_time % 24.0

        if day_arrival_hr > close_hr:
            return arrival_time, arrival_time, False, f"Missed deadline: arrived {day_arrival_hr:.1f}h > {close_hr:.1f}h"

        wait_hours = 0.0
        if day_arrival_hr < open_hr:
            wait_hours = open_hr - day_arrival_hr

        start_visit = arrival_time + wait_hours
        depart_time = start_visit + to_loc.visit_duration_hours

        if (depart_time - self.trip_start_hour) > self.max_trip_duration:
            return arrival_time, depart_time, False, f"Total duration exceeds budget {self.max_trip_duration:.1f}h"

        return arrival_time, depart_time, True, "OK"

    def solve(self, start_city: int = 0) -> Dict[str, Any]:
        start_exec_time = time.perf_counter()
        self.subproblems_computed = 0
        self.total_memo_hits = 0
        self.dp_table_log.clear()

        # dp[(mask, u)] = DPEntry
        dp: Dict[Tuple[int, int], DPEntry] = {}

        # Base case: only start_city is visited
        initial_mask = 1 << start_city
        dp[(initial_mask, start_city)] = DPEntry(cost=0.0, clock_time=self.trip_start_hour, parent=None)
        self.subproblems_computed += 1

        all_cities = list(range(self.n))

        # Iterate over subset sizes from 2 to n
        for subset_size in range(2, self.n + 1):
            # Generate all subsets of given size that include start_city
            for mask in range(1 << self.n):
                if not (mask & (1 << start_city)):
                    continue
                if bin(mask).count('1') != subset_size:
                    continue

                for u in all_cities:
                    if u == start_city or not (mask & (1 << u)):
                        continue

                    prev_mask = mask ^ (1 << u)
                    best_cost = float('inf')
                    best_time = float('inf')
                    best_parent = None

                    # Check all possible predecessors v in prev_mask
                    for v in all_cities:
                        if not (prev_mask & (1 << v)):
                            continue

                        prev_state = dp.get((prev_mask, v))
                        if prev_state is None or prev_state.cost == float('inf'):
                            continue

                        prev_state.hits += 1
                        self.total_memo_hits += 1

                        # Feasibility transition
                        arr_time, dep_time, is_feas, _ = self._calculate_arrival_and_depart(
                            v, u, prev_state.clock_time
                        )

                        if not is_feas:
                            continue

                        candidate_cost = prev_state.cost + self.graph.cost_matrix[v][u]

                        # Objective: minimize cost; if tied, minimize time
                        if candidate_cost < best_cost or (abs(candidate_cost - best_cost) < 1e-4 and dep_time < best_time):
                            best_cost = candidate_cost
                            best_time = dep_time
                            best_parent = v

                    if best_parent is not None:
                        dp[(mask, u)] = DPEntry(cost=best_cost, clock_time=best_time, parent=best_parent)
                        self.subproblems_computed += 1

        # Reconstruct optimal tour: visit all cities and return to start_city
        full_mask = (1 << self.n) - 1
        best_tour_cost = float('inf')
        last_city = None
        best_final_clock = float('inf')

        for u in all_cities:
            if u == start_city:
                continue

            state = dp.get((full_mask, u))
            if state is None or state.cost == float('inf'):
                continue

            # Return transit to start_city
            ret_transit_time = self.graph.time_matrix[u][start_city]
            ret_transit_cost = self.graph.cost_matrix[u][start_city]
            final_clock = state.clock_time + ret_transit_time
            total_duration = final_clock - self.trip_start_hour

            if total_duration <= self.max_trip_duration:
                total_cost = state.cost + ret_transit_cost
                if total_cost < best_tour_cost:
                    best_tour_cost = total_cost
                    last_city = u
                    best_final_clock = final_clock

        # Backtrack path
        best_path: Optional[List[int]] = None
        if last_city is not None:
            path = [start_city]
            curr_city = last_city
            curr_mask = full_mask

            rev_path = []
            while curr_city != start_city and curr_city is not None:
                rev_path.append(curr_city)
                parent = dp[(curr_mask, curr_city)].parent
                curr_mask ^= (1 << curr_city)
                curr_city = parent

            rev_path.reverse()
            best_path = [start_city] + rev_path + [start_city]

        # Log representative DP table states for UI visualization
        MAX_DP_LOGS = 150
        logged_states = 0
        for (m, u), entry in sorted(dp.items(), key=lambda item: (bin(item[0][0]).count('1'), item[0][0])):
            if logged_states >= MAX_DP_LOGS:
                break
            city_names = [self.graph.locations[i].name for i in range(self.n) if (m & (1 << i))]
            pred_name = self.graph.locations[entry.parent].name if entry.parent is not None else "None"
            self.dp_table_log.append({
                "mask": m,
                "mask_bin": bin(m),
                "subset_size": len(city_names),
                "cities": city_names,
                "current_city": self.graph.locations[u].name,
                "predecessor": pred_name,
                "min_cost": round(entry.cost, 2),
                "clock_time": round(entry.clock_time, 2),
                "memo_hits": entry.hits
            })
            logged_states += 1

        exec_time_ms = round((time.perf_counter() - start_exec_time) * 1000, 2)

        return {
            "algorithm": "Dynamic Programming (Held-Karp)",
            "feasible": best_path is not None,
            "best_cost": round(best_tour_cost, 2) if best_path else None,
            "best_path": best_path,
            "execution_time_ms": exec_time_ms,
            "subproblems_computed": self.subproblems_computed,
            "total_memo_hits": self.total_memo_hits,
            "theoretical_max_states": self.n * (2 ** self.n),
            "dp_table": self.dp_table_log
        }
