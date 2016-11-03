var engine = new Engine("canvas");
var gridWidth = 800;
var gridHeight = 400;
var pointWidth = engine.W / gridWidth;
var pointHeight = engine.H / gridHeight;

var fps = 100; // 50fps

var initialized = false;
var zoomSpeed = 2;
var zoomAmt = 1;
var topLeft = {x: 0, y: 0};

// For optimizing pixel draws
var imageData;

// to move/zoom around the mandelbrot, use these three vars
// note: a mandelbrot point can only exist on the intervals -2 < x,y < 2
var centerX = 0;
var centerY = 0;
var zoom = 1;

var scale;
var xOffset;
var yOffset;
var globalIterations;

function resetVars() {
  scale = zoom*gridWidth/4;
  xOffset = gridWidth/2 - (gridWidth * zoom * centerX / 2 * (gridHeight/gridWidth));
  yOffset = gridHeight/2 - (gridHeight * zoom * centerY / 4 * (gridWidth/gridHeight));
}

var cancelled = false;

var pts = [];

var Point = function(index, x,y) {
  this.index = index;
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
  if (point.escaped)
    return true;
  else
    return false;
}

function drawPoint(ctx,point) {
  var color = 0; //255 - Math.floor(255.0 * point.iterations / globalIterations);
  if (point.escaped)
    color = Math.floor(765.0 * point.iterations / globalIterations);
  var x = Math.floor(xToGlobal(point.cx)*pointWidth);
  var y = Math.floor(yToGlobal(point.cy)*pointHeight);
  var index = point.index * 4;
  imageData.data[index + 0] = Math.min(255, color)
  imageData.data[index + 1] = Math.min(Math.max(color-255,0),255)
  imageData.data[index + 2] = Math.max(color-510,0);
  imageData.data[index + 3] = 255;
}

function initPoints() {
  pts = [];
  var index = 0;
  for (var i = 0; i < gridHeight; i++) {
    pts[i] = [];
    for (var j = 0; j < gridWidth; j++) {
      pts[i].push(new Point(index++, (j-xOffset)/scale,(i-yOffset)/scale));
    }
  }
  globalIterations = 0;
  zoomAmt = 1;
  topLeft.x = topLeft.y = 0;
  initialized = true;
}

function makePass() {
  if (!initialized) initPoints();
  $('#start').attr('disabled',true);
  var escapedCount = 0;
  var prePasses = 0;
  while (escapedCount <= 0 && prePasses < 100) {
    globalIterations++;
    for (var i = 0; i < gridHeight; i++) {
      for (var j = 0; j < gridWidth; j++) {
        if (pts[i][j].escaped) {
          escapedCount++;
          continue;
        }
        iteratePoint(pts[i][j]);
      }
    }
    prePasses++;
  }
  $('#iterations').text(globalIterations);
  i = pts.length;
  for (var i = 0; i < gridHeight; i++) {
    for (var j = 0; j < gridWidth; j++) {
      drawPoint(engine.ctx,pts[i][j]);
    }
  }
  engine.ctx.putImageData(imageData, 0, 0);
  $('#start').removeAttr('disabled');
  if (!cancelled) setTimeout(makePass,1000/fps);
}

function drawZoom(newX, newY, zoomAmt) {
  var offs = {x: Math.floor(gridWidth/(2*zoomAmt)), y: Math.floor(gridHeight/(2*zoomAmt))}
  var point, color, x = 0, y = 0, ctx = engine.ctx;
  console.log(newX,newY);
  console.log(offs.x,offs.y);
  for (var i = newY-offs.y; i < newY+offs.y; i++) {
    x = 0;
    for (var j = newX-offs.x; j < newX+offs.x; j++) {
      if (i < 0 || i > gridHeight-1 || j < 0 || j > gridWidth-1) {
        ctx.fillStyle = rgb(0,0,0);
      } else {
        point = pts[i][j];
        color = 0; //255 - Math.floor(255.0 * point.iterations / globalIterations);
        if (point.escaped) color = Math.floor(765.0 * point.iterations / globalIterations);
        ctx.fillStyle = rgb(Math.min(255, color),Math.min(Math.max(color-255,0),255),Math.max(color-510,0));
      }
      ctx.fillRect(x*zoomAmt,y*zoomAmt,pointWidth*zoomAmt,pointHeight*zoomAmt);
      x++;
    }
    y++;
  }
}

$(document).ready(function() {
  resetVars();
  $('#start').click(function() {
    cancelled = false;
    makePass();
    $('#start').hide();
    $('#cancel').show();
  });
  $('#cancel').click(function() {
    cancelled = true;
    $('#start').show();
    $('#cancel').hide();
  }).hide();

  // For optimizing pixel draws
  imageData = engine.ctx.getImageData(0, 0, engine.W, engine.H);

  $(engine.canvas).mousemove(function(e) {
    var pos = $(this).offset();
    var x = e.pageX - pos.left;
    var y = e.pageY - pos.top;
    $('#coord_x').text((x/pointWidth - xOffset) / scale);
    $('#coord_y').text((y/pointHeight - yOffset) / scale);
  }).click(function(e) {
    var multiple = engine.W / $(this).innerWidth();
    var pos = $(this).offset();
    var screenX = multiple * (e.pageX - pos.left);
    var screenY = multiple * (e.pageY - pos.top);
    var x = Math.floor(topLeft.x + screenX/zoomAmt);
    var y = Math.floor(topLeft.y + screenY/zoomAmt);
    zoomAmt *= zoomSpeed;
    topLeft.x = x - (gridWidth/(2*zoomAmt));
    topLeft.y = y - (gridHeight/(2*zoomAmt));
    drawZoom(x,y,zoomAmt);
    centerX = (screenX/pointWidth - xOffset) / scale;
    centerY = (screenY/pointHeight - yOffset) / scale;
    zoom *= zoomSpeed;
    resetVars();
    initialized = false;
  });
});
