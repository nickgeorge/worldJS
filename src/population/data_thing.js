goog.provide('DataThing');

goog.require('LeafThing');


/**
 * @constructor
 * @extends {LeafThing}
 * @struct
 */
DataThing = function(message) {
  goog.base(this, message);

  /** @type {DataThing.Data} */
  this.data = message.data;

  this.finalize();

};
goog.inherits(DataThing, LeafThing);


/**
 * @typedef {{
 *   vertexCoordinates: Array.<number>,
 *   normalCoordinates: Array.<number>,
 *   type: string
 * }}
 */
DataThing.Data;


DataThing.positionBufferCache = {};
DataThing.prototype.getPositionBuffer = function() {
  if (!DataThing.positionBufferCache[this.data.type]) {
    DataThing.positionBufferCache[this.data.type] =
        Env.gl.generateBuffer(this.data.vertexCoordinates, 3);
  }
  return DataThing.positionBufferCache[this.data.type];
};


DataThing.normalBufferCache = {};
DataThing.prototype.getNormalBuffer = function() {
  if (!DataThing.normalBufferCache[this.data.type]) {
    DataThing.normalBufferCache[this.data.type] =
        Env.gl.generateBuffer(this.data.normalCoordinates, 3);
  }
  return DataThing.normalBufferCache[this.data.type];
};


DataThing.textureBufferCache = {};
DataThing.prototype.getTextureBuffer = function() {
  if (!DataThing.textureBufferCache[this.data.type]) {
    var vertexTetextureCoordinates = [];
    for (var i = 0; i < this.vertexBuffer.numItems; i++) {
      vertexTetextureCoordinates.push(0);
      vertexTetextureCoordinates.push(0);
    };
    DataThing.textureBufferCache[this.data.type] =
        Env.gl.generateBuffer(vertexTetextureCoordinates, 2);
  }
  return DataThing.textureBufferCache[this.data.type];
};
