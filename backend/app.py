import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

from models.location import Location
from models.graph import TravelGraph
from models.itinerary import ItineraryBuilder
from algorithms.tsp_branch_bound import BranchAndBoundTSP
from algorithms.tsp_dp import DynamicProgrammingTSP
from algorithms.tsp_greedy import GreedyTSP
from algorithms.comparator import AlgorithmComparator
from data.presets import PRESET_DATASETS

app = Flask(__name__)
CORS(app)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Travel Itinerary Optimizer API",
        "version": "1.0.0"
    })

@app.route("/api/presets", methods=["GET"])
def get_presets():
    """Return all preset summaries."""
    summaries = []
    for pid, data in PRESET_DATASETS.items():
        summaries.append({
            "id": data["id"],
            "name": data["name"],
            "region": data["region"],
            "description": data["description"],
            "location_count": len(data["locations"]),
            "default_start_id": data["default_start_id"],
            "recommended_max_duration": data["recommended_max_duration"],
            "trip_start_hour": data.get("trip_start_hour", 8.0)
        })
    return jsonify({"presets": summaries})

@app.route("/api/presets/<preset_id>", methods=["GET"])
def get_preset_detail(preset_id: str):
    """Return full details for a specific preset."""
    if preset_id not in PRESET_DATASETS:
        return jsonify({"error": f"Preset '{preset_id}' not found"}), 404
    return jsonify({"preset": PRESET_DATASETS[preset_id]})

@app.route("/api/optimize", methods=["POST"])
def optimize_itinerary():
    """
    Accepts customized locations, start location, constraints, and algorithm choice.
    Returns optimal routes, schedule timeline, search tree / DP table, and comparisons.
    """
    try:
        body = request.get_json(force=True)
        if not body:
            return jsonify({"error": "Missing JSON request body"}), 400

        raw_locations = body.get("locations", [])
        if len(raw_locations) < 3:
            return jsonify({"error": "At least 3 locations must be selected to generate a tour itinerary."}), 400

        locations = [Location.from_dict(loc_data) for loc_data in raw_locations]
        
        start_city_id = body.get("start_city_id")
        start_idx = 0
        if start_city_id:
            for idx, loc in enumerate(locations):
                if loc.id == str(start_city_id):
                    start_idx = idx
                    break

        trip_start_hour = float(body.get("trip_start_hour", 8.0))
        max_trip_duration = float(body.get("max_trip_duration", 72.0))
        cost_per_km = float(body.get("cost_per_km", 0.5))
        avg_speed_kmh = float(body.get("avg_speed_kmh", 65.0))
        chosen_algorithm = body.get("algorithm", "all")

        # Build graph representation
        graph = TravelGraph(locations, cost_per_km=cost_per_km, avg_speed_kmh=avg_speed_kmh)

        # Run comparison / chosen algorithm
        comparator = AlgorithmComparator(graph, trip_start_hour=trip_start_hour, max_trip_duration=max_trip_duration)
        comparison_data = comparator.compare_all(start_city=start_idx)

        response_data = {
            "success": True,
            "graph": graph.to_dict(),
            "start_city_idx": start_idx,
            "start_city_name": locations[start_idx].name,
            "trip_start_hour": trip_start_hour,
            "max_trip_duration": max_trip_duration,
            "chosen_algorithm": chosen_algorithm,
            "comparison": comparison_data["comparison_matrix"],
            "explainability": comparison_data["explainability"],
            "algorithms": comparison_data["algorithms"]
        }

        return jsonify(response_data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5055))
    print(f"Starting Travel Itinerary Optimizer Backend on port {port}...")
    app.run(host="127.0.0.1", port=port, debug=False)

