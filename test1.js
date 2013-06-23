var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function rgba(r,g,b,a) {
	if (a>1) a=1;
	return "rgba("+r+","+g+","+b+","+a+")";
}

function viewport() {
	var e = window, a = 'inner';
	if (!('innerWidth' in window)) {
		a = 'client';
		e = document.documentElement || document.body;
	}
	return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}
var vp = viewport();
var W = vp.width;
var H = vp.height;
canvas.width = W;
canvas.height = H;
var scale = 8;
var speed = 0.1;

function drawPixel(x,y,ctx) {
	ctx.beginPath();
	ctx.fillRect(x,y,1,1);
}

var fieldStr = 0.01;

function field(x,y,z) {
	var resX = Math.random()-0.5;
	var resY = 0;
	var resZ = -z;
	return [resX*fieldStr,resY*fieldStr,resZ*fieldStr];
}

var life = 10;
var maxSpeed = 0;

function particle(x,y,z) {
	this.vx = 0;
	this.vy = 0;
	this.vz = 0;
	this.fv = 0;
	this.x = x;
	this.y = y;
	this.z = z;
	this.lastX = this.sx = this.getSX();
	this.lastY = this.sy = this.getSY();
	this.speed = 1+Math.random();
	this.life = Math.random()*life;
}

particle.prototype.getSX = function() {
	return this.x / (1+this.z*0.2) / scale * W + W/2;
}

particle.prototype.getSY = function() {
	return this.y / (1+this.z*0.2) / scale * H + H/2;
}
particle.prototype.reset = function(x,y,z) {
	this.vx = 0;
	this.vy = 0;
	this.vz = 0;
	this.x = x;
	this.y = y;
	this.z = z;
	this.lastX = this.sx = this.getSX();
	this.lastY = this.sy = this.getSY();
	this.life = Math.random()*life;
}
particle.prototype.draw = function(ctx) {
	ctx.strokeStyle = rgba(0,0,0,this.fv/maxSpeed);
	ctx.beginPath();
	ctx.moveTo(this.lastX,this.lastY);
	ctx.lineTo(this.sx,this.sy);
	ctx.stroke();
}
particle.prototype.update = function() {
	var f = field(this.x,this.y,this.z);
	this.vx = this.speed*f[0];
	this.vy = this.speed*f[1];
	this.vz = this.speed*f[2];
	this.fv = f[0]*f[0]+f[1]*f[1];
	if (this.fv > maxSpeed) {
		maxSpeed = this.fv;
	}
	this.lastX = this.sx;
	this.lastY = this.sy;
	this.x += this.vx;
	this.y += this.vy;
	this.z += this.vz;
	this.sx = this.getSX();
	this.sy = this.getSY();
	this.life--;
}

var N = 2500;

var x,y;
var ang,speed;
var p;

var particles = [];

for (var i=0; i<N; i++) {
	initParticleAtIndex(i);
}

function initParticleAtIndex(i) {
	if (particles[i]) particles[i].reset((Math.random()-0.5)*scale,(Math.random()-0.5)*scale,(Math.random()-0.5)*scale);
	else particles[i] = new particle((Math.random()-0.5)*scale,(Math.random()-0.5)*scale,(Math.random()-0.5)*scale);
	speed = Math.random()*Math.random()*speed;
	ang = Math.random() * Math.PI;
	particles[i].vx = speed*Math.cos(ang);
	particles[i].vy = speed*Math.sin(ang);
}
var t = 0;
var fps = 0;
var fpsRes = 10;

var lastTime = (new Date()).getTime();

function getFPS() {
	var time = (new Date()).getTime() - lastTime;
	lastTime += time;
	fps = 1000*fpsRes/time;
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,200,20);
	ctx.fillStyle = "black";
	ctx.fillText(fps,3,10);
}


function draw() {
	for (var i=0; i<N; i++) {
		if (particles[i].life<0) {
			initParticleAtIndex(i);
		}
		particles[i].update();
		particles[i].draw(ctx);
	}
	maxSpeed *= 0.99;
	ctx.fillStyle = rgba(255,255,255,0.05);
	ctx.fillRect(0,0,W,H);
	t++;
	if (t > fpsRes) {
		t-=fpsRes;
		getFPS();
	}
}

setInterval(draw,1000/30)