const rows = document.getElementById("hospitalRows");

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

showHospitals();