from typing import List, Dict, Any
from .graph import TravelGraph

def format_clock_time(hours_from_midnight: float) -> str:
    """Format float hours (e.g., 9.5 -> '09:30 AM', 26.0 -> 'Day 2, 02:00 AM')"""
    total_minutes = int(round(hours_from_midnight * 60))
    days = total_minutes // (24 * 60)
    minutes_in_day = total_minutes % (24 * 60)
    hh = minutes_in_day // 60
    mm = minutes_in_day % 60
    ampm = "AM" if hh < 12 else "PM"
    display_hh = hh % 12
    if display_hh == 0:
        display_hh = 12
    time_str = f"{display_hh:02d}:{mm:02d} {ampm}"
    if days > 0:
        return f"Day {days + 1}, {time_str}"
    return time_str

class ItineraryBuilder:
    @staticmethod
    def build_schedule(
        route: List[int],
        graph: TravelGraph,
        trip_start_hour: float = 8.0,
        max_trip_duration: float = 72.0
    ) -> Dict[str, Any]:
        """
        Builds a comprehensive chronological itinerary for the given route sequence.
        Route includes return to start if tour, e.g. [0, 2, 1, 3, 0].
        """
        if not route:
            return {"feasible": False, "error": "Empty route"}

        timeline: List[Dict[str, Any]] = []
        current_clock = trip_start_hour
        total_transit_cost = 0.0
        total_admission_cost = 0.0
        total_wait_hours = 0.0
        total_transit_hours = 0.0
        total_visit_hours = 0.0
        violations = []

        # Start location info
        start_loc = graph.locations[route[0]]
        timeline.append({
            "step_type": "DEPARTURE_ORIGIN",
            "location_idx": route[0],
            "location_name": start_loc.name,
            "clock_time": format_clock_time(current_clock),
            "clock_float": round(current_clock, 2),
            "description": f"Start trip from {start_loc.name}"
        })

        for i in range(len(route) - 1):
            u = route[i]
            v = route[i + 1]
            u_loc = graph.locations[u]
            v_loc = graph.locations[v]

            transit_time = graph.time_matrix[u][v]
            transit_cost = graph.cost_matrix[u][v]
            dist_km = graph.distance_matrix[u][v]

            total_transit_cost += transit_cost
            total_transit_hours += transit_time

            depart_clock = current_clock
            arrival_clock = depart_clock + transit_time
            current_clock = arrival_clock

            is_return_to_origin = (i == len(route) - 2 and v == route[0])

            if is_return_to_origin:
                timeline.append({
                    "step_type": "RETURN_ORIGIN",
                    "from_idx": u,
                    "to_idx": v,
                    "location_name": v_loc.name,
                    "transit_hours": round(transit_time, 2),
                    "transit_cost": round(transit_cost, 2),
                    "distance_km": round(dist_km, 1),
                    "arrival_clock": format_clock_time(arrival_clock),
                    "clock_float": round(arrival_clock, 2),
                    "description": f"Transit back to origin {v_loc.name} ({transit_time:.1f} hrs, ${transit_cost:.2f})"
                })
            else:
                # Visiting location v
                # Check opening and closing hours
                open_hr = v_loc.get_open_hours_float()
                close_hr = v_loc.get_close_hours_float()
                
                # Normalize time to day hour for opening window check
                day_arrival_hr = arrival_clock % 24.0

                wait_hours = 0.0
                if day_arrival_hr < open_hr:
                    wait_hours = open_hr - day_arrival_hr
                elif day_arrival_hr > close_hr:
                    violations.append(
                        f"Arrived at {v_loc.name} at {format_clock_time(arrival_clock)} (closing was {format_clock_time(close_hr)})"
                    )

                visit_start_clock = arrival_clock + wait_hours
                visit_duration = v_loc.visit_duration_hours
                visit_end_clock = visit_start_clock + visit_duration
                admission_fee = v_loc.cost_per_entry

                total_wait_hours += wait_hours
                total_visit_hours += visit_duration
                total_admission_cost += admission_fee
                current_clock = visit_end_clock

                timeline.append({
                    "step_type": "VISIT_LOCATION",
                    "from_idx": u,
                    "to_idx": v,
                    "location_name": v_loc.name,
                    "transit_hours": round(transit_time, 2),
                    "transit_cost": round(transit_cost, 2),
                    "distance_km": round(dist_km, 1),
                    "arrival_clock": format_clock_time(arrival_clock),
                    "wait_hours": round(wait_hours, 2),
                    "visit_start_clock": format_clock_time(visit_start_clock),
                    "visit_duration": round(visit_duration, 2),
                    "visit_end_clock": format_clock_time(visit_end_clock),
                    "open_window": f"{v_loc.open_time} - {v_loc.close_time}",
                    "admission_fee": admission_fee,
                    "clock_float": round(visit_end_clock, 2),
                    "description": f"Visit {v_loc.name}: {visit_duration:.1f} hrs stay"
                })

        total_elapsed_hours = current_clock - trip_start_hour
        exceeds_max_duration = total_elapsed_hours > max_trip_duration
        if exceeds_max_duration:
            violations.append(f"Total trip duration ({total_elapsed_hours:.1f} hrs) exceeds budget ({max_trip_duration:.1f} hrs)")

        is_feasible = (len(violations) == 0)

        return {
            "feasible": is_feasible,
            "violations": violations,
            "total_cost": round(total_transit_cost + total_admission_cost, 2),
            "transit_cost": round(total_transit_cost, 2),
            "admission_cost": round(total_admission_cost, 2),
            "total_elapsed_hours": round(total_elapsed_hours, 2),
            "transit_hours": round(total_transit_hours, 2),
            "wait_hours": round(total_wait_hours, 2),
            "visit_hours": round(total_visit_hours, 2),
            "trip_start_hour": trip_start_hour,
            "max_trip_duration": max_trip_duration,
            "timeline": timeline,
            "route_names": [graph.locations[idx].name for idx in route]
        }
