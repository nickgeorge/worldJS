goog.provide('FpsCamera');

goog.require('FpsAnchor');


/**
 * @constructor
 * @implements {Camera}
 * @struct
 */
FpsCamera = function(message) {
  /** @type {FpsAnchor} */
  this.anchor = null;

  this.objectCache = {
    viewOrientation: quat.create(),
    conjugateViewOrientation: quat.create(),
    anchorPosition: vec3.create(),
    negatedAnchorPosition: vec3.create(),
  };
};


FpsCamera.prototype.transform = function() {
  var cache = this.objectCache;

  var viewOrientation = this.anchor.getViewOrientation(cache.viewOrientation)
  var conjugateViewOrientation = quat.conjugate(
      cache.conjugateViewOrientation,
      viewOrientation);
  Env.gl.rotateView(conjugateViewOrientation);

  var position = this.getPosition();
  Env.gl.translateView(vec3.negate(cache.negatedAnchorPosition, position));
  Env.gl.uniform3fv(Env.gl.getActiveProgram().eyeLocationUniform, position);
};


FpsCamera.prototype.getPosition = function() {
  return this.anchor.getEyePosition(this.objectCache.anchorPosition);
};

FpsCamera.prototype.setAnchor = function(anchor) {
  this.anchor = anchor;
};
