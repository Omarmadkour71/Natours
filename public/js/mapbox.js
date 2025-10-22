/* eslint-disable */

export const displayMap = (locations) => {
  var map = L.map("map", { zoomControl: false }).setView([51.505, -0.09], 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const points = [];
  locations.forEach((el) => {
    points.push([el.coordinates[1], el.coordinates[0]]);
    L.marker([el.coordinates[1], el.coordinates[0]])
      .addTo(map)
      .bindPopup(`<h3>${el.description}</h4>`, {
        autoClose: false
      })
      .openPopup();
  });
  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  map.scrollWheelZoom.disable();
};
