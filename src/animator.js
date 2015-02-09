goog.provide('Animator');

goog.require('Framerate');


/**
 * @private
 * @constructor
 */
Animator = function(world, hud, gl) {
  this.world = world;

  /** @type {HUD} */
  this.hud = hud;

  this.gl = gl;
  this.framerate = new Framerate();
  this.paused = false;

  this.drawOnTick = true;

  this.boundTick = util.bind(this.tick, this);
};
Animator.instance_ = null;

Animator.initSingleton = function(world, hud, gl) {
  util.assertNull(Animator.instance_,
      'Cannot init Animator: already init\'d');

  Animator.instance_ = new Animator(world, hud, gl);
  return Animator.instance_;
};

Animator.getInstance = function() {
  return Animator.instance_;
}

Animator.prototype.setDrawOnTick = function(drawOnTick) {
  this.drawOnTick = drawOnTick;
};

Animator.prototype.start = function() {
  this.drawScene();
  this.tick();
};


Animator.prototype.setPaused = function(paused) {
  this.paused = paused;
  this.world.onPauseChanged(this.paused);
};


Animator.prototype.togglePause = function() {
  this.paused = !this.paused;
  this.world.onPauseChanged(this.paused);
};


Animator.prototype.isPaused = function() {
  return this.paused;
};

Animator.prototype.tick = function() {
  window.requestAnimationFrame(this.boundTick);
  if (this.paused) {
    this.hud.render();
    return;
  }
  this.advanceWorld();
  if (this.drawOnTick) this.drawScene();
  this.hud.render();
};


Animator.prototype.drawScene = function() {
  this.world.draw();
};


Animator.prototype.advanceWorld = function() {
  var timeNow = new Date().getTime();
  if (this.framerate.lastTime != 0) {
    var elapsed = timeNow - this.framerate.lastTime;
    if (elapsed < 100) {
      var dt = elapsed/1000;
      this.world.advance(dt);
      this.framerate.snapshot();
    }
  }
  this.framerate.lastTime = timeNow;
};


Animator.prototype.getRollingAverageFramerate = function() {
  return this.framerate.rollingAverage;
};


Animator.prototype.profile = function(t) {
  this.paused = false;
  console.profile();
  setTimeout(function(){
    console.profileEnd();
    this.paused = true;
  }, t*1000);
};

Animator.profile = function(opt_t) {
  Animator.getInstance().profile(opt_t || 10);
};
