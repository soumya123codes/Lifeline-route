// These remember what the user picked
let selectedCondition = null;
let selectedSeverity = null;

// Grab the elements we need from the page
const conditionBox = document.getElementById("conditionChoices");
const severityBox = document.getElementById("severityChoices");
const sosButton = document.getElementById("sosButton");
const result = document.getElementById("result");

// Highlight the clicked button inside a group, and return its value
function pick(box, clickedButton) {
  const buttons = box.querySelectorAll(".choice");
  buttons.forEach(function (button) {
    button.classList.remove("selected");
  });
  clickedButton.classList.add("selected");
  return clickedButton.dataset.value;
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
  if (!selectedCondition || !selectedSeverity) {
    result.textContent = "Pick a condition and a severity first.";
    result.className = "result error";
    return;
  }

  result.textContent =
    "SOS sent. Condition: " + selectedCondition +
    ". Severity: " + selectedSeverity + ".";
  result.className = "result ok";
});