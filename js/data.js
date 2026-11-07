// Shared data used by more than one page.
// All hospitals and locations are made up for the demo.
// x and y are positions in kilometres on a simple grid (a stand-in for a real map).

const ambulanceStart = { x: 2, y: 7 };

const defaultHospitals = [
  {
    id: "h1",
    name: "City General",
    x: 12, y: 8,
    specialities: ["cardiology", "trauma", "emergency"],
    beds: { icu: 2, emergency: 4, general: 10 }
  },
  {
    id: "h2",
    name: "Metro Heart Centre",
    x: 6, y: 4,
    specialities: ["cardiology"],
    beds: { icu: 0, emergency: 2, general: 5 }
  },
  {
    id: "h3",
    name: "Lakeside Hospital",
    x: 18, y: 10,
    specialities: ["trauma", "neurology", "emergency"],
    beds: { icu: 1, emergency: 3, general: 8 }
  },
  {
    id: "h4",
    name: "St. Mary's",
    x: 9, y: 15,
    specialities: ["maternity", "emergency"],
    beds: { icu: 1, emergency: 2, general: 6 }
  }
];

// Which speciality and bed type each condition needs
const conditionNeeds = {
  Cardiac:   { speciality: "cardiology", bed: "icu" },
  Trauma:    { speciality: "trauma",     bed: "emergency" },
  Stroke:    { speciality: "neurology",  bed: "icu" },
  Breathing: { speciality: "emergency",  bed: "icu" },
  Pregnancy: { speciality: "maternity",  bed: "emergency" },
  Other:     { speciality: "emergency",  bed: "emergency" }
};

// ---- Saving beds in the browser so every page sees the same numbers ----
const HOSPITALS_KEY = "lifelineHospitals";

function loadHospitals() {
  const raw = localStorage.getItem(HOSPITALS_KEY);
  if (raw) return JSON.parse(raw);
  return JSON.parse(JSON.stringify(defaultHospitals)); // a fresh copy
}

function saveHospitals() {
  localStorage.setItem(HOSPITALS_KEY, JSON.stringify(hospitals));
}

function resetHospitals() {
  localStorage.removeItem(HOSPITALS_KEY);
  hospitals = loadHospitals();
}

let hospitals = loadHospitals();