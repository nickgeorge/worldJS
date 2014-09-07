goog.provide('FpsCamera');


/**
 * @constructor
 * @implements {Camera}
 * @struct
 */
FpsCamera = function(message) {
  this.anchor = null;
  this.objectCache = {
    transform: {
      viewOrientation: quat.create(),
      conjugateViewOrientation: quat.create(),
      anchorPosition: vec3.create(),
      bobOffset: vec3.create(),
      negatedAnchorPosition: vec3.create(),
    }
  };
};


FpsCamera.prototype.transform = function() {
  var cache = this.objectCache.transform;

  var viewOrientation = this.anchor.getViewOrientation(cache.viewOrientation)
  var conjugateViewOrientation = quat.conjugate(
      cache.conjugateViewOrientation,
      viewOrientation);
  Env.gl.rotateView(conjugateViewOrientation);
  var position = vec3.copy(cache.anchorPosition,
      this.anchor.position);

  var bobOffset = vec3.set(cache.bobOffset,
      0, Math.sin(-this.anchor.bobAge)/2, 0);
  // Probably shld be up orientation.  Think about more
  vec3.transformQuat(bobOffset,
      bobOffset,
      viewOrientation);

  vec3.add(position, position, bobOffset);
  Env.gl.translateView(vec3.negate(cache.negatedAnchorPosition, position));
  Env.gl.uniform3fv(Env.gl.getActiveProgram().eyeLocationUniform, position);
};


FpsCamera.prototype.getPosition = function() {
  return this.anchor.position;
};

FpsCamera.prototype.setAnchor = function(anchor) {
  this.anchor = anchor;
};
