from typing import List, Dict, Any

PRESET_DATASETS: Dict[str, Dict[str, Any]] = {
    "europe": {
        "id": "europe",
        "name": "European Cultural Circuit",
        "region": "Europe",
        "description": "Iconic cultural capitals with historic landmarks, world-class museums, and rail links.",
        "default_start_id": "paris",
        "recommended_max_duration": 48.0, # hours
        "trip_start_hour": 8.0,
        "locations": [
            {
                "id": "paris",
                "name": "Paris (Louvre & Eiffel)",
                "lat": 48.8566,
                "lng": 2.3522,
                "visit_duration_hours": 3.0,
                "open_time": "09:00",
                "close_time": "21:00",
                "category": "monument",
                "rating": 4.9,
                "cost_per_entry": 22.0,
                "description": "Historic city center featuring the Louvre Museum and Eiffel Tower."
            },
            {
                "id": "brussels",
                "name": "Brussels (Grand Place)",
                "lat": 50.8503,
                "lng": 4.3517,
                "visit_duration_hours": 2.0,
                "open_time": "09:00",
                "close_time": "20:00",
                "category": "historic",
                "rating": 4.6,
                "cost_per_entry": 10.0,
                "description": "Gothic architecture, royal palaces, and chocolate chocolateries."
            },
            {
                "id": "amsterdam",
                "name": "Amsterdam (Canals & Rijksmuseum)",
                "lat": 52.3676,
                "lng": 4.9041,
                "visit_duration_hours": 2.5,
                "open_time": "09:00",
                "close_time": "18:00",
                "category": "museum",
                "rating": 4.8,
                "cost_per_entry": 20.0,
                "description": "Historic canals, Rijksmuseum, and bicycle-friendly boulevards."
            },
            {
                "id": "berlin",
                "name": "Berlin (Brandenburg Gate)",
                "lat": 52.5200,
                "lng": 13.4050,
                "visit_duration_hours": 3.0,
                "open_time": "10:00",
                "close_time": "22:00",
                "category": "monument",
                "rating": 4.7,
                "cost_per_entry": 15.0,
                "description": "Museum Island, Cold War history, and vibrant art districts."
            },
            {
                "id": "prague",
                "name": "Prague (Old Town Square)",
                "lat": 50.0755,
                "lng": 14.4378,
                "visit_duration_hours": 2.5,
                "open_time": "09:00",
                "close_time": "19:00",
                "category": "historic",
                "rating": 4.8,
                "cost_per_entry": 12.0,
                "description": "Charles Bridge, Bohemian gothic towers, and castle districts."
            },
            {
                "id": "vienna",
                "name": "Vienna (Schönbrunn Palace)",
                "lat": 48.2082,
                "lng": 16.3738,
                "visit_duration_hours": 2.5,
                "open_time": "08:30",
                "close_time": "18:30",
                "category": "palace",
                "rating": 4.9,
                "cost_per_entry": 25.0,
                "description": "Habsburg imperial palaces, classical music halls, and coffeehouses."
            }
        ]
    },
    "india": {
        "id": "india",
        "name": "Indian Golden Triangle & Heritage",
        "region": "India",
        "description": "Magnificent Mughal architecture, Rajasthani royal palaces, and sacred spiritual centers.",
        "default_start_id": "delhi",
        "recommended_max_duration": 40.0,
        "trip_start_hour": 7.5,
        "locations": [
            {
                "id": "delhi",
                "name": "Delhi (Red Fort & Qutub Minar)",
                "lat": 28.6139,
                "lng": 77.2090,
                "visit_duration_hours": 2.5,
                "open_time": "07:00",
                "close_time": "18:00",
                "category": "monument",
                "rating": 4.8,
                "cost_per_entry": 10.0,
                "description": "The capital city with rich architectural heritage spanning centuries."
            },
            {
                "id": "agra",
                "name": "Agra (Taj Mahal & Fort)",
                "lat": 27.1767,
                "lng": 78.0081,
                "visit_duration_hours": 3.0,
                "open_time": "06:00",
                "close_time": "18:30",
                "category": "wonder",
                "rating": 5.0,
                "cost_per_entry": 20.0,
                "description": "The ivory-white marble mausoleum on the south bank of the Yamuna."
            },
            {
                "id": "jaipur",
                "name": "Jaipur (Hawa Mahal & Amer Fort)",
                "lat": 26.9124,
                "lng": 75.7873,
                "visit_duration_hours": 2.5,
                "open_time": "08:00",
                "close_time": "18:00",
                "category": "palace",
                "rating": 4.9,
                "cost_per_entry": 15.0,
                "description": "The Pink City showcasing Rajput fortresses and pink terracotta facades."
            },
            {
                "id": "gwalior",
                "name": "Gwalior (Hilltop Fort)",
                "lat": 26.2183,
                "lng": 78.1828,
                "visit_duration_hours": 2.0,
                "open_time": "08:00",
                "close_time": "17:30",
                "category": "fort",
                "rating": 4.6,
                "cost_per_entry": 8.0,
                "description": "Impregnable hilltop fortress described as the pearl among Indian fortresses."
            },
            {
                "id": "mathura",
                "name": "Mathura (Krishna Janmabhoomi)",
                "lat": 27.4924,
                "lng": 77.6737,
                "visit_duration_hours": 1.5,
                "open_time": "06:00",
                "close_time": "21:00",
                "category": "spiritual",
                "rating": 4.7,
                "cost_per_entry": 5.0,
                "description": "Sacred pilgrimage center along the Yamuna river."
            }
        ]
    },
    "us_west": {
        "id": "us_west",
        "name": "California & West Coast Explorer",
        "region": "USA",
        "description": "Silicon Valley tech campuses, Pacific coast highways, and entertainment capitals.",
        "default_start_id": "sf",
        "recommended_max_duration": 36.0,
        "trip_start_hour": 8.0,
        "locations": [
            {
                "id": "sf",
                "name": "San Francisco (Golden Gate)",
                "lat": 37.7749,
                "lng": -122.4194,
                "visit_duration_hours": 2.5,
                "open_time": "07:00",
                "close_time": "22:00",
                "category": "monument",
                "rating": 4.9,
                "cost_per_entry": 0.0,
                "description": "Iconic suspension bridge, Fisherman's Wharf, and cable cars."
            },
            {
                "id": "sanjose",
                "name": "San Jose (Silicon Valley Tech Hub)",
                "lat": 37.3382,
                "lng": -121.8863,
                "visit_duration_hours": 2.0,
                "open_time": "09:00",
                "close_time": "18:00",
                "category": "tech",
                "rating": 4.6,
                "cost_per_entry": 18.0,
                "description": "Tech museum of innovation and global headquarters."
            },
            {
                "id": "monterey",
                "name": "Monterey (Bay Aquarium)",
                "lat": 36.6002,
                "lng": -121.8947,
                "visit_duration_hours": 2.5,
                "open_time": "09:30",
                "close_time": "17:30",
                "category": "aquarium",
                "rating": 4.9,
                "cost_per_entry": 50.0,
                "description": "Renowned marine sanctuary and scenic 17-Mile Drive."
            },
            {
                "id": "santabarbara",
                "name": "Santa Barbara (Historic Mission)",
                "lat": 34.4208,
                "lng": -119.6982,
                "visit_duration_hours": 1.5,
                "open_time": "09:00",
                "close_time": "17:00",
                "category": "historic",
                "rating": 4.7,
                "cost_per_entry": 12.0,
                "description": "Spanish colonial heritage, vineyards, and pristine coastline."
            },
            {
                "id": "la",
                "name": "Los Angeles (Griffith & Hollywood)",
                "lat": 34.0522,
                "lng": -118.2437,
                "visit_duration_hours": 3.0,
                "open_time": "08:00",
                "close_time": "22:00",
                "category": "entertainment",
                "rating": 4.8,
                "cost_per_entry": 25.0,
                "description": "Observatory views, Hollywood landmarks, and museum district."
            }
        ]
    }
}
