goog.provide('FullWindowResizer');

/** @constructor @struct */
FullWindowResizer = function(gl, glCanvas, hud, hudCanvas) {
  this.gl = gl;
  this.glCanvas = glCanvas;
  this.hud = hud;
  this.hudCanvas = hudCanvas;
};

FullWindowResizer.prototype.resize = function() {
  this.glCanvas.width = window.innerWidth;
  this.glCanvas.height = window.innerHeight;
  this.gl.viewportWidth = window.innerWidth;
  this.gl.viewportHeight = window.innerHeight;
  this.hudCanvas.width = window.innerWidth;
  this.hudCanvas.height = window.innerHeight;
  this.hud.resize();
  this.hud.render();
};

FullWindowResizer.prototype.attachEventListener = function() {
  window.addEventListener('resize',
      util.bind(this.resize, this));
};
