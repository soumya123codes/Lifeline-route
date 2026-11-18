// Connects the app to Firebase Realtime Database so every device shares the same data.
// STEP: paste YOUR config below (Firebase console > Project settings > Your apps).

const firebaseConfig = {
  apiKey: "AIzaSyBUluthyaiyppey7PLECSg48FAIpwpISro",
  authDomain: "sirensync-9a942.firebaseapp.com",
  databaseURL: "https://sirensync-9a942-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sirensync-9a942",
  storageBucket: "sirensync-9a942.firebasestorage.app",
  messagingSenderId: "677573334243",
  appId: "1:677573334243:web:0d4f90adb5cc05b6d321d6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ---- A local copy of the data, kept up to date by Firebase ----
// The rest of the app reads this copy, so loadTrip() and loadHospitals()
// can stay simple and instant.
let tripCache = null;
let hospitalsCache = null;

let tripReady = false;
let hospitalsReady = false;
let isReady = false;

const tripListeners = [];
const hospitalsListeners = [];
const readyCallbacks = [];

// Firebase drops empty lists, so put them back
function cleanTrip(trip) {
  if (!trip) return null;
  if (!trip.skipped) trip.skipped = [];
  else if (!Array.isArray(trip.skipped)) trip.skipped = Object.values(trip.skipped);
  return trip;
}

function cleanHospitals(value) {
  const list = Array.isArray(value) ? value : Object.values(value);
  list.forEach(function (hospital) {
    if (!hospital.specialities) hospital.specialities = [];
    else if (!Array.isArray(hospital.specialities)) hospital.specialities = Object.values(hospital.specialities);
  });
  return list;
}

// Run a function once, when the first data has arrived from Firebase
function whenReady(callback) {
  if (isReady) callback();
  else readyCallbacks.push(callback);
}

function checkReady() {
  if (!isReady && tripReady && hospitalsReady) {
    isReady = true;
    readyCallbacks.forEach(function (callback) { callback(); });
    readyCallbacks.length = 0;
  }
}

function onHospitalsChange(callback) {
  hospitalsListeners.push(callback);
}

// Listen to the trip: runs every time ANY device changes it
db.ref("trip").on("value", function (snapshot) {
  tripCache = cleanTrip(snapshot.val());
  tripReady = true;
  tripListeners.forEach(function (callback) { callback(tripCache); });
  checkReady();
});

// Listen to the hospitals. The first time, put the starting data in.
db.ref("hospitals").on("value", function (snapshot) {
  const value = snapshot.val();

  if (value === null) {
    db.ref("hospitals").set(JSON.parse(JSON.stringify(defaultHospitals)));
    return;
  }

  hospitalsCache = cleanHospitals(value);
  hospitals = hospitalsCache;
  hospitalsReady = true;
  hospitalsListeners.forEach(function (callback) { callback(); });
  checkReady();
});

// If nothing arrives, the config or the database rules are probably wrong
setTimeout(function () {
  if (!isReady) {
    alert("Could not connect to Firebase. Check the config in js/firebase.js and the database rules.");
  }
}, 10000);