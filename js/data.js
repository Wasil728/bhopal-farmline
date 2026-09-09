/**
 * data.js — Bhopal Farmline Website
 * --------------------------------------------------
 * Central data store: Supabase config, areas, amenities, icons.
 * --------------------------------------------------
 */

// Farmhouses — populated live from Supabase
window.farmhouses = [];

// Bhopal Areas — must match add-farmhouse.html dropdown options exactly
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
  "Airport Road",
];

// Amenity Filters
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
  "Decoration Service",
];

// Amenity Icons (emoji map)
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
  "Decoration Service":  "🎊",
};

// Best-For Options (event types)
window.bestForOptions = [
  "Wedding",
  "Birthday",
  "Picnic",
  "Family Gathering",
  "Corporate",
  "Other",
];

// Best-For Icons (emoji map)
window.bestForIcons = {
  "Wedding":          "💒",
  "Birthday":         "🎂",
  "Picnic":           "🧺",
  "Family Gathering": "👨‍👩‍👧‍👦",
  "Corporate":        "💼",
  "Other":            "🎉",
};
