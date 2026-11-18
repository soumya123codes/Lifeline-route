// These remember what the user picked
let selectedCondition = null;
let selectedSeverity = null;

// How far the ambulance moves on each tick (0.01 = 1% of the trip).
// A tick is 200 ms, so 0.01 means the trip takes about 20 seconds.
const SIM_STEP = 0.01;
const SIM_TICK_MS = 200;
let simTimer = null;

// Grab the elements we need from the page
const conditionBox = document.getElementById("conditionChoices");
const severityBox = document.getElementById("severityChoices");
const sosButton = document.getElementById("sosButton");
const result = document.getElementById("result");
const matchBox = document.getElementById("match");

// The map is built once Firebase is ready
let view = null;

// Highlight the clicked button inside a group, and return its value
function pick(box, clickedButton) {
  const buttons = box.querySelectorAll(".choice");
  buttons.forEach(function (button) {
    button.classList.remove("selected");
  });
  clickedButton.classList.add("selected");
  return clickedButton.dataset.value;
}

// Show the trip, the chosen hospital and what has happened so far
function showTripStatus(trip) {
  if (!trip) {
    result.textContent = "";
    result.className = "result";
    matchBox.innerHTML = "";
    return;
  }

  let message =
    "SOS sent. Condition: " + trip.condition +
    ". Severity: " + trip.severity + ".";

  if (trip.status === "reached") {
    message = "Ambulance reached " + trip.hospitalName + ".";
  } else if (trip.status === "police_ack") {
    message += " Police acknowledged: route is being cleared.";
  } else {
    message += " Waiting for police to acknowledge.";
  }

  if (trip.preRegistered && trip.status !== "reached") {
    message += " Hospital has pre-registered the patient.";
  }

  result.textContent = message;
  result.className = "result ok";

  let html =
    '<div class="match-card">' +
      "<h3>Go to " + trip.hospitalName + "</h3>" +
      "<p>" + trip.distanceKm + " km away, ETA about " + trip.etaMinutes + " min.</p>" +
      '<p class="muted">' + trip.reason + "</p>";

  if (trip.skipped.length > 0) {
    html += '<p class="muted">Skipped: ' + trip.skipped.join("; ") + "</p>";
  }

  matchBox.innerHTML = html + "</div>";
}

// Update the text and the map together
function refresh(trip) {
  showTripStatus(trip);
  showTripOnMap(view, trip);
}

// Move the ambulance along the route, one small step at a time
function stopSimulation() {
  if (simTimer) {
    clearInterval(simTimer);
    simTimer = null;
  }
}

function startSimulation() {
  stopSimulation();

  simTimer = setInterval(function () {
    // Read the latest trip, so a police acknowledgement is never overwritten
    const current = loadTrip();
    if (!current || current.status === "reached") {
      stopSimulation();
      return;
    }

    const progress = Math.min(1, (current.progress || 0) + SIM_STEP);
    const changes = { progress: progress };
    if (progress >= 1) changes.status = "reached";

    refresh(updateTrip(changes));

    if (progress >= 1) stopSimulation();
  }, SIM_TICK_MS);
}

// When a condition button is clicked
conditionBox.addEventListener("click", function (event) {
  if (event.target.classList.contains("choice")) {
    selectedCondition = pick(conditionBox, event.target);
  }
});

// When a severity button is clicked
severityBox.addEventListener("click", function (event) {
  if (event.target.classList.contains("choice")) {
    selectedSeverity = pick(severityBox, event.target);
  }
});

// When SOS is clicked
sosButton.addEventListener("click", function () {
  if (!view) {
    result.textContent = "Still connecting, try again in a second.";
    result.className = "result error";
    return;
  }

  if (!selectedCondition || !selectedSeverity) {
    result.textContent = "Pick a condition and a severity first.";
    result.className = "result error";
    return;
  }

  // Read the latest bed numbers, then pick the best hospital
  const match = pickBest(selectedCondition, selectedSeverity, loadHospitals(), ambulanceStart);

  if (!match) {
    result.textContent =
      "No hospital has the right speciality and a free bed. Choose a hospital by phone.";
    result.className = "result error";
    matchBox.innerHTML = "";
    return;
  }

  const trip = {
    condition: selectedCondition,
    severity: selectedSeverity,
    status: "sent",
    createdAt: Date.now(),
    hospitalId: match.hospital.id,
    hospitalName: match.hospital.name,
    distanceKm: Math.round(match.distanceKm * 10) / 10,
    etaMinutes: match.etaMinutes,
    reason: match.reason,
    skipped: match.skipped,
    progress: 0,
    preRegistered: false
  };

  saveTrip(trip);
  refresh(trip);
  startSimulation();
});

// Start once Firebase has sent the first data
whenReady(function () {
  view = createLifelineMap("map");

  // Update when ANY device changes the trip
  onTripChange(refresh);

  // If a trip already exists when the page opens, show it and keep going
  const existingTrip = loadTrip();
  if (existingTrip) {
    refresh(existingTrip);
    if (existingTrip.status !== "reached") startSimulation();
  }
});