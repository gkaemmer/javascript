engine = new Engine("canvas");

var cars = [];

var numCars = 25;
var carLength = 7;
var roadRadius = 200; 
var thinkTime = 0.02;
var timeStep = 0.02; // 0.02 seconds, say
var initialSpeed = 100; // 30 pixels per second
var gas = 50; // pedal means 5 pixels per second per second of acc
var brake = -100;

var baseNervousness = 1; // nervousness is most often centered around 1
var nervousnessDeviation = 1;

var twoPi = 2*Math.PI;

var circ = roadRadius * twoPi;
var initialSpace = circ / numCars;

engine.setFps(1/thinkTime);
engine.setDrawFps(1/timeStep);
engine.maximize();

var midX = engine.W/2;
var midY = engine.H/2;

var maxSpeed = 0;

function brakeDown() {
  cars[0].braking = true;
}

function brakeUp() {
  cars[0].braking = false;
}

function createCars() {
  var car;
  for (var i = 0; i < numCars; i++) {
    car = cars[i] = new Car();
    car.v = initialSpeed;
    car.pos = initialSpace * i;
    car.index = i;
    // car.nervousness = baseNervousness + (Math.random() - 0.5) * nervousnessDeviation;
  }
}

function posToX(pos) {
  return midX + Math.cos(pos / circ * twoPi) * roadRadius;
}

function posToY(pos) {
  return midY + Math.sin(pos / circ * twoPi) * roadRadius;
}

function posDiff(pos1,pos2) {
  // pos2 should ALWAYS be the pos of the car ahead
  // normally would be pos2 - pos1,
  // but we have to account for wrapping
  if (pos2 > pos1) return pos2 - pos1;
  return pos2 + circ - pos1;
}

function targetSpace(car) { // say, half a second behind the next car
  return Math.max(1 * car.v * (car.v/nextCar(car.index).v),3*carLength/2);
}

function nextCar(i) {
  if (i < numCars - 1) return cars[i+1];
  return cars[0];
}

function Car() {
  this.a = 0;
  this.v = 0;
  this.pos = 0;
  this.index = 0;
  this.nervousness = 0;
  this.crashed = false;
  this.braking = false;
  this.update = function() {
    if (!this.crashed) {
      space = posDiff(this.pos, nextCar(this.index).pos);
      ts = targetSpace(this);
      if (space > ts)
        this.a = (space-ts)/space * gas;
      else 
        this.a = ts/space * brake;
  
      if (this.braking) this.a = brake;
      if (space < carLength) this.crashed = true;
      if (this.v > maxSpeed) maxSpeed = this.v;

      if (this.v > 0) this.v += this.a * timeStep;
      else this.v = 0;
      this.pos += this.v * timeStep;
      if (this.pos > circ) this.pos -= circ;
    }
  }

  this.draw = function(ctx) {
    ctx.fillStyle = "#000";
    ctx.fillStyle = "rgb(" + Math.round(255*(maxSpeed-this.v)/maxSpeed) + "," + Math.round(255*this.v/maxSpeed) + ",0)";
    ctx.beginPath();
    ctx.arc(posToX(this.pos),posToY(this.pos),carLength/2,0,twoPi);
    ctx.fill();
  }
}

engine.update = function() {
  maxSpeed -= 0.2;
  for (var i = 0; i < numCars; i++) {
    cars[i].update();
  }
}

engine.draw = function() {
  engine.ctx.fillStyle = "#fff";
  engine.ctx.fillRect(0,0,engine.W,engine.H);
  for (var i = 0; i < numCars; i++) {
    cars[i].draw(engine.ctx);
  }
}


createCars();
engine.draw();
engine.update();
engine.start();