const alertBox = document.getElementById("alertBox");

// The map is built once Firebase is ready
let view = null;

// Draw the alert (or the empty message) from a trip object
function showAlert(trip) {
  if (!trip) {
    alertBox.innerHTML = '<p class="empty">No traffic alerts right now.</p>';
    return;
  }

  const time = new Date(trip.createdAt).toLocaleTimeString();

  let html =
    '<div class="alert-card">' +
      "<h3>Clear the corridor</h3>" +
      "<p>Ambulance on the way with a <strong>" + trip.severity + "</strong> " +
      "<strong>" + trip.condition + "</strong> patient.</p>" +
      (trip.hospitalName ? "<p>Heading to <strong>" + trip.hospitalName + "</strong>, ETA about " + trip.etaMinutes + " min.</p>" : "") +
      '<p class="muted">SOS raised at ' + time + "</p>" +
    "</div>";

  if (trip.status === "sent") {
    html += '<button class="action" id="ackButton">Acknowledge and clear route</button>';
  } else if (trip.status === "police_ack") {
    html +=
      '<p><span class="badge">Route being cleared</span></p>' +
      '<button class="action secondary" id="clearButton">Clear alert</button>';
  } else {
    html +=
      '<p><span class="badge">Ambulance arrived</span></p>' +
      '<button class="action secondary" id="clearButton">Clear alert</button>';
  }

  alertBox.innerHTML = html;
}

// Update the alert and the map together
function refresh(trip) {
  showAlert(trip);
  showTripOnMap(view, trip);
}

// Handle clicks on the buttons inside the alert box
alertBox.addEventListener("click", function (event) {
  if (event.target.id === "ackButton") {
    refresh(updateTripStatus("police_ack"));
  }

  if (event.target.id === "clearButton") {
    clearTrip();
    refresh(null);
  }
});

// Start once Firebase has sent the first data
whenReady(function () {
  view = createLifelineMap("map");
  refresh(loadTrip());

  // Update live when any device changes the trip
  onTripChange(refresh);
});