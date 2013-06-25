var engine = new Engine("canvas");
var gridWidth = 400;
var gridHeight = 200;
var pointWidth = engine.W / gridWidth;
var pointHeight = engine.H / gridHeight;

// to move/zoom around the mandelbrot, use these three vars
// note: a mandelbrot point can only exist on the intervals -2 < x,y < 2
var centerX = 0;
var centerY = 0;
var zoom = 1;

var scale = zoom*gridWidth/4;
var xOffset = gridWidth/2 - (gridWidth * zoom * centerX / 2 * (gridHeight/gridWidth));
var yOffset = gridHeight/2 - (gridHeight * zoom * centerY / 4 * (gridWidth/gridHeight));
var globalIterations = 0;

var cancelled = false;

var pts = [];

var Point = function(x,y) {
  this.zx = 0;
  this.zy = 0;
  this.cx = x;
  this.cy = y;
  this.escaped = false;
  this.iterations = 0;
}

function xToGlobal(x) {
  return x*scale + xOffset;
}

function yToGlobal(y) {
  return y*scale + yOffset;
}

function iteratePoint(point) {
  var tx = point.zx;
  var ty = point.zy;
  point.zx = tx * tx - ty * ty + point.cx;
  point.zy = 2 * tx * ty       + point.cy;
  point.iterations++;
  if (point.zx * point.zx + point.zy * point.zy > 4) {
    point.escaped = true;
  }
}

function drawPoint(ctx,point) {
  var color = 0; //255 - Math.floor(255.0 * point.iterations / globalIterations);
  if (point.escaped) color = Math.floor(765.0 * point.iterations / globalIterations);
  ctx.fillStyle = rgb(Math.min(255, color),Math.min(Math.max(color-255,0),255),Math.max(color-510,0));
  ctx.fillRect(xToGlobal(point.cx)*pointWidth,yToGlobal(point.cy)*pointHeight,pointWidth,pointHeight);
}

function initPoints() {
  for (var i = 0; i < gridHeight; i++) {
    for (var j = 0; j < gridWidth; j++) {
      pts.push(new Point((j-xOffset)/scale,(i-yOffset)/scale));
    }
  }
}

function makePass() {
  $('#make_pass').attr('disabled',true);
  globalIterations++;
  var i = pts.length;
  while (i--) {
    if (pts[i].escaped) continue;
    iteratePoint(pts[i]);
  }
  i = pts.length;
  while (i--) {
    drawPoint(engine.ctx,pts[i]);
  }
  $('#make_pass').removeAttr('disabled');
  if (!cancelled) setTimeout(makePass,200);
}

$(document).ready(function() {
  initPoints();
  $('#start').click(function() { cancelled = false; makePass(); });
  $('#cancel').click(function() { cancelled = true });
  $(engine.canvas).mousemove(function(e) {
    var pos = $(this).offset();
    var x = e.pageX - pos.left;
    var y = e.pageY - pos.top;
    $('#coord_x').text((x/pointWidth - xOffset) / scale);
    $('#coord_y').text((y/pointHeight - yOffset) / scale);
  })
});
