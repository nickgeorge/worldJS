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
  // quat.conjugate(this.upOrientation,
  //     quat.rotationTo(this.upOrientation,
  //         this.position,
  //         [0, 0, 0]));
};
goog.inherits(FreeCamera, Thing);


FreeCamera.prototype.transform = function() {
  Env.gl.rotateView(this.upOrientation);
  Env.gl.translateView(vec3.negate(this.negatedPosition, this.position));
  Env.gl.uniform3fv(Env.gl.getActiveProgram().eyeLocationUniform, this.position);
};


FreeCamera.prototype.getPosition = function() {
  return this.position;
};
