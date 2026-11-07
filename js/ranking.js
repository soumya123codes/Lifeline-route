// The decision logic: which hospital should the ambulance go to?

const AVERAGE_SPEED_KMH = 35; // rough city driving speed for the ETA

// Straight-line distance between two points on our grid
function distanceKm(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Step 1: remove hospitals that cannot treat this patient.
// Returns the ones that can, plus the reasons the others were skipped.
function findCandidates(condition, list) {
  const need = conditionNeeds[condition];
  const candidates = [];
  const skipped = [];

  list.forEach(function (hospital) {
    if (!hospital.specialities.includes(need.speciality)) {
      skipped.push(hospital.name + ": no " + need.speciality);
    } else if (hospital.beds[need.bed] < 1) {
      skipped.push(hospital.name + ": no free " + need.bed + " bed");
    } else {
      candidates.push(hospital);
    }
  });

  return { candidates: candidates, skipped: skipped, need: need };
}

// Version 1: simply the closest hospital that passed the filter
function pickClosest(condition, list, from) {
  const found = findCandidates(condition, list);
  if (found.candidates.length === 0) return null;

  let best = found.candidates[0];
  found.candidates.forEach(function (hospital) {
    if (distanceKm(from, hospital) < distanceKm(from, best)) {
      best = hospital;
    }
  });

  return { hospital: best, distanceKm: distanceKm(from, best), skipped: found.skipped };
}

// Turn a value into a number from 0 (smallest) to 1 (largest)
function normalise(value, allValues) {
  const min = Math.min.apply(null, allValues);
  const max = Math.max.apply(null, allValues);
  if (max === min) return 0;
  return (value - min) / (max - min);
}

// Version 2: score every candidate and pick the lowest score.
// score = wEta * eta + wDist * distance + wBeds * (1 - beds)   (all scaled 0 to 1)
function pickBest(condition, severity, list, from) {
  const found = findCandidates(condition, list);
  if (found.candidates.length === 0) return null;

  const distances = found.candidates.map(function (h) { return distanceKm(from, h); });
  const etas = distances.map(function (d) { return (d / AVERAGE_SPEED_KMH) * 60; });
  const beds = found.candidates.map(function (h) { return h.beds[found.need.bed]; });

  // Critical patients: time matters most
  const weights = severity === "Critical"
    ? { eta: 0.7, dist: 0.2, beds: 0.1 }
    : { eta: 0.6, dist: 0.3, beds: 0.1 };

  let bestIndex = 0;
  let bestScore = Infinity;

  found.candidates.forEach(function (hospital, i) {
    const score =
      weights.eta * normalise(etas[i], etas) +
      weights.dist * normalise(distances[i], distances) +
      weights.beds * (1 - normalise(beds[i], beds));

    if (score < bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });

  const chosen = found.candidates[bestIndex];
  const eta = Math.max(1, Math.round(etas[bestIndex]));

  return {
    hospital: chosen,
    distanceKm: distances[bestIndex],
    etaMinutes: eta,
    candidateCount: found.candidates.length,
    skipped: found.skipped,
    reason: "Best match among " + found.candidates.length +
      " hospital(s) with " + found.need.speciality +
      " and a free " + found.need.bed + " bed."
  };
}