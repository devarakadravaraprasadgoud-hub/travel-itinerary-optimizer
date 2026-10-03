from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any

@dataclass
class Location:
    id: str
    name: str
    lat: float
    lng: float
    visit_duration_hours: float = 2.0  # Duration spent exploring
    open_time: str = "08:00"           # "HH:MM" 24h format
    close_time: str = "20:00"          # "HH:MM" 24h format
    category: str = "attraction"       # e.g., "hub", "museum", "park", "monument", "dining"
    rating: float = 4.5                # 1.0 to 5.0
    cost_per_entry: float = 0.0        # Admission fee
    description: str = ""

    def get_open_hours_float(self) -> float:
        """Convert HH:MM string to float hours from midnight."""
        try:
            parts = self.open_time.split(":")
            return float(parts[0]) + float(parts[1]) / 60.0
        except Exception:
            return 8.0

    def get_close_hours_float(self) -> float:
        """Convert HH:MM string to float hours from midnight."""
        try:
            parts = self.close_time.split(":")
            return float(parts[0]) + float(parts[1]) / 60.0
        except Exception:
            return 20.0

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d['open_hours_float'] = self.get_open_hours_float()
        d['close_hours_float'] = self.get_close_hours_float()
        return d

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Location":
        return cls(
            id=str(data.get("id", "")),
            name=str(data.get("name", "Unknown")),
            lat=float(data.get("lat", 0.0)),
            lng=float(data.get("lng", 0.0)),
            visit_duration_hours=float(data.get("visit_duration_hours", 2.0)),
            open_time=str(data.get("open_time", "08:00")),
            close_time=str(data.get("close_time", "20:00")),
            category=str(data.get("category", "attraction")),
            rating=float(data.get("rating", 4.5)),
            cost_per_entry=float(data.get("cost_per_entry", 0.0)),
            description=str(data.get("description", ""))
        )
