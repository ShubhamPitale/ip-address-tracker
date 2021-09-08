import { API_KEY } from "./config.js";
import { getJSON } from "./helpers.js";
// Elements
const input = document.getElementById("input-ip");
const form = document.querySelector(".input");
const closeBtn = document.querySelector(".modal__btn--close");
const overlay = document.querySelector(".overlay");
const modal = document.querySelector(".modal");
const errmsg = document.querySelector(".error-message");
//Marker initially undefined
let marker;
//Icon
var myIcon = L.icon({
  iconUrl: "./images/icon-location.svg",
});
//Functions
//To check IP
function isIP(ipaddress) {
  if (
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ipaddress
    )
  ) {
    return true;
  }

  return false;
}
//Returns mymap instance
const map = (() => {
  let mymap = L.map("mapid").setView([0, 0], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mymap);
  return {
    mymap,
  };
})();
//Marker
const makeMarker = function (lat, lng) {
  if (marker != undefined) {
    map.mymap.removeLayer(marker);
  }
  marker = L.marker([lat, lng], { icon: myIcon }).addTo(map.mymap);
  map.mymap.flyTo([lat, lng], 13);
};

const loadData = async function () {
  try {
    //Input value
    const inputValue = input.value;
    if (!inputValue) return;
    //fetch data from ipify
    const data = isIP(inputValue)
      ? await getJSON(
          `https://geo.ipify.org/api/v1?apiKey=${API_KEY}&ipAddress=${inputValue}`
        )
      : await getJSON(
          `https://geo.ipify.org/api/v1?apiKey=${API_KEY}&domain=${inputValue}`
        );
    //Update the UI
    updateInfo(data);
    //Place the marker
    const { lat, lng } = data.location;
    makeMarker(lat, lng);
    //Reset value
    input.value = "";
  } catch (error) {
    console.log(error.message);
    renderError(`Invalid IP address or Domain !`);
  }
};
//Update the Information
const updateInfo = function (data) {
  document.querySelector(".iptext").textContent = data.ip;
  document.querySelector(".loctext").textContent = data.location.city;
  document.querySelector(
    ".timetext"
  ).textContent = `GMT ${data.location.timezone}`;
  document.querySelector(".isptext").textContent = data.isp;
};
//Close modal
const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};
// Rendering error message
const renderError = function (msg) {
  errmsg.textContent = msg;
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};
//Get clients Ip address
const init = async function () {
  try {
    const data = await getJSON(
      `https://geo.ipify.org/api/v1?apiKey=${API_KEY}`
    );
    updateInfo(data);
    const { lat, lng } = data.location;
    makeMarker(lat, lng);
  } catch (error) {
    console.log(error);
    renderError(`Please check Internet connectivity`);
  }
};
init();
//Event listeners
form.addEventListener("submit", function (event) {
  event.preventDefault();
  loadData();
});

//Error Modal
closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});
