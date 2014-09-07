goog.provide('FreeCamera');

goog.require('util');
goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @implements {Camera}
 */
FreeCamera = function(message) {
  goog.base(this, message);

  this.negatedPosition = vec3.create();
  this.viewOrientation = quat.create();
  quat.conjugate(this.viewOrientation,
      quat.rotationTo(this.viewOrientation,
          this.position,
          [0, 0, 0]));
};
goog.inherits(FreeCamera, Thing);


FreeCamera.prototype.transform = function() {
  Env.gl.translateView(vec3.negate(this.negatedPosition, this.position));
  Env.gl.rotateView(this.viewOrientation);
  Env.gl.uniform3fv(Env.gl.getActiveProgram().eyeLocationUniform, this.position);
};


FreeCamera.prototype.getPosition = function() {
  return this.position;
};
