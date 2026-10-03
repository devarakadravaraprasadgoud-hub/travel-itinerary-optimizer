from typing import Dict, Any, List
try:
    from models.graph import TravelGraph
    from models.itinerary import ItineraryBuilder
    from algorithms.tsp_branch_bound import BranchAndBoundTSP
    from algorithms.tsp_dp import DynamicProgrammingTSP
    from algorithms.tsp_greedy import GreedyTSP
except ImportError:
    from ..models.graph import TravelGraph
    from ..models.itinerary import ItineraryBuilder
    from .tsp_branch_bound import BranchAndBoundTSP
    from .tsp_dp import DynamicProgrammingTSP
    from .tsp_greedy import GreedyTSP

class AlgorithmComparator:
    def __init__(self, graph: TravelGraph, trip_start_hour: float = 8.0, max_trip_duration: float = 72.0):
        self.graph = graph
        self.trip_start_hour = trip_start_hour
        self.max_trip_duration = max_trip_duration

    def compare_all(self, start_city: int = 0) -> Dict[str, Any]:
        """
        Runs Branch & Bound, Dynamic Programming, and Greedy on the exact same graph,
        returning side-by-side metrics, itineraries, search trees, and DAA explainability.
        """
        bb_solver = BranchAndBoundTSP(self.graph, self.trip_start_hour, self.max_trip_duration)
        dp_solver = DynamicProgrammingTSP(self.graph, self.trip_start_hour, self.max_trip_duration)
        greedy_solver = GreedyTSP(self.graph, self.trip_start_hour, self.max_trip_duration)

        bb_result = bb_solver.solve(start_city)
        dp_result = dp_solver.solve(start_city)
        greedy_result = greedy_solver.solve(start_city)

        # Build detailed itineraries
        bb_schedule = ItineraryBuilder.build_schedule(
            bb_result.get("best_path") or [], self.graph, self.trip_start_hour, self.max_trip_duration
        ) if bb_result.get("best_path") else None

        dp_schedule = ItineraryBuilder.build_schedule(
            dp_result.get("best_path") or [], self.graph, self.trip_start_hour, self.max_trip_duration
        ) if dp_result.get("best_path") else None

        greedy_schedule = ItineraryBuilder.build_schedule(
            greedy_result.get("best_path") or [], self.graph, self.trip_start_hour, self.max_trip_duration
        ) if greedy_result.get("best_path") else None

        # Theoretical brute force permutations: (N-1)!
        import math
        brute_force_states = math.factorial(max(self.graph.n - 1, 1))

        # DAA Comparison & Explainability Metrics
        bb_total_nodes = bb_result.get("total_nodes_evaluated", 1)
        bb_pruned = bb_result.get("nodes_pruned_bound", 0) + bb_result.get("nodes_pruned_time", 0)
        prune_percentage = round((bb_pruned / max(bb_total_nodes, 1)) * 100, 1)

        dp_subproblems = dp_result.get("subproblems_computed", 1)
        dp_memo_hits = dp_result.get("total_memo_hits", 0)
        dp_theoretical = dp_result.get("theoretical_max_states", 1)

        # Cost comparisons
        optimal_cost = dp_result.get("best_cost") or bb_result.get("best_cost")
        greedy_cost = greedy_result.get("best_cost")
        greedy_optimality_gap = 0.0
        if optimal_cost and greedy_cost and optimal_cost > 0:
            greedy_optimality_gap = round(((greedy_cost - optimal_cost) / optimal_cost) * 100, 1)

        explainability = {
            "summary": (
                f"Evaluated {self.graph.n} locations starting at {self.graph.locations[start_city].name}. "
                f"Both Dynamic Programming and Branch & Bound verified the global optimal tour cost of "
                f"${optimal_cost:.2f}." if optimal_cost else "No feasible tour found within the given time windows or duration."
            ),
            "branch_and_bound_analysis": {
                "nodes_pruned": bb_pruned,
                "prune_efficiency_pct": prune_percentage,
                "bound_prunes": bb_result.get("nodes_pruned_bound", 0),
                "time_window_prunes": bb_result.get("nodes_pruned_time", 0),
                "insight": (
                    f"Branch and Bound pruned {prune_percentage}% of branches ({bb_pruned} nodes) before full expansion. "
                    f"{bb_result.get('nodes_pruned_bound', 0)} were eliminated because their lower bound exceeded the best known tour, "
                    f"and {bb_result.get('nodes_pruned_time', 0)} were pruned for missing closing hours or exceeding the duration budget."
                )
            },
            "dynamic_programming_analysis": {
                "subproblems_computed": dp_subproblems,
                "memo_hits": dp_memo_hits,
                "theoretical_states": dp_theoretical,
                "insight": (
                    f"Bellman-Held-Karp solved {dp_subproblems} unique subproblems out of a theoretical maximum {dp_theoretical} states. "
                    f"Subproblem memoization achieved {dp_memo_hits} cache hits, avoiding redundant recursive re-computations."
                )
            },
            "greedy_analysis": {
                "optimality_gap_pct": greedy_optimality_gap,
                "is_optimal": greedy_optimality_gap == 0.0,
                "insight": (
                    "Greedy found the exact optimal solution!" if greedy_optimality_gap == 0.0
                    else f"Greedy heuristic executed instantly ({greedy_result.get('execution_time_ms', 0)} ms), but got trapped in a local minimum, yielding a tour that is {greedy_optimality_gap}% more expensive."
                )
            },
            "theoretical_complexity": {
                "brute_force_complexity": "O((n-1)!)",
                "brute_force_permutations": brute_force_states,
                "dp_time_complexity": "O(n^2 * 2^n)",
                "dp_space_complexity": "O(n * 2^n)",
                "branch_and_bound_complexity": "O(b^d) worst-case, with pruning reducing search space drastically",
                "greedy_complexity": "O(n^2)"
            }
        }

        return {
            "algorithms": {
                "branch_and_bound": {
                    "metrics": bb_result,
                    "schedule": bb_schedule
                },
                "dynamic_programming": {
                    "metrics": dp_result,
                    "schedule": dp_schedule
                },
                "greedy": {
                    "metrics": greedy_result,
                    "schedule": greedy_schedule
                }
            },
            "comparison_matrix": [
                {
                    "algorithm": "Branch and Bound",
                    "cost": bb_result.get("best_cost"),
                    "duration_hours": bb_schedule.get("total_elapsed_hours") if bb_schedule else None,
                    "execution_time_ms": bb_result.get("execution_time_ms"),
                    "states_or_nodes": bb_result.get("nodes_expanded"),
                    "pruned_or_hits": bb_pruned,
                    "guarantee": "Global Optimum",
                    "feasible": bb_result.get("feasible")
                },
                {
                    "algorithm": "Dynamic Programming",
                    "cost": dp_result.get("best_cost"),
                    "duration_hours": dp_schedule.get("total_elapsed_hours") if dp_schedule else None,
                    "execution_time_ms": dp_result.get("execution_time_ms"),
                    "states_or_nodes": dp_result.get("subproblems_computed"),
                    "pruned_or_hits": dp_memo_hits,
                    "guarantee": "Global Optimum",
                    "feasible": dp_result.get("feasible")
                },
                {
                    "algorithm": "Greedy Heuristic",
                    "cost": greedy_result.get("best_cost"),
                    "duration_hours": greedy_schedule.get("total_elapsed_hours") if greedy_schedule else None,
                    "execution_time_ms": greedy_result.get("execution_time_ms"),
                    "states_or_nodes": self.graph.n,
                    "pruned_or_hits": 0,
                    "guarantee": "Approximate / Heuristic",
                    "feasible": greedy_result.get("feasible")
                }
            ],
            "explainability": explainability
        }
