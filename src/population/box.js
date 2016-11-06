goog.provide('Box');

goog.require('util');
goog.require('LeafThing');


/**
 * @constructor
 * @struct
 * @extends {LeafThing}
 * @suppress {missingProperties}
 */
Box = function(message) {
  message.drawType = LeafThing.DrawType.ELEMENTS;
  this.normalMultiplier = message.normalMultiplier || 1;
  goog.base(this, message);
  this.size = message.size;
  this.textureCountsByFace = message.textureCountsByFace || {};
  this.invert = message.invert;

  if (message.textureCounts) {
    util.array.forEach(Box.Faces, function(face) {
      if (!this.textureCountsByFace[face]) {
        this.textureCountsByFace[face] = message.textureCounts;
      }
    }, this);
  }

  this.frontFace = null;
  this.backFace = null;
  this.rightFace = null;
  this.leftFace = null;
  this.topFace = null;
  this.bottomFace = null;
  this.buildPanes();

  this.finalize();
};
goog.inherits(Box, LeafThing);


Box.Faces = [
  'top', 'bottom', 'right', 'left', 'front', 'back'
];


Box.prototype.getOuterRadius = function() {
  return Math.max(
      this.size[0],
      this.size[1],
      this.size[2]);
};


/**
 * @param {Function} fn
 * @param {*=} opt_ctx
 */
Box.eachFace = function(fn, opt_ctx) {
  util.array.forEach(Box.Faces, fn, opt_ctx);
};


Box.positionBufferCache = {};


Box.prototype.getPositionBuffer = function() {
  var size = this.size;

  if (!Box.positionBufferCache[size[0]]) {
    Box.positionBufferCache[size[0]] = {};
  }

  if (!Box.positionBufferCache[size[0]][size[1]]) {
    Box.positionBufferCache[size[0]][size[1]] = {};
  }

  if (!Box.positionBufferCache[size[0]][size[1]][size[2]]) {
    var normalPositions = this.invert ?
        Box.invertedNormalizedVertexPositions :
        Box.normalizedVertexPositions;
    var halfSize = vec3.scale([], size, .5);
    var positions = [];
    for (var i = 0; i < normalPositions.length; i++) {
      positions.push(normalPositions[i] * halfSize[i % 3]);
    };
    Box.positionBufferCache[size[0]][size[1]][size[2]] =
        Env.gl.generateBuffer(positions, 3);
  }

  return Box.positionBufferCache[size[0]][size[1]][size[2]];
};


Box.textureBufferCache = {};


Box.prototype.getTextureBuffer = function() {

  // if (!Box.textureBufferCache[tc[0]]) {
    // Box.textureBufferCache[tc[0]] = {};
  // }
  // if (!Box.textureBufferCache[tc[0]][tc[1]]) {
    var vertexTextures = [];
    Box.eachFace(function(faceName) {
      var tc = this.textureCountsByFace[faceName] || [1, 1];
      util.array.pushAll(vertexTextures, [
        0, 0,
        tc[0], 0,
        tc[0], tc[1],
        0, tc[1]
      ]);
    }, this);
    // Box.textureBufferCache[tc[0]][tc[1]] =
        return Env.gl.generateBuffer(vertexTextures, 2);
  // }
  // return Box.textureBufferCache[tc[0]][tc[1]];
};


Box.indexBuffer = null;


Box.prototype.getIndexBuffer = function() {
  if (!Box.indexBuffer) {
    var vertexIndicies = [];
    Box.eachFace(function(faceName, faceIndex) {
      util.array.pushAll(vertexIndicies, [
        faceIndex*4 + 0, faceIndex*4 + 1, faceIndex*4 + 2,
        faceIndex*4 + 0, faceIndex*4 + 2, faceIndex*4 + 3
      ]);
    });
    Box.indexBuffer = Env.gl.generateIndexBuffer(vertexIndicies);
  }
  return Box.indexBuffer;
};


Box.normalBufferCache = {};


Box.prototype.getNormalBuffer = function() {
  if (!Box.normalBufferCache[this.normalMultiplier]) {
    var vertexNormals = [];
    Box.eachFace(function(faceName, faceIndex) {
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < Box.FACE_NORMALS[faceName].length; j++) {
          vertexNormals.push(
              this.normalMultiplier * Box.FACE_NORMALS[faceName][j]);
        }
      }
    }, this);
    Box.normalBufferCache[this.normalMultiplier] =
        Env.gl.generateBuffer(vertexNormals, 3);
  }
  return Box.normalBufferCache[this.normalMultiplier];
};


Box.prototype.buildPanes = function() {
  var invertValue = this.invert ? -1 : 1;
  this.frontFace = new Pane({
    name: "front face",
    size: [this.size[0], this.size[1], 0],
    position: [0, 0, this.size[2]/2 * invertValue],
    drawable: false,
    glommable: false,
  });
  this.backFace = new Pane({
    name: "back face",
    size: [this.size[0], this.size[1], 0],
    position: [0, 0, -this.size[2]/2 * invertValue],
    drawable: false,
    glommable: false,
    yaw: Math.PI,
  });
  this.rightFace = new Pane({
    name: "right face",
    size: [this.size[2], this.size[1], 0],
    position: [this.size[0]/2 * invertValue, 0, 0],
    drawable: false,
    glommable: false,
    yaw: Math.PI/2,
  });
  this.leftFace = new Pane({
    name: "left face",
    size: [this.size[2], this.size[1], 0],
    position: [-this.size[0]/2 * invertValue, 0, 0],
    drawable: false,
    glommable: false,
    yaw: 3*Math.PI/2,
  });
  this.topFace = new Pane({
    name: "top face",
    size: [this.size[0], this.size[2], 0],
    position: [0, this.size[1]/2 * invertValue, 0],
    drawable: false,
    glommable: false,
    pitch: 3*Math.PI/2,
  });
  this.bottomFace = new Pane({
    name: "bottom face",
    size: [this.size[0], this.size[2], 0],
    position: [0, -this.size[1]/2 * invertValue, 0],
    drawable: false,
    glommable: false,
    pitch: Math.PI/2,
  });

  this.addParts([
    this.frontFace,
    this.backFace,
    this.rightFace,
    this.leftFace,
    this.topFace,
    this.bottomFace
  ]);
};


Box.FACE_NORMALS = {
  top: [0, 1, 0],
  bottom: [0, -1, 0],
  right: [1, 0, 0],
  left: [-1, 0, 0],
  front: [0, 0, 1],
  back: [0, 0, -1],
};


Box.normalizedVertexPositions = [
  // Top (y = 1)
  -1, 1, 1,
  1, 1, 1,
  1, 1, -1,
  -1, 1, -1,

  // Bottom (y = -1)
  -1, -1, -1,
  1, -1, -1,
  1, -1, 1,
  -1, -1, 1,

  // Right (x = 1)
  1, -1, -1,
  1, 1, -1,
  1, 1, 1,
  1, -1, 1,

  // Left (x = -1)
  -1, -1, 1,
  -1, 1, 1,
  -1, 1, -1,
  -1, -1, -1,

  // Front (z = 1)
  -1, -1, 1,
  1, -1, 1,
  1, 1, 1,
  -1, 1, 1,

  // Back (z = -1)
  -1, 1, -1,
  1, 1, -1,
  1, -1, -1,
  -1, -1, -1,
];


Box.invertedNormalizedVertexPositions = [
  // Top (y = 1)
  -1, -1, 1,
  1, -1, 1,
  1, -1, -1,
  -1, -1, -1,

  // Bottom (y = -1)
  -1, 1, -1,
  1, 1, -1,
  1, 1, 1,
  -1, 1, 1,

  // Right (x = 1)
  -1, -1, -1,
  -1, 1, -1,
  -1, 1, 1,
  -1, -1, 1,

  // Left (x = -1)
  1, -1, 1,
  1, 1, 1,
  1, 1, -1,
  1, -1, -1,

  // Front (z = 1)
  -1, -1, -1,
  1, -1, -1,
  1, 1, -1,
  -1, 1, -1,

  // Back (z = -1)
  -1, 1, 1,
  1, 1, 1,
  1, -1, 1,
  -1, -1, 1,
];
