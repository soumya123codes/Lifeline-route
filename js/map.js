// Shared map code (uses the Leaflet library).

const HOSPITAL_COLOR = "#0b7a75";
const AMBULANCE_COLOR = "#d6342c";

const hospitalStyle = { radius: 9, color: "#ffffff", weight: 2, fillColor: HOSPITAL_COLOR, fillOpacity: 0.95 };
const chosenStyle   = { radius: 13, color: "#16211f", weight: 3, fillColor: HOSPITAL_COLOR, fillOpacity: 1 };

// Turn our km grid position into a latitude and longitude
function kmToLatLng(point) {
  const lat = MAP_CENTER.lat + point.y / 111;
  const lng = MAP_CENTER.lng + point.x / (111 * Math.cos(MAP_CENTER.lat * Math.PI / 180));
  return [lat, lng];
}

// A point part of the way from one place to another (progress goes 0 to 1)
function pointAlong(from, to, progress) {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress
  };
}

// Build the map with a marker for every hospital and one for the ambulance
function createLifelineMap(elementId) {
  const map = L.map(elementId);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const hospitalMarkers = {};
  const bounds = [kmToLatLng(ambulanceStart)];

  loadHospitals().forEach(function (hospital) {
    const position = kmToLatLng(hospital);
    bounds.push(position);

    hospitalMarkers[hospital.id] = L.circleMarker(position, hospitalStyle)
      .addTo(map)
      .bindTooltip(hospital.name, { permanent: true, direction: "top", offset: [0, -8] });
  });

  const ambulanceMarker = L.circleMarker(kmToLatLng(ambulanceStart), {
    radius: 9, color: "#ffffff", weight: 2, fillColor: AMBULANCE_COLOR, fillOpacity: 1
  })
    .addTo(map)
    .bindTooltip("Ambulance", { permanent: true, direction: "bottom", offset: [0, 8] });

  map.fitBounds(bounds, { padding: [50, 50] });

  return { map: map, hospitalMarkers: hospitalMarkers, ambulanceMarker: ambulanceMarker, routeLine: null };
}

// Draw the current trip on the map (or reset the map if there is none)
function showTripOnMap(view, trip) {
  // Start clean: normal hospital markers, no route line
  Object.keys(view.hospitalMarkers).forEach(function (id) {
    view.hospitalMarkers[id].setStyle(hospitalStyle);
  });

  if (view.routeLine) {
    view.map.removeLayer(view.routeLine);
    view.routeLine = null;
  }

  if (!trip) {
    view.ambulanceMarker.setLatLng(kmToLatLng(ambulanceStart));
    return;
  }

  const hospital = loadHospitals().find(function (h) {
    return h.id === trip.hospitalId;
  });
  if (!hospital) return;

  // Dashed line from the ambulance start to the chosen hospital
  view.routeLine = L.polyline(
    [kmToLatLng(ambulanceStart), kmToLatLng(hospital)],
    { color: AMBULANCE_COLOR, weight: 4, dashArray: "8 8" }
  ).addTo(view.map);

  // Make the chosen hospital bigger
  view.hospitalMarkers[hospital.id].setStyle(chosenStyle);

  // Move the ambulance to its current spot along the line
  const spot = pointAlong(ambulanceStart, hospital, trip.progress || 0);
  view.ambulanceMarker.setLatLng(kmToLatLng(spot));
}