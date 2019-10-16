var pointA = [29.889395,-97.939, "Old Main"];
var pointB = [29.882758,-97.9408, "Hays County Courthouse"];

function webMap() {
  var map = L.map('map').setView([29.8884, -97.9384], 16);
  mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
  }).addTo(map);

  markerA = L.marker([pointA[0], pointA[1]]).addTo(map);
  markerB = L.marker([pointB[0], pointB[1]]).addTo(map);

}

function calculateDistance(from, to) {
  var fromPt = turf.point([from[1], from[0]]);
  var toPt = turf.point([to[1], to[0]]);
  var options = {units: 'miles'};

  var distance = turf.distance (fromPt, toPt, options);
  document.getElementById("distance-calc-data").innerHTML = "The distance from " + from[2] + " to " + to[2] + " is " +
  (Math.round(distance * 100) / 100) + " miles.";
}
