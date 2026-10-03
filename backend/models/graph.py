import math
from typing import List, Dict, Any, Optional
from .location import Location

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in km."""
    R = 6371.0 # Earth's radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class TravelGraph:
    def __init__(self, locations: List[Location], cost_per_km: float = 0.5, avg_speed_kmh: float = 65.0):
        self.locations = locations
        self.n = len(locations)
        self.cost_per_km = cost_per_km
        self.avg_speed_kmh = avg_speed_kmh

        # Matrices: n x n
        self.distance_matrix: List[List[float]] = [[0.0] * self.n for _ in range(self.n)]
        self.cost_matrix: List[List[float]] = [[0.0] * self.n for _ in range(self.n)]
        self.time_matrix: List[List[float]] = [[0.0] * self.n for _ in range(self.n)]

        self._compute_matrices()

    def _compute_matrices(self):
        for i in range(self.n):
            for j in range(self.n):
                if i == j:
                    self.distance_matrix[i][j] = 0.0
                    self.cost_matrix[i][j] = 0.0
                    self.time_matrix[i][j] = 0.0
                else:
                    dist = haversine_distance_km(
                        self.locations[i].lat, self.locations[i].lng,
                        self.locations[j].lat, self.locations[j].lng
                    )
                    # Add small transit overhead
                    self.distance_matrix[i][j] = round(dist, 1)
                    # Cost: base booking fee + distance rate
                    cost = 25.0 + (dist * self.cost_per_km)
                    self.cost_matrix[i][j] = round(cost, 2)
                    # Transit time in hours
                    transit_time = (dist / max(self.avg_speed_kmh, 1.0))
                    self.time_matrix[i][j] = round(transit_time, 2)

    def set_custom_matrices(self, cost_matrix: Optional[List[List[float]]] = None, time_matrix: Optional[List[List[float]]] = None):
        if cost_matrix and len(cost_matrix) == self.n:
            self.cost_matrix = cost_matrix
        if time_matrix and len(time_matrix) == self.n:
            self.time_matrix = time_matrix

    def to_dict(self) -> Dict[str, Any]:
        return {
            "locations": [loc.to_dict() for loc in self.locations],
            "n": self.n,
            "cost_matrix": self.cost_matrix,
            "time_matrix": self.time_matrix,
            "distance_matrix": self.distance_matrix,
            "cost_per_km": self.cost_per_km,
            "avg_speed_kmh": self.avg_speed_kmh
        }
