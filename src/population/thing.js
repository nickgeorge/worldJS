goog.provide('Thing');
goog.provide('Thing.Proto');
goog.provide('Thing.VelocityType');

goog.require('util');
goog.require('Proto');


/**
 * @param {Object.<string, *>} message
 * @constructor
 * @struct
 * @suppress {missingProperties}
 */
Thing = function(message) {
  this.id = null;
  this.upOrientation = quat.nullableClone(message.upOrientation);
  quat.rotateY(this.upOrientation, this.upOrientation, message.yaw || 0);
  quat.rotateX(this.upOrientation, this.upOrientation, message.pitch || 0);
  quat.rotateZ(this.upOrientation, this.upOrientation, message.roll || 0);

  this.rPitch = message.rPitch || 0;
  this.rYaw = message.rYaw || 0;
  this.rRoll = message.rRoll || 0;

  this.velocityType = message.velocityType || Thing.defaultVelocityType;

  /** @type {vec3} */
  this.position = vec3.nullableClone(message.position);

  this.velocity = vec3.nullableClone(message.velocity);
  this.acceleration = vec3.nullableClone(message.acceleration);
  this.lastPosition = vec3.clone(this.position);
  this.color = message.color || vec4.fromValues(1, 1, 1, 1);


  this.scale = message.uScale ?
      vec3.fromValues(message.uScale,
          message.uScale,
          message.uScale) :
      message.scale || vec3.fromValues(1, 1, 1);

  if (message.parentScale) {
    vec3.multiply(this.scale,
        this.scale,
        message.parentScale);
    vec3.multiply(this.position,
        this.position,
        message.parentScale);
  }

  this.alive = !(message.alive === false || message.alive === 0);
  this.age = 0;
  this.damageMultiplier = message.damageMultiplier || 1;
  this.visible = !(message.visible === false || message.visible === 0);

  this.parts = [];
  this.effects = [];
  this.parent = null;

  this.isRoot = message.isRoot || false;
  this.isStatic = message.isStatic || false;
  this.glommable = message.glommable !== false;
  this.transluscent = false;
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
 * @enum
 */
Thing.VelocityType = {
  ABSOLUTE: 1,
  RELATIVE: 2
};


/** @type {Thing.VelocityType} */
Thing.defaultVelocityType = Thing.VelocityType.ABSOLUTE;


Thing.prototype.setId = function(id) {
  this.id = id;
  return this;
};


Thing.prototype.advance = function(dt) {
  // this.advanceBasics(dt);
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
      vec3.scaleAndAdd(this.velocity, this.velocity,
          this.acceleration,
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


/**
 * Transforms a coordinate in local-space into parent-space.
 * @param {vec3} out The receiving Vector3.  Also returned.
 * @param {vec3} v Coordinate in local-space.
 * @return {vec3} the coordinate in parent-space.
 */
Thing.prototype.localToParentCoords = function(out, v) {
  vec3.transformQuat(out, v, this.upOrientation);
  vec3.add(out, out, this.position);
  return out;
};


/**
 * Transforms a vector in local-space to parent-space
 * @param {vec3} out The receiving Vector3. Also returned.
 * @param {vec3} v The vector in local-space
 * @return {vec3} The vector in parent-space.
 */
Thing.prototype.localToParentVector = function(out, v) {
  vec3.transformQuat(out, v, this.upOrientation);
  return out;
};


/**
 * Transforms a coordinate in parent-space into local-space.
 * @param {vec3} out The receiving Vector3.  Also returned.
 * @param {vec3} v Coordinate in parent-space
 * @return {vec3} The coordinate in local-space
 */
Thing.prototype.parentToLocalCoords = function() {
  var conjugateUp = quat.create();
  return function(out, v) {
    quat.conjugate(conjugateUp, this.upOrientation);
    vec3.subtract(out, v, this.position);
    vec3.transformQuat(out, out, conjugateUp);
    return out;
  }
}();


/**
 * Transforms a vector in parent-space into local-space.
 * @param {vec3} out The receiving Vector3.  Also returned.
 * @param {vec3} v Vector in parent-space
 * @return {vec3} The vector in local-space
 */
Thing.prototype.parentToLocalVector = function() {
  var conjugateUp = quat.create();
  return function(out, v) {
    quat.conjugate(conjugateUp, this.upOrientation);
    vec3.transformQuat(out, v, conjugateUp);
    return out;
  }
}();


/**
 * Transforms coordinates in local-space into world-space.
 * @param {vec3} out The receiving Vector3
 * @param {vec3} v Coordinates in thing-space
 * @return {vec3} The coordinates in world-space.
 */
Thing.prototype.localToWorldCoords = function(out, v) {
  this.localToParentCoords(out, v);
  if (this.parent) {
    this.parent.localToWorldCoords(out, out);
  }
  return out;
};


/**
 * Transforms a vector in local-space into world-space.
 * @param {vec3} out The receiving Vector3
 * @param {vec3} v The vector in thing-space
 * @return {vec3} The vector in world-space.
 */
Thing.prototype.localToWorldVector = function(out, v) {
  this.localToParentVector(out, v);
  if (this.parent) {
    this.parent.localToWorldVector(out, out);
  }
  return out;
};


/**
 * Transforms coordinates in world-space into local-space.
 * @param {vec3} out The receiving Vector3
 * @param {vec3} v Coordinates in thing-space.
 * @return {vec3} The coordinates in local-space.
 */
Thing.prototype.worldToLocalCoords = function(out, v) {
  if (this.parent) {
    this.parent.worldToLocalCoords(out, v);
    this.parentToLocalCoords(out, out);
  } else {
    this.parentToLocalCoords(out, v);
  }
  return out;
};


/**
 * Transforms vector in world-space into local-space.
 * @param {vec3} out The receiving Vector3
 * @param {vec3} v The vector in thing-space.
 * @return {vec3} The vector in local-space.
 */
Thing.prototype.worldToLocalVector = function(out, v) {
  if (this.parent) {
    this.parent.worldToLocalVector(out, v);
    this.parentToLocalVector(out, out);
  } else {
    this.parentToLocalVector(out, v);
  }
  return out;
};


/**
 * @param {Thing} thing
 * @param {number} threshold
 * @param {Object.<String, *>=} opt_extraArgs
 */
Thing.prototype.findThingEncounter = function(thing, threshold, opt_extraArgs) {
  return this.findEncounter(
      thing.lastPosition, thing.position, threshold, opt_extraArgs);
};


/**
 * @param {vec3} p_0_pc
 * @param {vec3} p_1_pc
 * @param {number} threshold
 * @param {Object.<string, *>=} opt_extraArgs
 *
 * @suppress {missingProperties}
 */
Thing.prototype.findEncounter = function(p_0_pc, p_1_pc, threshold, opt_extraArgs) {
  var cache = this.objectCache.findEncounter;
  var p_0 = this.parentToLocalCoords(cache.p_0, p_0_pc);
  var p_1 = this.parentToLocalCoords(cache.p_1, p_1_pc);

  var closestEncounter = null;
  for (var i = 0; this.parts[i]; i++) {
    if (opt_extraArgs && this.parts[i] == opt_extraArgs.exclude) continue;
    var encounter = this.parts[i].findEncounter(p_0, p_1, threshold, opt_extraArgs);
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
  if (this.isDisposed || !this.visible) return;
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
  for (var i = 0; this.parts[i]; i++) {
    this.parts[i].draw();
  }
  for (var i = 0; this.effects[i]; i++) {
    this.effects[i].draw();
  }
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
  // console.log(this.parent.scale);
  // vec3.multiply(this.scale, this.scale, this.parent.scale);
  // console.log(this.scale);
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
  return this.localToWorldVector(this.objectCache.normal,
      vec3.J);
};


Thing.prototype.getUpNose = function() {
  return this.localToWorldVector(this.objectCache.upNose,
      vec3.NEG_K);
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


Thing.prototype.eachPartRecursive = function(fn) {
  util.array.forEach(this.parts, function(part) {
    fn.call(this, part);
    part.eachPartRecursive(fn);
  }, this);
};


Thing.prototype.eachEffect = function(fn) {
  util.array.forEach(this.effects, fn, this);
};


Thing.prototype.setColor = function(color) {
  this.color = color;
  this.eachPartRecursive(function(part) {
    part.color = color;
  });
};


Thing.prototype.getParts = function() {
  return this.parts;
};


Thing.prototype.setVisible = function(visible) {
  this.visible = visible;
};


Thing.prototype.glom = function(thing, point) {
  if (this.glommable) {
    this.addEffect(thing);
    Env.world.removeProjectile(thing);
    vec3.copy(thing.velocity, vec3.ZERO);

    vec3.copy(thing.position, point);
  } else {
    this.localToParentCoords(point, point);
    this.parent.glom(thing, point);
  }
};


/**
 * @constructor
 * @struct
 * @extends {Proto}
 */
Thing.Proto = function() {
  goog.base(this);
  this.alive = this.addField(0, new ByteField());
  this.position = this.addField(1, new Vec3Field());
  this.velocity = this.addField(2, new Vec3Field());
  this.upOrientation = this.addField(3, new QuatField());
};
goog.inherits(Thing.Proto, Proto);

