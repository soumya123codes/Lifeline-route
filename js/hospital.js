const rows = document.getElementById("hospitalRows");
const incomingBox = document.getElementById("incomingBox");

// The map is built once Firebase is ready
let view = null;

// ---------- Incoming ambulance ----------

// Draw the incoming ambulance card (or the empty message)
function showIncoming(trip) {
  if (!trip) {
    incomingBox.innerHTML = '<p class="empty">No ambulance on the way.</p>';
    return;
  }

  const need = conditionNeeds[trip.condition];
  const arrived = trip.status === "reached";
  const minutesLeft = Math.max(0, Math.round(trip.etaMinutes * (1 - (trip.progress || 0))));

  let html =
    '<div class="alert-card">' +
      "<h3>" + trip.severity + " " + trip.condition + "</h3>" +
      "<p>Heading to <strong>" + trip.hospitalName + "</strong>.</p>" +
      "<p>" + (arrived ? "<strong>The ambulance has arrived.</strong>" : "ETA about <strong>" + minutesLeft + " min</strong>") + "</p>" +
      '<p class="muted">Prepare: ' + need.bed + " bed, " + need.speciality + " team.</p>";

  if (trip.status === "police_ack") {
    html += '<p class="muted">Traffic police are clearing the route.</p>';
  }

  html += "</div>";

  if (trip.preRegistered) {
    html += '<p><span class="badge">Patient pre-registered</span></p>';
  } else {
    html += '<button class="action" id="preRegisterButton">Pre-register patient</button>';
  }

  incomingBox.innerHTML = html;
}

// Update the card and the map together
function refresh(trip) {
  showIncoming(trip);
  showTripOnMap(view, trip);
}

incomingBox.addEventListener("click", function (event) {
  if (event.target.id === "preRegisterButton") {
    refresh(updateTrip({ preRegistered: true }));
  }
});

// ---------- Bed table ----------

// Build the HTML for one bed cell: [-] number [+]
function bedCell(hospital, bedType) {
  const count = hospital.beds[bedType];
  const zeroClass = count === 0 ? " zero" : "";

  return (
    "<td>" +
      '<button class="step" data-id="' + hospital.id + '" data-bed="' + bedType + '" data-change="-1" aria-label="Remove one bed">-</button>' +
      '<span class="count' + zeroClass + '">' + count + "</span>" +
      '<button class="step" data-id="' + hospital.id + '" data-bed="' + bedType + '" data-change="1" aria-label="Add one bed">+</button>' +
    "</td>"
  );
}

// Draw the whole table from the hospitals list
function showHospitals() {
  let html = "";

  hospitals.forEach(function (hospital) {
    html +=
      "<tr>" +
        "<td><strong>" + hospital.name + "</strong></td>" +
        "<td>" + hospital.specialities.join(", ") + "</td>" +
        bedCell(hospital, "icu") +
        bedCell(hospital, "emergency") +
        bedCell(hospital, "general") +
      "</tr>";
  });

  rows.innerHTML = html;
}

// Handle clicks on any + or - button in the table
rows.addEventListener("click", function (event) {
  const button = event.target;
  if (!button.classList.contains("step")) return;

  const hospital = hospitals.find(function (h) {
    return h.id === button.dataset.id;
  });

  const bedType = button.dataset.bed;
  const change = Number(button.dataset.change);

  // Never let a bed count go below zero
  hospital.beds[bedType] = Math.max(0, hospital.beds[bedType] + change);

  saveHospitals();
  showHospitals();
});

// Put every bed count back to its starting value
document.getElementById("resetBeds").addEventListener("click", function () {
  resetHospitals();
  showHospitals();
});

// ---------- Start once Firebase has sent the first data ----------
whenReady(function () {
  view = createLifelineMap("map");
  showHospitals();
  refresh(loadTrip());

  // Update live when any device changes the trip or the beds
  onTripChange(refresh);
  onHospitalsChange(showHospitals);
});