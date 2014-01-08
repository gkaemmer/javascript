engine = new Engine("canvas");

// modes:
var EMPTY = 0;
var WALL = 1;
var START = 2;
var FINISH = 3;

var grid = [];

var nodeWidth = 10;
var nodeHeight = 10;

var width = 100;
var height = 100;

var heuristicWeight = 1;

var colors = ['#3333ff','#1111dd','#ff3333','#33ff33'];

var down = false;
var erasing = false;

var adjCost = 10;
var diagCost = adjCost * 1.41;

var canvasX,canvasY;

var lastId = 0;

function initGrid(width,height) {
  for (var i = 0; i < height; i++) {
    grid[i] = []
    for (var j = 0; j < width; j++) {
      grid[i][j] = new Node(i,j,EMPTY)
      grid[i][j].edge = (i==0 || j==0 || j == width-1 || i == height-1);
      if (grid[i][j].edge) grid[i][j].mode = WALL;
    }
  }
  startNode = grid[1][1];
  grid[1][1].mode = START;
  finishNode = grid[height-2][width-2];
  grid[height-2][width-2].mode = FINISH
}

function resetScores() {
  pathfinder = new Pathfinder();
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      grid[i][j].open = false;
      grid[i][j].closed = false;
      grid[i][j].path = false;
      grid[i][j].F = 0;
      grid[i][j].G = 0;
      grid[i][j].H = 0;
    }
  }
}

function Node(i,j,mode) {
  this.mode = mode;
  this.edge = false;
  this.id = lastId++;
  this.i = i;
  this.j = j;
  this.path = false;
  
  this.closed = false;
  this.open = false;
  this.F = 0;
  this.G = 0;
  this.H = 0;

  this.parent = null;

  this.draw = function(ctx) {
    ctx.fillStyle = colors[this.mode];
    if (this.F != 0) ctx.fillStyle = '#dddddd';
    if (this.path) ctx.fillStyle = '#ff0000';
    ctx.fillRect(j*nodeWidth,i*nodeWidth,nodeWidth,nodeHeight);
  }
  this.mv = function(i,j) {
    return grid[this.i+i][this.j+j];
  }
}

function drawGrid() {
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      grid[i][j].draw(engine.ctx);
    }
  }
}

function heuristic(node) {
  var di = finishNode.i-node.i;
  var dj = finishNode.j-node.j;
  return heuristicWeight*adjCost*Math.sqrt(di*di+dj*dj);
}

function Pathfinder() {
  function chooseLowestCostFromOpenList() {
    lowest = {F:9007199254740992};
    each(openList,function(node,i) {
      if (!node.closed && node.F < lowest.F) lowest = node;
    });
    return lowest;
  }

  var currentNode = startNode;
  var path = [];
  var openList = [];
  var closedList = [];
  var r;
  this.next = function() {
    if (currentNode.id != finishNode.id) {
      currentNode.closed = true;
      currentNode.open = false;
      each([[-1,-1,true],[0,-1,false],[1,-1,true],[1,0,false],[1,1,true],[0,1,false],[-1,1,true],[-1,0,false]],
         function(pos,i) {
          var checkNode = currentNode.mv(pos[0],pos[1]);
          if (pos[2] && (currentNode.mv(pos[0],0).mode == WALL || currentNode.mv(0,pos[1]).mode == WALL)) return;
          if (checkNode.mode != WALL && !checkNode.closed) {
            moveCost = pos[2] ? diagCost : adjCost;
            if (!checkNode.open) {
              openList.push(checkNode);
              checkNode.parent = currentNode;
              checkNode.open = true;
              checkNode.F = (checkNode.G = moveCost + currentNode.G) + (checkNode.H = heuristic(checkNode));
            } else {
              if (checkNode.G > moveCost + currentNode.G) {
                checkNode.parent = currentNode;
                checkNode.F = (checkNode.G = moveCost + currentNode.G) + checkNode.H;
              }
            }
          }
          checkNode.draw(engine.ctx);
         });
      currentNode = chooseLowestCostFromOpenList();
      r = false;
    } else {

      while (currentNode.id != startNode.id) {
        path.push(currentNode);
        currentNode.path = true;
        currentNode = currentNode.parent;
      }

      path = path.reverse();
      r = true;
      drawGrid();
    }
    return r;
  }
  drawGrid();
}

function pathFind() {
  if (!pathfinder.next()) setTimeout(pathFind,2);
}

$(document).ready(function() {
  initGrid(width,height);
  drawGrid();
  var offset = $(engine.canvas).offset()
  canvasX = offset.left;
  canvasY = offset.top;
  pathfinder = new Pathfinder();
  $(engine.canvas).mousedown(function() {
    var i = Math.floor((event.pageY - canvasY) / nodeHeight);
    var j = Math.floor((event.pageX - canvasX) / nodeWidth);
    var currentNode = grid[i][j];
    if (currentNode.mode == EMPTY) {
      down = true;
      erasing = false;
    } else {
      down = true;
      erasing = true;
    }
    resetScores();
    drawGrid();
  }).mousemove(function(event) {
    if (down) {
      var i = Math.floor((event.pageY - canvasY) / nodeHeight);
      var j = Math.floor((event.pageX - canvasX) / nodeWidth);
      var currentNode = grid[i][j];
      if (currentNode.edge || currentNode.mode == START || currentNode.mode == FINISH) return false;
      if (erasing) currentNode.mode = EMPTY;
      else currentNode.mode = WALL;
      currentNode.draw(engine.ctx);
      return false;
    }
  }).css({'cursor': 'arrow'});
  $(this).mouseup(function() {
    down = false;
  });
  $('#h-weight').val(heuristicWeight).change(function() { heuristicWeight = parseFloat($(this).val()) });
})
