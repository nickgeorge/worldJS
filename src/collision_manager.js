goog.provide('CollisionManager');
goog.provide('CollisionCondition');

goog.require('util');


/**
 * @param {World} world
 * @constructor
 */
CollisionManager = function(world) {
  this.world = world;
  this.collisionConditions = {};

  // this.bins = {};
  // this.binSize = 75;
  // this.binOverlap =

  this.filtered = [];

  this.registerCollisionConditions();
};


CollisionManager.prototype.registerCollisionConditions = util.unimplemented;


CollisionManager.prototype.registerCollisionCondition = function(
    classA, classB, thresholdFunction, collisionFunction) {
  var typeA = classA.type;
  var typeB = classB.type;

  var key = CollisionManager.getKey(typeA, typeB);
  var reverseKey = CollisionManager.getKey(typeB, typeA);
  var condition = new CollisionCondition(
      thresholdFunction,
      collisionFunction);

  this.collisionConditions[key] = condition;
  this.collisionConditions[reverseKey] = condition.getInverted();
};


CollisionManager.prototype.isRegisteredCollision = function(thingA, thingB) {
  return Boolean(this.collisionConditions[CollisionManager.getKey(
      thingA.getType(),
      thingB.getType())]);
};


CollisionManager.prototype.checkCollisions = function() {
  this.thingOnThing();
  this.thingOnProjectile();
};


CollisionManager.prototype.thingOnProjectile = function() {
  for (var i = 0, thing; thing = this.world.things.get(i); i++) {
    for (var j = 0, projectile; projectile = this.world.projectiles.get(j); j++) {
      if (thing.isDisposed || projectile.isDisposed) continue;
      if (!this.isRegisteredCollision(thing, projectile)) continue;
      if (!projectile.alive) continue;
      if (util.math.sqr(thing.getOuterRadius() + projectile.getOuterRadius()) <
          thing.distanceSquaredTo(projectile)) {
        continue;
      }
      this.test(thing, projectile);
    }
  }
};


CollisionManager.prototype.thingOnThing = function() {
  // TODO: Check everything, collide with the collision with min
  // value of t
  for (var i = 0, thingA; thingA = this.world.things.get(i); i++) {
    for (var j = i + 1, thingB; thingB = this.world.things.get(j); j++) {
      this.doPerPair(thingA, thingB);
    }
  }
};


CollisionManager.prototype.doPerPair = function(thingA, thingB) {
  if (thingA.isDisposed || thingB.isDisposed) return;
  if (!this.isRegisteredCollision(thingA, thingB)) return;
  if (thingA.ground == thingB || thingB.ground == thingA) return;
  var minDistance = thingA.distanceSquaredTo(thingB);
  if (util.math.sqr(thingA.getOuterRadius() + thingB.getOuterRadius()) <
      minDistance) {
    return;
  }
  this.test(thingA, thingB);
};


CollisionManager.prototype.test = function(shapeLike, pointLike) {
  var shapeLikeType = shapeLike.getType();
  var pointLikeType = pointLike.getType();
  var key = CollisionManager.getKey(shapeLikeType, pointLikeType);
  var collisionCondition = this.collisionConditions[key];

  if (!collisionCondition) return;

  // var threshold = collisionCondition.thresholdFunction(shapeLike, pointLike);
  // var encounter = shapeLike.findThingEncounter(bullet, 0);
  collisionCondition.collisionFunction(shapeLike, pointLike);
};


CollisionManager.getKey = function(typeA, typeB) {
  return typeA*1000 + typeB;
};


/**
 * @param {CollisionCondition.ThresholdFunction} thresholdFunction
 * @param {CollisionCondition.CollisionFunction} collisionFunction
 * @constructor
 */
CollisionCondition = function(thresholdFunction, collisionFunction) {
  this.thresholdFunction = thresholdFunction;
  this.collisionFunction = collisionFunction;
};


/** @typedef {function(Thing=, Thing=): number} */
CollisionCondition.ThresholdFunction;


/** @typedef {function(Thing, Thing, Object)} */
// TODO: typedef for Encounter
CollisionCondition.CollisionFunction;



CollisionCondition.prototype.getInverted = function() {
  /** @type {CollisionCondition.ThresholdFunction} */
  var invertedThresholdFunction = function(pointLike, shapeLike) {
    return this.thresholdFunction(shapeLike, pointLike);
  };

  /** @type {CollisionCondition.CollisionFunction} */
  var invertedCollisionFunction = function(pointLike, shapeLike, encounter) {
    return this.collisionFunction(shapeLike, pointLike, encounter);
  };
  return new CollisionCondition(
      invertedThresholdFunction,
      invertedCollisionFunction);
};
