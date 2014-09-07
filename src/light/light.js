goog.provide('Light');


/** @constructor @struct */
Light = function(message) {
  this.ambientColor = vec3.nullableClone(message.ambientColor);
  this.directionalColor = vec3.nullableClone(message.directionalColor);

  this.anchor = message.anchor;
  this.position = message.position;
};


Light.prototype.setAnchor = function(anchor) {
  this.anchor = anchor;
};


Light.prototype.setPosition = function(position) {
  this.position = position;
};


Light.prototype.setAmbientColor = function(rgb) {
  vec3.copy(this.ambientColor, rgb);
};


Light.prototype.setDirectionalColor = function(rgb) {
  vec3.copy(this.directionalColor, rgb);
};



Light.prototype.getPosition = function() {
  if (this.position) return this.position;
  if (this.anchor) return this.anchor.position;
  throw new Error('Error: one of (anchor, position) ' +
      'should be set.');
};


Light.prototype.apply = function() {
  var shaderProgram = Env.gl.getActiveProgram();
  Env.gl.uniform3fv(shaderProgram.ambientColorUniform, this.ambientColor);
  Env.gl.uniform3fv(shaderProgram.pointLightingLocationUniform, this.getPosition());
  Env.gl.uniform3fv(shaderProgram.pointLightingColorUniform, this.directionalColor);
};
