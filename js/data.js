/**
 * data.js — Bhopal Farmline
 * --------------------------------------------------------------------------
 * Directory Configuration & Data Store
 * 
 * NOTE: ZERO dummy farmhouses are stored here.
 * Real listings are fetched 100% dynamically from Supabase database.
 * --------------------------------------------------------------------------
 */

// 1. Live Listings — empty array (populated dynamically from Supabase at runtime)
window.farmhouses = [];

// 2. Filter by Region — predefined Bhopal areas for the filter bar
window.areas = [
  "Kolar Road",
  "Ratibad",
  "Berasia Road",
  "Vidisha Road",
  "Obedullaganj",
  "Hoshangabad Road",
  "Kerwa Dam",
  "Misrod",
  "Neelbad",
  "Phanda",
  "Katara Hills",
  "Bairagarh",
  "Raisen Road",
  "Sehore Road",
  "Ayodhya Bypass",
  "Bhadbhada Road",
  "Kalkheda",
  "Islam Nagar",
  "Badwai",
  "Mandideep",
  "Airport Road"
];

// 3. Filter by Amenities — options displayed in the "FILTER BY AMENITIES" section
window.amenityFilters = [
  "Pool",
  "DJ Allowed",
  "Bonfire/BBQ",
  "AC Rooms",
  "Overnight Stay",
  "Catering",
  "Crockery & Utensils",
  "Tables & Chairs",
  "Tents",
  "Parking",
  "Decoration Service"
];

// 4. Amenity Icons — emoji mapping for badges and filters
window.amenityIcons = {
  "Pool":                "🏊",
  "DJ Allowed":          "🎵",
  "Bonfire/BBQ":         "🔥",
  "AC Rooms":            "❄️",
  "Overnight Stay":      "🌙",
  "Catering":            "🍽️",
  "Crockery & Utensils": "🍴",
  "Tables & Chairs":     "🪑",
  "Tents":               "⛺",
  "Parking":             "🅿️",
  "Decoration Service":  "🎊"
};

// 5. Event Suitability Options & Icons
window.bestForOptions = [
  "Wedding",
  "Birthday",
  "Picnic",
  "Family Gathering",
  "Corporate",
  "Other"
];

window.bestForIcons = {
  "Wedding":          "💒",
  "Birthday":         "🎂",
  "Picnic":           "🧺",
  "Family Gathering": "👨‍👩‍👧‍👦",
  "Corporate":        "💼",
  "Other":            "🎉"
};
