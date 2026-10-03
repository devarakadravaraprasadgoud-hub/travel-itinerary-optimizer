import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.location import Location
from models.graph import TravelGraph
from models.itinerary import ItineraryBuilder
from algorithms.tsp_branch_bound import BranchAndBoundTSP
from algorithms.tsp_dp import DynamicProgrammingTSP
from algorithms.tsp_greedy import GreedyTSP
from algorithms.comparator import AlgorithmComparator

def get_test_locations():
    return [
        Location(id="A", name="City A", lat=48.8566, lng=2.3522, visit_duration_hours=1.0, open_time="08:00", close_time="20:00"),
        Location(id="B", name="City B", lat=50.8503, lng=4.3517, visit_duration_hours=1.5, open_time="09:00", close_time="19:00"),
        Location(id="C", name="City C", lat=52.3676, lng=4.9041, visit_duration_hours=2.0, open_time="09:00", close_time="18:00"),
        Location(id="D", name="City D", lat=51.2194, lng=4.4025, visit_duration_hours=1.0, open_time="08:00", close_time="21:00")
    ]

class TestTravelAlgorithms(unittest.TestCase):
    def test_graph_creation(self):
        locs = get_test_locations()
        graph = TravelGraph(locs)
        self.assertEqual(graph.n, 4)
        self.assertEqual(graph.cost_matrix[0][0], 0.0)
        self.assertGreater(graph.distance_matrix[0][1], 0.0)
        self.assertAlmostEqual(graph.distance_matrix[0][1], graph.distance_matrix[1][0], places=4)

    def test_dp_and_bb_consistency(self):
        locs = get_test_locations()
        graph = TravelGraph(locs)

        bb = BranchAndBoundTSP(graph, trip_start_hour=8.0, max_trip_duration=72.0)
        dp = DynamicProgrammingTSP(graph, trip_start_hour=8.0, max_trip_duration=72.0)

        bb_res = bb.solve(start_city=0)
        dp_res = dp.solve(start_city=0)

        self.assertTrue(bb_res["feasible"])
        self.assertTrue(dp_res["feasible"])
        # Both exact algorithms should find identical global optimal tour cost!
        self.assertAlmostEqual(bb_res["best_cost"], dp_res["best_cost"], delta=0.5)
        # Both paths should visit all 4 cities and return to 0 (length 5)
        self.assertEqual(len(bb_res["best_path"]), 5)
        self.assertEqual(len(dp_res["best_path"]), 5)
        self.assertEqual(bb_res["best_path"][0], 0)
        self.assertEqual(bb_res["best_path"][-1], 0)
        self.assertEqual(dp_res["best_path"][0], 0)
        self.assertEqual(dp_res["best_path"][-1], 0)

    def test_time_window_pruning(self):
        locs = get_test_locations()
        # Make City C close extremely early (08:05) so it's impossible to reach in time from City A
        locs[2].open_time = "08:00"
        locs[2].close_time = "08:05"

        graph = TravelGraph(locs)
        bb = BranchAndBoundTSP(graph, trip_start_hour=8.0, max_trip_duration=72.0)
        res = bb.solve(start_city=0)

        self.assertTrue(not res["feasible"] or res["nodes_pruned_time"] > 0)

    def test_duration_budget_constraint(self):
        locs = get_test_locations()
        graph = TravelGraph(locs)
        # Total transit + visit time is well over 10 hours. Set budget to only 2 hours.
        bb = BranchAndBoundTSP(graph, trip_start_hour=8.0, max_trip_duration=2.0)
        dp = DynamicProgrammingTSP(graph, trip_start_hour=8.0, max_trip_duration=2.0)

        bb_res = bb.solve(start_city=0)
        dp_res = dp.solve(start_city=0)

        self.assertFalse(bb_res["feasible"])
        self.assertFalse(dp_res["feasible"])

    def test_algorithm_comparator(self):
        locs = get_test_locations()
        graph = TravelGraph(locs)
        comparator = AlgorithmComparator(graph, trip_start_hour=8.0, max_trip_duration=48.0)
        res = comparator.compare_all(start_city=0)

        self.assertIn("comparison_matrix", res)
        self.assertIn("explainability", res)
        self.assertEqual(len(res["comparison_matrix"]), 3)
        self.assertGreaterEqual(res["explainability"]["branch_and_bound_analysis"]["prune_efficiency_pct"], 0)

if __name__ == "__main__":
    unittest.main()

