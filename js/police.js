const alertBox = document.getElementById("alertBox");

// Draw the alert (or the empty message) from a trip object
function showAlert(trip) {
  if (!trip) {
    alertBox.innerHTML = '<p class="empty">No traffic alerts right now.</p>';
    return;
  }

  const time = new Date(trip.createdAt).toLocaleTimeString();
  const acknowledged = trip.status === "police_ack";

  let html =
    '<div class="alert-card">' +
      "<h3>Clear the corridor</h3>" +
      "<p>Ambulance on the way with a <strong>" + trip.severity + "</strong> " +
      "<strong>" + trip.condition + "</strong> patient.</p>" +
      (trip.hospitalName ? "<p>Heading to <strong>" + trip.hospitalName + "</strong>, ETA about " + trip.etaMinutes + " min.</p>" : "") +
      '<p class="muted">SOS raised at ' + time + "</p>" +
    "</div>";

  if (acknowledged) {
    html +=
      '<p><span class="badge">Route being cleared</span></p>' +
      '<button class="action secondary" id="clearButton">Clear alert</button>';
  } else {
    html += '<button class="action" id="ackButton">Acknowledge and clear route</button>';
  }

  alertBox.innerHTML = html;
}

// Handle clicks on the buttons inside the alert box
alertBox.addEventListener("click", function (event) {
  if (event.target.id === "ackButton") {
    updateTripStatus("police_ack");
    showAlert(loadTrip());
  }

  if (event.target.id === "clearButton") {
    clearTrip();
    showAlert(null);
  }
});

// Show whatever trip exists when the page opens
showAlert(loadTrip());

// Update live when the ambulance page sends a new SOS
onTripChange(showAlert);