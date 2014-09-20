goog.provide('Thing');
goog.provide('Thing.Message');
goog.provide('Thing.VelocityType');

goog.require('util');


/**
 * @param {Thing.Message} message
 * @constructor
 * @struct
 * @suppress {missingProperties}
 */
Thing = function(message) {
  this.upOrientation = quat.nullableClone(message.upOrientation);
  quat.rotateY(this.upOrientation, this.upOrientation, message.yaw || 0);
  quat.rotateX(this.upOrientation, this.upOrientation, message.pitch || 0);
  quat.rotateZ(this.upOrientation, this.upOrientation, message.roll || 0);

  this.rPitch = message.rPitch || 0;
  this.rYaw = message.rYaw || 0;
  this.rRoll = message.rRoll || 0;

  this.velocityType = message.velocityType || Thing.defaultVelocityType;


  this.position = vec3.nullableClone(message.position);
  this.velocity = vec3.nullableClone(message.velocity);
  this.lastPosition = vec3.clone(this.position);

  this.scale = vec3.fromValues(1, 1, 1);

  this.alive = message.alive !== false;
  this.age = 0;
  this.damageMultiplier = message.damageMultiplier || 1;

  this.parts = [];
  this.effects = [];
  this.parent = null;

  this.isRoot = message.isRoot || false;
  this.isStatic = message.isStatic || false;
  this.glommable = message.glommable !== false;
  this.name = message.name || null;

  this.isDisposed = false;

  this.distanceSquaredToCamera = 0;

  this.objectCache = {
    findEncounter: {
      p_0: vec3.create(),
      p_1: vec3.create(),
    },
    normal: vec3.create(),
    upNose: vec3.create(),
  };
};


/**
 * @typedef {Object.<string, *>}
 */
Thing.Message;


/**
 * @enum
 */
Thing.VelocityType = {
  ABSOLUTE: 1,
  RELATIVE: 2
};


/** @type {Thing.VelocityType} */
Thing.defaultVelocityType = Thing.VelocityType.ABSOLUTE;


Thing.prototype.advance = function(dt) {
  this.advanceBasics(dt);
};


Thing.prototype.advanceBasics = function(dt) {
  if (this.isDisposed) return;
  this.age += dt;
  if (this.effects.length) {
      for (var i = 0; this.effects[i]; i++) {
      this.effects[i].advance(dt);
    }
  }

  if (this.rYaw) {
    quat.rotateY(this.upOrientation,
        this.upOrientation,
        this.rYaw * dt);
  }
  if (this.rPitch) {
    quat.rotateX(this.upOrientation,
        this.upOrientation,
        this.rPitch * dt);
  }
  if (this.rRoll) {
    quat.rotateZ(this.upOrientation,
        this.upOrientation,
        this.rRoll * dt);
  }

  if (this.velocity[0] || this.velocity[1] || this.velocity[2]) {
    this.saveLastPosition();
    if (this.velocityType == Thing.VelocityType.RELATIVE) {
      vec3.scaleAndAdd(this.position, this.position,
          vec3.transformQuat(
              vec3.temp,
              this.velocity,
              this.getMovementUp()), dt);
    } else {
      vec3.scaleAndAdd(this.position, this.position,
          this.velocity,
          dt);
    }
  }

  if (!this.isStatic && this.parts.length) {
    for (var i = 0; this.parts[i]; i++) {
      this.parts[i].advance(dt);
    }
  }
};


/**
 * Gets the orientation in which velocity should be evaluated,
 * for VelocityType.RELATIVE.
 * Ignored for VelocityType.ABSOLUTE.
 * @return {quat}
 */
Thing.prototype.getMovementUp = function() {
  var result = quat.create();
  return function(out) {
    return quat.copy(result, this.upOrientation);
  }
}();


Thing.prototype.getConjugateUp = function() {
  var result = quat.create();
  return function() {
    return quat.conjugate(result, this.upOrientation);
  }
}();



Thing.prototype.setVelocity = function(v) {
  vec3.copy(this.velocity, v);
};


Thing.prototype.findThingEncounter = function(thing, threshold) {
  return this.findEncounter(
      thing.lastPosition, thing.position, threshold);
};


Thing.prototype.findEncounter = function(p_0_pc, p_1_pc, threshold) {
  var cache = this.objectCache.findEncounter;
  var p_0 = this.parentToLocalCoords(cache.p_0, p_0_pc);
  var p_1 = this.parentToLocalCoords(cache.p_1, p_1_pc);

  var closestEncounter = null;
  for (var i = 0; this.parts[i]; i++) {
    var encounter = this.parts[i].findEncounter(p_0, p_1, threshold);
    if (!encounter) continue;
    if (!closestEncounter) {
      closestEncounter = encounter;
      continue;
    }

    if (encounter.t < closestEncounter.t) {
      closestEncounter = encounter;
      continue
    }
  };
  return closestEncounter;
};


Thing.prototype.glom = function(thing, point) {
  if (this.glommable) {
    // Env.world.disposables.push(thing);
    this.addEffect(thing);
    Env.world.projectiles.remove(thing);
    vec3.copy(thing.velocity, vec3.ZERO);

    vec3.copy(thing.position, point);
  } else {
    this.localToParentCoords(point, point);
    this.parent.glom(thing, point);
  }
};


/**
 * Transforms a vector in "thing-space" for this thing
 * into parent coordinates.
 * @param out The receiving Vector3
 * @param v Vector3 in "thing-space"
 * @param {number=} opt_w 1 if position, 0 if vector
 */
Thing.prototype.localToParentCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  if (w == 1) {
    vec3.transformQuat(out, v, this.upOrientation);
    vec3.add(out, out, this.position);
  } else {
    vec3.transformQuat(out, v, this.upOrientation);
  }
  return out;
};


/**
 * Transforms a vector in parent coordinates to local coordinates
 * @param {vec3} out The receiving Vector3
 * @param {vec3} v Vector3 in world coordinates
 * @param {number=} opt_w 1 if position, 0 if vector
 */
Thing.prototype.parentToLocalCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  var conjugateUp = quat.conjugate(quat.temp, this.upOrientation);
  if (w == 1) {
    vec3.subtract(out, v, this.position);
    vec3.transformQuat(out, out, conjugateUp);
  } else {
    vec3.transformQuat(out, v, conjugateUp);
  }
  return out;
};


/**
 * Transforms a vector in "thing-space" for this thing
 * into world coordinates.
 * @param out The receiving Vector3
 * @param v Vector3 in "thing-space"
 * @param {number=} opt_w 1 if position, 0 if vector
 */
Thing.prototype.localToWorldCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  this.localToParentCoords(out, v, w);
  if (this.parent) {
    this.parent.localToWorldCoords(out, out, w);
  }
  return out;
};


/**
 * Transforms a vector in world-space
 * into world coordinates for this thing.
 * @param out The receiving Vector3
 * @param v Vector3 in "thing-space"
 * @param {number=} opt_w 1 if position, 0 if vector
 */
Thing.prototype.worldToLocalCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  if (this.parent) {
    this.parent.worldToLocalCoords(out, v, w);
    this.parentToLocalCoords(out, out, w);
  } else {
    this.parentToLocalCoords(out, v, w);
  }
  return out;
};

Thing.prototype.fromUpOrientation = function() {
  var result = vec3.create();
  return function(a) {
    return vec3.transformQuat(result, a, this.upOrientation);
  }
}();

Thing.prototype.toUpOrientation = function() {
  var result = vec3.create();
  return function(a) {
    return vec3.transformQuat(result, a, this.getConjugateUp());
  }
}();

Thing.prototype.draw = function() {
  if (this.isDisposed) return;
  Env.gl.pushModelMatrix();
  this.transform();
  this.render();
  Env.gl.popModelMatrix();
};


Thing.prototype.transform = function() {
  Env.gl.translate(this.position);
  Env.gl.rotate(this.upOrientation);
  Env.gl.getActiveProgram().setUniformScale(this.scale);
};


Thing.prototype.render = function() {
  this.eachPart(function(part){
    part.draw();
  });
  this.eachEffect(function(effect){
    effect.draw();
  });
};


/** @suppress {missingProperties} */
Thing.prototype.getType = function() {
  return this.constructor.type;
};


Thing.prototype.dispose = function() {
  this.velocity = null;
  this.position = null;
  this.isDisposed = true;

  if (this.parent) {
    this.parent.removePart(this);
  }
  Env.world.things.remove(this);
  Env.world.projectiles.remove(this);

  util.array.forEach(this.parts, function(part){
    part.dispose();
  });
};


Thing.prototype.setParent = function(parent) {
  this.parent = parent;
};


Thing.prototype.addPart = function(part) {
  this.parts.push(part);
  part.setParent(this);
};


Thing.prototype.addEffect = function(effect) {
  this.effects.push(effect);
  effect.setParent(this);
};


Thing.prototype.removePart = function(part) {
  util.array.remove(this.parts, part);
  part.setParent(null);
};


Thing.prototype.addParts = function(parts) {
  util.array.forEach(parts, function(part) {
    this.addPart(part);
  }, this);
};


Thing.prototype.saveLastPosition = function() {
  vec3.copy(this.lastPosition, this.position);
};


Thing.prototype.distanceSquaredTo = function(other) {
  return vec3.squaredDistance(this.position, other.position);
};


Thing.prototype.computeDistanceSquaredToCamera = function(cameraPosition) {
  this.distanceSquaredToCamera = vec3.squaredDistance(this.position, cameraPosition);
};


Thing.prototype.getDeltaP = function(out) {
  vec3.subtract(out, this.position, this.lastPosition);
};


Thing.prototype.setPitchOnly = function(pitch) {
  quat.setAxisAngle(this.upOrientation, vec3.I, pitch);
};


Thing.prototype.getNormal = function() {
  return this.localToWorldCoords(this.objectCache.normal,
      vec3.J,
      0);
};


Thing.prototype.getUpNose = function() {
  return this.localToWorldCoords(this.objectCache.upNose,
      vec3.NEG_K,
      0);
};


Thing.prototype.getGlommable = function() {
  if (this.glommable) return this;
  util.assertNotNull(this.parent, 'No glommable target found.');
  return this.parent.getGlommable();
};


Thing.prototype.getRoot = function() {
  if (this.isRoot) return this;
  util.assertNotNull(this.parent, 'No root found.');
  return this.parent.getRoot();
};


Thing.prototype.eachPart = function(fn) {
  util.array.forEach(this.parts, fn, this);
};


Thing.prototype.eachEffect = function(fn) {
  util.array.forEach(this.effects, fn, this);
};

