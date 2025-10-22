/* eslint-disable */
import "core-js/stable";
import "regenerator-runtime/runtime";
import { login } from "./login.js";
import { displayMap } from "./mapbox.js";
import { logout } from "./login.js";
import { updateSettings } from "./updateSettings.js";
import { bookTour } from "./stripe.js";

const form = document.querySelector(".form");
const map = document.getElementById("map");
const logoutBtn = document.querySelector(".nav__el--logout");
const updateSettingsForm = document.querySelector(".form-user-data");
const updatePasswordForm = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-tour");

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}

if (form) {
  form.addEventListener("submit", (e) => {
    // stops the default action of an event from occurring
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

if (updateSettingsForm) {
  updateSettingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("updatedemail").value);
    form.append("photo", document.getElementById("photo").files[0]);

    updateSettings(form, "profile");
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save--password").textContent = "updating...";
    const currentPassword = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("password-confirm").value;
    await updateSettings(
      { currentPassword, password, confirmPassword },
      "password"
    );

    document.querySelector(".btn--save--password").textContent =
      "save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}

if (bookBtn) {
  bookBtn.addEventListener("click", (e) => {
    e.target.textContent = "processing...";
    const { tourId } = bookBtn.dataset; // data-tour-id in HTML form => dataset.tourId
    bookTour(tourId);
  });
}
