// Shared "current trip", stored in Firebase so every device sees it.
// The pages call the same functions as before.

// Save the whole trip
function saveTrip(trip) {
  tripCache = trip;
  db.ref("trip").set(trip);
}

// Read the trip (from the local copy). Returns null if there is none.
function loadTrip() {
  return tripCache;
}

// Change only some fields of the trip, keeping the rest.
// Returns the updated trip, or null if there is no trip any more.
function updateTrip(changes) {
  if (!tripCache) return null;
  Object.assign(tripCache, changes);
  db.ref("trip").update(changes);
  return tripCache;
}

function updateTripStatus(status) {
  return updateTrip({ status: status });
}

// Remove the trip
function clearTrip() {
  tripCache = null;
  db.ref("trip").remove();
}

// Run a function whenever the trip changes on ANY device (including this one)
function onTripChange(callback) {
  tripListeners.push(callback);
}