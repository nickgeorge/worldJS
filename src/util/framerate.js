goog.provide('Framerate');


/** @constructor */
Framerate = function() {
  this.lastTime = 0;
  this.numFramerates = 30;
  this.averageUpdateInterval = 500;

  this.renderTime = -1;
  this.framerates = [];
  this.rollingAverage = 0;
};

Framerate.prototype.calcRollingAverage = function() {
  var tot = 0;
  for (var i = 0; this.framerates[i]; i++){
    tot += this.framerates[i];
  }
  this.rollingAverage = Math.round(tot / this.framerates.length);
};

Framerate.prototype.snapshot = function() {
  if (this.renderTime < 0)
    this.renderTime = new Date().getTime();
  else {
    var newTime = new Date().getTime();
    var t = newTime - this.renderTime;
    if (t == 0) return;
    var framerate = 1000/t;
    this.framerates.push(framerate);
    while (this.framerates.length > this.numFramerates) {
      this.framerates.shift();
    }
    this.renderTime = newTime;
    this.calcRollingAverage();
  }
};
