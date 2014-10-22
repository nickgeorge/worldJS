goog.provide('LeafThing');

goog.require('util');
goog.require('Thing');
goog.require('GL');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
LeafThing = function(message) {
  goog.base(this, message);

  this.drawable = message.drawable !== false;
  this.elementType = message.elementType || GL.TRIANGLES;
  this.drawType = message.drawType || LeafThing.DrawType.ARRAYS;
  this.texture = message.texture || null;
  this.dynamic = message.dynamic || false;
  this.vertexBuffer = null;
  this.textureBuffer = null;
  this.indexBuffer = null;
  this.normalBuffer = null;
};
goog.inherits(LeafThing, Thing);


/** @enum */
LeafThing.DrawType = {
  ARRAYS: 0,
  ELEMENTS: 1
};


LeafThing.prototype.render = function() {
  if (this.drawable) this.renderSelf();
  if (this.effects.length) {
    this.eachEffect(function(effect){
      effect.draw();
    });
  }
};


LeafThing.prototype.renderSelf = function() {
  util.assert(this.drawable, 'Cannot render- not drawable.');
  Env.gl.setModelMatrixUniforms();

  var shaderProgram = Env.gl.getActiveProgram();
  shaderProgram.setUniformColor(this.color);
  shaderProgram.setUseTexture(Boolean(this.texture && this.texture.loaded));
  if (this.texture) {
    shaderProgram.bindTexture(this.texture);
  }
  shaderProgram.bindVertexPositionBuffer(this.vertexBuffer);
  shaderProgram.bindVertexNormalBuffer(this.normalBuffer);
  shaderProgram.bindVertexTextureBuffer(this.textureBuffer);
  shaderProgram.bindVertexIndexBuffer(this.indexBuffer);

  if (this.drawType == LeafThing.DrawType.ELEMENTS) {
    Env.gl.drawElements(this.elementType, this.indexBuffer.numItems, GL.UNSIGNED_SHORT, 0);
  } else {
    Env.gl.drawArrays(this.elementType, 0, this.vertexBuffer.numItems);
  }
};


LeafThing.prototype.dispose = function() {
  goog.base(this, 'dispose');
  this.vertexBuffer = null;
  this.textureBuffer = null;
  this.indexBuffer = null;
  this.normalBuffer = null;
  this.texture = null;
  this.color = null;
};


LeafThing.prototype.finalize = function() {
  if (!this.drawable) return;

  this.vertexBuffer = this.getPositionBuffer();
  this.textureBuffer = this.getTextureBuffer();
  this.normalBuffer = this.getNormalBuffer();

  if (this.drawType == LeafThing.DrawType.ELEMENTS) {
    this.indexBuffer = this.getIndexBuffer();
  }
};


LeafThing.prototype.getPositionBuffer = util.unimplemented;
LeafThing.prototype.getIndexBuffer = util.unimplemented;


LeafThing.prototype.getTextureBuffer = function() {
  var vertexTetextureCoordinates = [];
  for (var i = 0; i < this.vertexBuffer.numItems; i++) {
    vertexTetextureCoordinates.push(0);
    vertexTetextureCoordinates.push(0);
  };
  return Env.gl.generateBuffer(vertexTetextureCoordinates, 2);
};


LeafThing.prototype.getNormalBuffer = function() {
  var normals = [];
  for (var i = 0; i < this.vertexBuffer.numItems; i++) {
    normals.push(0);
    normals.push(0);
    normals.push(1);
  };
  return Env.gl.generateBuffer(normals);
};

