import time
import heapq
from typing import List, Dict, Any, Tuple, Optional
try:
    from models.graph import TravelGraph
except ImportError:
    from ..models.graph import TravelGraph

class BBNode:
    def __init__(
        self,
        node_id: int,
        parent_id: Optional[int],
        city: int,
        path: List[int],
        cost: float,
        clock_time: float,
        lower_bound: float,
        level: int
    ):
        self.node_id = node_id
        self.parent_id = parent_id
        self.city = city
        self.path = path
        self.cost = cost
        self.clock_time = clock_time
        self.lower_bound = lower_bound
        self.level = level

    def __lt__(self, other: "BBNode") -> bool:
        # Best-first search: lowest lower bound first, then deeper level
        if abs(self.lower_bound - other.lower_bound) > 1e-4:
            return self.lower_bound < other.lower_bound
        return self.level > other.level

class BranchAndBoundTSP:
    def __init__(self, graph: TravelGraph, trip_start_hour: float = 8.0, max_trip_duration: float = 72.0):
        self.graph = graph
        self.n = graph.n
        self.trip_start_hour = trip_start_hour
        self.max_trip_duration = max_trip_duration

        # Metrics & Visual Tree
        self.tree_nodes: List[Dict[str, Any]] = []
        self.nodes_expanded = 0
        self.nodes_pruned_bound = 0
        self.nodes_pruned_time = 0
        self.solutions_evaluated = 0
        self.best_solution_updates = 0
        self.max_tree_depth = 0

    def _calculate_lower_bound(self, current_cost: float, current_city: int, unvisited: List[int], start_city: int) -> float:
        """
        Admissible lower bound for TSP:
        Current cost + min edge from current_city to unvisited + sum of min outgoing edges from each unvisited node.
        """
        if not unvisited:
            return current_cost + self.graph.cost_matrix[current_city][start_city]

        bound = current_cost

        # Min edge from current city to any unvisited city
        min_from_curr = min(self.graph.cost_matrix[current_city][u] for u in unvisited)
        bound += min_from_curr

        # For each unvisited city, min edge to another unvisited city or back to start
        target_pool = unvisited + [start_city]
        for u in unvisited:
            possible_edges = [self.graph.cost_matrix[u][w] for w in target_pool if w != u]
            if possible_edges:
                bound += min(possible_edges)

        return round(bound, 2)

    def _calculate_arrival_and_depart(self, from_city: int, to_city: int, current_clock: float) -> Tuple[float, float, bool, str]:
        """
        Calculate transit arrival, wait time, visit duration, and departure time.
        Returns: (arrival_time, departure_time, is_feasible, reason)
        """
        transit_time = self.graph.time_matrix[from_city][to_city]
        arrival_time = current_clock + transit_time

        to_loc = self.graph.locations[to_city]
        open_hr = to_loc.get_open_hours_float()
        close_hr = to_loc.get_close_hours_float()

        day_arrival_hr = arrival_time % 24.0

        if day_arrival_hr > close_hr:
            return arrival_time, arrival_time, False, f"Arrival ({day_arrival_hr:.1f}h) exceeds closing time ({close_hr:.1f}h)"

        wait_hours = 0.0
        if day_arrival_hr < open_hr:
            wait_hours = open_hr - day_arrival_hr

        start_visit = arrival_time + wait_hours
        depart_time = start_visit + to_loc.visit_duration_hours

        # Check total duration from trip start
        if (depart_time - self.trip_start_hour) > self.max_trip_duration:
            return arrival_time, depart_time, False, f"Elapsed time exceeds budget ({self.max_trip_duration:.1f}h)"

        return arrival_time, depart_time, True, "OK"

    def solve(self, start_city: int = 0) -> Dict[str, Any]:
        start_exec_time = time.perf_counter()
        self.tree_nodes.clear()
        self.nodes_expanded = 0
        self.nodes_pruned_bound = 0
        self.nodes_pruned_time = 0
        self.solutions_evaluated = 0
        self.best_solution_updates = 0
        self.max_tree_depth = 0

        best_cost = float('inf')
        best_path: Optional[List[int]] = None
        best_finish_time = float('inf')

        # Generate initial upper bound using a quick greedy heuristic
        initial_cost, initial_path = self._quick_greedy_upper_bound(start_city)
        if initial_path and initial_cost < float('inf'):
            best_cost = initial_cost
            best_path = initial_path

        # Root node
        node_counter = 0
        root_unvisited = [i for i in range(self.n) if i != start_city]
        root_bound = self._calculate_lower_bound(0.0, start_city, root_unvisited, start_city)

        start_loc = self.graph.locations[start_city]
        initial_clock = self.trip_start_hour

        root_node = BBNode(
            node_id=node_counter,
            parent_id=None,
            city=start_city,
            path=[start_city],
            cost=0.0,
            clock_time=initial_clock,
            lower_bound=root_bound,
            level=0
        )

        pq = [root_node]
        self._record_tree_node(root_node, "EXPANDED", f"Root: {start_loc.name}")

        MAX_RECORDED_TREE_NODES = 400

        while pq:
            curr = heapq.heappop(pq)
            self.nodes_expanded += 1
            if curr.level > self.max_tree_depth:
                self.max_tree_depth = curr.level

            # Check if lower bound >= current best known cost
            if curr.lower_bound >= best_cost:
                self.nodes_pruned_bound += 1
                if len(self.tree_nodes) < MAX_RECORDED_TREE_NODES:
                    self._update_node_status(curr.node_id, "PRUNED_BOUND", f"Bound {curr.lower_bound:.1f} >= Best {best_cost:.1f}")
                continue

            # Leaf level: visited all cities, now return to start_city
            if curr.level == self.n - 1:
                return_transit_time = self.graph.time_matrix[curr.city][start_city]
                return_transit_cost = self.graph.cost_matrix[curr.city][start_city]
                final_cost = curr.cost + return_transit_cost
                final_clock = curr.clock_time + return_transit_time
                total_duration = final_clock - self.trip_start_hour

                self.solutions_evaluated += 1

                if total_duration <= self.max_trip_duration and final_cost < best_cost:
                    best_cost = round(final_cost, 2)
                    best_path = curr.path + [start_city]
                    best_finish_time = final_clock
                    self.best_solution_updates += 1

                    node_counter += 1
                    leaf_node = BBNode(
                        node_id=node_counter,
                        parent_id=curr.node_id,
                        city=start_city,
                        path=best_path,
                        cost=best_cost,
                        clock_time=final_clock,
                        lower_bound=best_cost,
                        level=curr.level + 1
                    )
                    if len(self.tree_nodes) < MAX_RECORDED_TREE_NODES:
                        self._record_tree_node(leaf_node, "NEW_BEST", f"Feasible Tour: ${best_cost:.2f}, {total_duration:.1f}h")
                else:
                    reason = "Exceeds duration budget" if total_duration > self.max_trip_duration else f"Cost {final_cost:.1f} >= Best {best_cost:.1f}"
                    self.nodes_pruned_time += 1 if total_duration > self.max_trip_duration else 0
                    self.nodes_pruned_bound += 1 if total_duration <= self.max_trip_duration else 0
                    if len(self.tree_nodes) < MAX_RECORDED_TREE_NODES:
                        node_counter += 1
                        leaf_node = BBNode(node_counter, curr.node_id, start_city, curr.path + [start_city], final_cost, final_clock, final_cost, curr.level + 1)
                        self._record_tree_node(leaf_node, "PRUNED_LEAF", reason)
                continue

            # Branch to unvisited cities
            visited_set = set(curr.path)
            unvisited_cities = [c for c in range(self.n) if c not in visited_set]

            for next_city in unvisited_cities:
                node_counter += 1
                edge_cost = self.graph.cost_matrix[curr.city][next_city]
                new_cost = curr.cost + edge_cost

                # Calculate schedule & feasibility
                arrival_time, depart_time, is_feasible, time_reason = self._calculate_arrival_and_depart(
                    curr.city, next_city, curr.clock_time
                )

                new_unvisited = [c for c in unvisited_cities if c != next_city]
                new_bound = self._calculate_lower_bound(new_cost, next_city, new_unvisited, start_city)

                new_node = BBNode(
                    node_id=node_counter,
                    parent_id=curr.node_id,
                    city=next_city,
                    path=curr.path + [next_city],
                    cost=round(new_cost, 2),
                    clock_time=depart_time,
                    lower_bound=new_bound,
                    level=curr.level + 1
                )

                # Pruning checks
                if not is_feasible:
                    self.nodes_pruned_time += 1
                    if len(self.tree_nodes) < MAX_RECORDED_TREE_NODES:
                        self._record_tree_node(new_node, "PRUNED_TIME", time_reason)
                    continue

                if new_bound >= best_cost:
                    self.nodes_pruned_bound += 1
                    if len(self.tree_nodes) < MAX_RECORDED_TREE_NODES:
                        self._record_tree_node(new_node, "PRUNED_BOUND", f"Bound {new_bound:.1f} >= Best {best_cost:.1f}")
                    continue

                # Feasible and promising branch
                if len(self.tree_nodes) < MAX_RECORDED_TREE_NODES:
                    self._record_tree_node(new_node, "EXPANDED", f"Visiting {self.graph.locations[next_city].name}")
                heapq.heappush(pq, new_node)

        exec_time_ms = round((time.perf_counter() - start_exec_time) * 1000, 2)

        return {
            "algorithm": "Branch and Bound",
            "feasible": best_path is not None,
            "best_cost": best_cost if best_path else None,
            "best_path": best_path,
            "execution_time_ms": exec_time_ms,
            "nodes_expanded": self.nodes_expanded,
            "nodes_pruned_bound": self.nodes_pruned_bound,
            "nodes_pruned_time": self.nodes_pruned_time,
            "total_nodes_evaluated": self.nodes_expanded + self.nodes_pruned_bound + self.nodes_pruned_time,
            "best_solution_updates": self.best_solution_updates,
            "max_tree_depth": self.max_tree_depth,
            "tree_trace": self.tree_nodes[:MAX_RECORDED_TREE_NODES]
        }

    def _quick_greedy_upper_bound(self, start_city: int) -> Tuple[float, Optional[List[int]]]:
        """Generate a greedy upper bound to prime B&B pruning."""
        unvisited = set(range(self.n))
        unvisited.remove(start_city)
        path = [start_city]
        current = start_city
        cost = 0.0
        current_clock = self.trip_start_hour

        while unvisited:
            best_next = None
            best_edge = float('inf')
            best_depart = current_clock

            for cand in unvisited:
                c = self.graph.cost_matrix[current][cand]
                arr, dep, feas, _ = self._calculate_arrival_and_depart(current, cand, current_clock)
                if feas and c < best_edge:
                    best_edge = c
                    best_next = cand
                    best_depart = dep

            if best_next is None:
                return float('inf'), None

            cost += best_edge
            path.append(best_next)
            unvisited.remove(best_next)
            current = best_next
            current_clock = best_depart

        # Return to start
        return_cost = self.graph.cost_matrix[current][start_city]
        return_time = self.graph.time_matrix[current][start_city]
        total_time = (current_clock + return_time) - self.trip_start_hour

        if total_time <= self.max_trip_duration:
            return round(cost + return_cost, 2), path + [start_city]
        return float('inf'), None

    def _record_tree_node(self, node: BBNode, status: str, explanation: str):
        city_name = self.graph.locations[node.city].name if node.city < self.n else "Return"
        self.tree_nodes.append({
            "id": node.node_id,
            "parentId": node.parent_id,
            "city": node.city,
            "cityName": city_name,
            "path": [self.graph.locations[c].name for c in node.path],
            "cost": node.cost,
            "clock_time": round(node.clock_time, 2),
            "lower_bound": node.lower_bound,
            "level": node.level,
            "status": status,
            "explanation": explanation
        })

    def _update_node_status(self, node_id: int, status: str, explanation: str):
        for item in self.tree_nodes:
            if item["id"] == node_id:
                item["status"] = status
                item["explanation"] = explanation
                break
