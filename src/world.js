goog.provide('World');

goog.require('Env');


/**
 * @constructor
 * @struct
 */
World = function() {
  this.lights = [];
  this.camera = null;
  this.collisionManager = null;

  this.drawables = new ControlledList();

  this.things = new ControlledList();
  this.projectiles = new ControlledList();
  this.effects = new ControlledList();
  this.disposables =  [];

  this.backgroundColor = [1, 1, 1, 1];

  this.sortBeforeDrawing = false;
  this.paused = false;
};


World.prototype.populate = function() {};
World.prototype.onPauseChanged = function() {};


World.prototype.setSortBeforeDrawing = function(sortBeforeDrawing) {
  this.sortBeforeDrawing = sortBeforeDrawing;
};


World.prototype.setCollisionManager = function(collisionManager) {
  this.collisionManager = collisionManager;
};


World.prototype.getCamera = function() {
  return this.camera;
};


World.prototype.addThing = function(thing) {
  this.drawables.add(thing);
  this.things.add(thing);
};


World.prototype.addProjectile = function(projectile) {
  this.drawables.add(projectile);
  this.projectiles.add(projectile);
};


World.prototype.addEffect = function(effect) {
  this.drawables.add(effect);
  this.effects.add(effect);
};


World.prototype.draw = function() {
  if (this.sortBeforeDrawing) {
    util.array.forEach(this.drawables.elements, function(thing) {
      if (thing.isDisposed) return;
      thing.computeDistanceSquaredToCamera();
    });

    this.drawables.elements.sort(function(thingA, thingB) {
      return thingB.distanceSquaredToCamera -
          thingA.distanceSquaredToCamera;
    });
  }


  Env.gl.reset(this.backgroundColor);

  Env.gl.pushViewMatrix();

  this.applyLights();
  this.camera.transform();
  Env.gl.setViewMatrixUniforms();

  this.drawables.forEach(function(drawable) {
    drawable.draw();
  });

  Env.gl.popViewMatrix();
};


World.prototype.advance = function(dt) {
  this.updateLists();

  if (this.paused) return;

  for (var i = 0; this.things.get(i); i++) {
    if (!this.things.get(i).isDisposed) this.things.get(i).advance(dt);
  }
  for (var i = 0; this.projectiles.get(i); i++) {
    if (!this.projectiles.get(i).isDisposed) this.projectiles.get(i).advance(dt);
  }
  for (var i = 0; this.effects.get(i); i++) {
    if (!this.effects.get(i).isDisposed) this.effects.get(i).advance(dt);
  }
  if (this.collisionManager) {
    this.collisionManager.checkCollisions();
  }
};


World.prototype.addLight = function(light) {
  this.lights.push(light);
};


World.prototype.applyLights = function() {
  for (var i = 0, light; light = this.lights[i]; i++) {
    light.apply();
  }
};


World.prototype.reset = function() {
  this.things = [];
  this.effects = [];
  this.projectiles = [];

  this.populate();
};


World.prototype.updateLists = function() {
  this.things.update();
  this.effects.update();
  this.projectiles.update();
  this.drawables.update();

  while (this.disposables.length > 100) {
    this.disposables.shift().dispose();
  }
};


World.prototype.setBackgroundColor = function(color) {
  this.backgroundColor = color;
};
