goog.provide('Pane');

goog.require('util');
goog.require('LeafThing');


/**
 * @constructor
 * @extends {LeafThing}
 * @struct
 * @suppress {missingProperties}
 */
// TODO: cache position buffers!
Pane = function(message) {
  message.drawType = LeafThing.DrawType.ELEMENTS;
  goog.base(this, message);
  this.size = message.size;
  util.assert(!this.size[2], 'z-size must be 0 or undefined for a pane.');

  this.textureCounts = message.textureCounts || [1, 1];

  this.verticies = this.createVerticies();

  this.objectCache.findEncounter = {
    encounter: {},
    p_0_lc: vec3.create(),
    p_1_lc: vec3.create(),
    delta: vec3.create(),
    encounterPoint: vec3.create()
  }

  this.finalize();
};
goog.inherits(Pane, LeafThing);


Pane.prototype.createVerticies = function() {
  var halfSize = vec2.scale([], this.size, .5);
  return [
    -halfSize[0], -halfSize[1],  0,
     halfSize[0], -halfSize[1],  0,
     halfSize[0],  halfSize[1],  0,
    -halfSize[0],  halfSize[1],  0
  ];
};


Pane.prototype.snapIn = function(thing) {
  var p_lc = this.worldToLocalCoords(thing.position, thing.position);
  for (var i = 0; i < 2; i++) {
    var halfSize = this.size[i]/2;
    if (p_lc[i] < -halfSize) {
      p_lc[i] = -halfSize + .1;
    }
    if (p_lc[i] > halfSize) {
      p_lc[i] = halfSize - .1;
    }
  }
  this.localToParentCoords(thing.position, thing.position);
};


Pane.prototype.contains_lc = function(p_lc, opt_tolerance) {
  var tolerance = opt_tolerance || 0;
  for (var i = 0; i < 2; i++) {
    var size = this.size[i]/2 + tolerance;
    if (p_lc[i] < -size || p_lc[i] > size) {
      return false;
    }
  }
  return true;
};


/**
 * @param {vec3} p_0_pc Initial position.
 * @param {vec3} p_1_pc Final position.
 * @param {number} threshold How close the encounter has to be.
 * @param {Object.<string, *>=} opt_extraArgs More crap.
 */
Pane.prototype.findEncounter = function(p_0_pc, p_1_pc, threshold,
    opt_extraArgs) {

  var tolerance = opt_extraArgs ? opt_extraArgs.tolerance : 0;

  var cache = this.objectCache.findEncounter;
  var p_0_lc = this.parentToLocalCoords(cache.p_0_lc, p_0_pc);
  var p_1_lc = this.parentToLocalCoords(cache.p_1_lc, p_1_pc);

  var delta = vec3.subtract(cache.delta, p_1_lc, p_0_lc);
  var t_cross = -p_0_lc[2] / delta[2];

  var closestEncounter = cache.encounter;
  closestEncounter.expired = true;
  if (Quadratic.inFrame(t_cross)) {
    var p_int_lc = vec3.scaleAndAdd(cache.encounterPoint,
        p_0_lc,
        delta,
        t_cross);
    if (this.contains_lc(p_int_lc, tolerance)) {
      // We've intersected the pane in this past frame
      // If threshold is 0 (intersection), this is the only form of
      // encounter we have to consider.
      this.maybeSetEncounter_(threshold, t_cross, 0, p_int_lc);
      if (threshold == 0) return closestEncounter;
    }
  }

  // At this point, there are other points that need to be considered.
  // Make an array of all points that could possibly be the closest.
  // This does not yet consider point-to-point distances for points
  // outside of the pane.

  // Add first/last points, if they're contained
  if (this.contains_lc(p_0_lc, tolerance)) {
    this.maybeSetEncounter_(threshold, 0, p_0_lc[2], p_0_lc);
  }
  if (this.contains_lc(p_1_lc, tolerance)) {
    this.maybeSetEncounter_(threshold, 1, p_1_lc[2], p_1_lc);
  }

  // For both axes (not including z), test if we've crossed
  for (var i = 0; i < 2; i++) {
    var halfSize = this.size[i]/2;
    var maxInI = Math.max(p_0_lc[i], p_1_lc[i]);
    var minInI = Math.min(p_0_lc[i], p_1_lc[i]);
    for (var direction = -1; direction <= 1; direction += 2) {
      var bound = direction*halfSize;
      if (maxInI > bound && minInI < bound) {
        var t = (bound - p_0_lc[i]) / delta[i];
        var p = vec3.scaleAndAdd(cache.encounterPoint, p_0_lc, delta, t);
        if (this.contains_lc(p, tolerance)) {
          this.maybeSetEncounter_(threshold, t, p[2], p);
        }
      }
    }
  }
  if (closestEncounter.expired) return null;
  return closestEncounter;
};


Pane.prototype.maybeSetEncounter_ = function(threshold, t, distance, point) {
  var cached = this.objectCache.findEncounter.encounter;
  if (Math.abs(distance) > threshold) return;
  if (!cached.expired && t > cached.t) return;
  cached.part = this;
  cached.t = t;
  cached.distance = distance;
  cached.distanceSquared = util.math.sqr(distance);
  cached.point = point;
  cached.expired = false;
  return cached;
};


Pane.prototype.getNormal = function() {
  return this.localToWorldCoords(this.objectCache.normal,
      vec3.K,
      0);
};


Pane.positionBufferCache = {};
Pane.prototype.getPositionBuffer = function() {
  if (this.dynamic) {
    return Env.gl.generateBuffer(this.verticies, 3);
  }

  var cache = Pane.positionBufferCache;
  if (!cache[this.size[0]]) {
    cache[this.size[0]] = {};
  }
  if (!cache[this.size[0]][this.size[1]]) {
    cache[this.size[0]][this.size[1]] =
        Env.gl.generateBuffer(this.verticies, 3);
  }
  return cache[this.size[0]][this.size[1]];
};


Pane.indexBuffer = null;
Pane.prototype.getIndexBuffer = function() {
  if (!Pane.indexBuffer) {
    var vertexIndices = [
      0, 1, 2,    0, 2, 3
    ];
    Pane.indexBuffer = Env.gl.generateIndexBuffer(vertexIndices);
  }
  return Pane.indexBuffer;
};


Pane.textureBufferCache = {};
Pane.prototype.getTextureBuffer = function() {
  var counts = this.textureCounts;
  var bufferCache = Pane.textureBufferCache;

  if (!bufferCache[counts[0]]) {
    bufferCache[counts[0]] = {};
  }
  if (!bufferCache[counts[0]][counts[1]]) {
    var textureCoords = [
      0, 0,
      counts[0], 0,
      counts[0], counts[1],
      0, counts[1]
    ];

    bufferCache[counts[0]][counts[1]] = Env.gl.generateBuffer(textureCoords, 2);
  }
  return bufferCache[counts[0]][counts[1]];
};


Pane.normalBuffer = null;
Pane.prototype.getNormalBuffer = function() {
  if (!Pane.normalBuffer) {
    var vertexNormals = [
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
    ];
    Pane.normalBuffer = Env.gl.generateBuffer(vertexNormals, 3);
  }

  return Pane.normalBuffer;
};


