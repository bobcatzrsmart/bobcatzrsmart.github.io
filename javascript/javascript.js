var pointA = [29.889395,-97.939, "Old Main"];
var pointB = [29.882758,-97.9408, "Hays County Courthouse"];
var pointC = [29.888199, -97.934505, "Sewell Park"];
var pointD = [29.8883247, -97.944314, "Gumbys"];


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
  circleC = L.circle([pointC[0], pointC[1]]).addTo(map);
  circleD = L.circle([pointD[0], pointD[1]]).addTo(map);

}

function calculateDistance(from, to) {
  var fromPt = turf.point([from[1], from[0]]);
  var toPt = turf.point([to[1], to[0]]);
  var options = {units: 'miles'};

  var distance = turf.distance (fromPt, toPt, options);
  document.getElementById("distance-calc-data").innerHTML = "The distance from " + from[2] + " to " + to[2] + " is " +
  (Math.round(distance * 100) / 100) + " miles.";
}

function calculateMidPoint(point1, point2) {
  var point1 = turf.point([29.888199, -97.934505]);
  var point2 = turf.point([29.8883247, -97.944314]);

  var midpoint = turf.midpoint(point1, point2);
  document.getElementById("midpoint-calc-data")

  var addTo(map) = [point1, point2, midpoint];
  midpoint.properties['marker-color'] = "#f00";

}
