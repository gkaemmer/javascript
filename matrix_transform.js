var canvas = document.getElementById("canvas");

var WIDTH = canvas.width = 1000;
var HEIGHT = canvas.height = 500;

var ctx = canvas.getContext("2d");

var points = [];
var origin = {x: WIDTH/2, y: HEIGHT};
var scale = 3;

var n = 10;
for (var x = 0; x < n; x++) {
  for (var y = 0; y < n; y++) {
    points.push({x: x, y: y});
  }
}

function drawPoint(point) {
  ctx.fillRect(origin.x + scale*point.x, origin.y - scale*point.y, 3, 3);
}

function applyMatrix(matrix, point) {
  var newPoint = {
    x: matrix[0][0] * point.x + matrix[0][1] * point.y,
    y: matrix[1][0] * point.x + matrix[1][1] * point.y
  }
  return newPoint;
}

matrix = [[3, 1], [1, 3]];

window.onload = function() {
  ctx.strokeStyle = "rgb(0,0,0)"
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(WIDTH, origin.y);
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, HEIGHT);
  ctx.stroke();
  for (var i = 0; i < points.length; i++) {
    var point = applyMatrix(matrix, points[i]);
    drawPoint(point);
  }
}
