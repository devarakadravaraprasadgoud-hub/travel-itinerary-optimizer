import time
from typing import List, Dict, Any, Tuple, Optional
try:
    from models.graph import TravelGraph
except ImportError:
    from ..models.graph import TravelGraph

class GreedyTSP:
    def __init__(self, graph: TravelGraph, trip_start_hour: float = 8.0, max_trip_duration: float = 72.0):
        self.graph = graph
        self.n = graph.n
        self.trip_start_hour = trip_start_hour
        self.max_trip_duration = max_trip_duration

    def _calculate_arrival_and_depart(self, from_city: int, to_city: int, current_clock: float) -> Tuple[float, float, bool, str]:
        transit_time = self.graph.time_matrix[from_city][to_city]
        arrival_time = current_clock + transit_time

        to_loc = self.graph.locations[to_city]
        open_hr = to_loc.get_open_hours_float()
        close_hr = to_loc.get_close_hours_float()

        day_arrival_hr = arrival_time % 24.0

        if day_arrival_hr > close_hr:
            return arrival_time, arrival_time, False, f"Missed deadline: {day_arrival_hr:.1f}h > {close_hr:.1f}h"

        wait_hours = 0.0
        if day_arrival_hr < open_hr:
            wait_hours = open_hr - day_arrival_hr

        start_visit = arrival_time + wait_hours
        depart_time = start_visit + to_loc.visit_duration_hours

        if (depart_time - self.trip_start_hour) > self.max_trip_duration:
            return arrival_time, depart_time, False, f"Exceeds max duration {self.max_trip_duration:.1f}h"

        return arrival_time, depart_time, True, "OK"

    def solve(self, start_city: int = 0) -> Dict[str, Any]:
        start_exec_time = time.perf_counter()
        unvisited = set(range(self.n))
        unvisited.remove(start_city)

        path = [start_city]
        current = start_city
        cost = 0.0
        current_clock = self.trip_start_hour
        steps_log = []

        is_feasible = True

        while unvisited:
            best_cand = None
            best_edge = float('inf')
            best_dep = current_clock

            # Find nearest feasible unvisited city
            for cand in sorted(unvisited):
                edge_cost = self.graph.cost_matrix[current][cand]
                arr, dep, feas, reason = self._calculate_arrival_and_depart(current, cand, current_clock)
                
                # We prioritize feasibility, then lowest edge cost
                if feas and edge_cost < best_edge:
                    best_edge = edge_cost
                    best_cand = cand
                    best_dep = dep

            # If no feasible candidate found, fallback to minimum cost edge even if infeasible to show comparison
            if best_cand is None:
                is_feasible = False
                best_cand = min(unvisited, key=lambda c: self.graph.cost_matrix[current][c])
                best_edge = self.graph.cost_matrix[current][best_cand]
                arr, best_dep, _, _ = self._calculate_arrival_and_depart(current, best_cand, current_clock)

            cost += best_edge
            path.append(best_cand)
            steps_log.append({
                "from": self.graph.locations[current].name,
                "to": self.graph.locations[best_cand].name,
                "cost": round(best_edge, 2),
                "clock": round(best_dep, 2)
            })
            unvisited.remove(best_cand)
            current = best_cand
            current_clock = best_dep

        # Return to start_city
        return_cost = self.graph.cost_matrix[current][start_city]
        return_time = self.graph.time_matrix[current][start_city]
        final_clock = current_clock + return_time
        cost += return_cost
        path.append(start_city)

        if (final_clock - self.trip_start_hour) > self.max_trip_duration:
            is_feasible = False

        exec_time_ms = round((time.perf_counter() - start_exec_time) * 1000, 2)

        return {
            "algorithm": "Greedy (Nearest Neighbor)",
            "feasible": is_feasible,
            "best_cost": round(cost, 2),
            "best_path": path,
            "execution_time_ms": exec_time_ms,
            "steps_log": steps_log
        }
