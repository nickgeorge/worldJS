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

  this.age = 0;

  this.drawables = new ControlledList();
  this.transluscent = [];
  this.opaque = [];

  this.things = new ControlledList();
  this.projectiles = new ControlledList();
  this.effects = new ControlledList();
  this.disposables =  [];

  this.backgroundColor = [1, 1, 1, 1];

  this.sortBeforeDrawing = true;
  this.paused = false;

  // clientworld only.
  this.thingsById = {};
  this.stateSet = false;
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
  this.addDrawable(thing);
  this.things.add(thing);
  this.thingsById[thing.id] = thing;
};


World.prototype.removeThing = function(thing) {
  this.removeDrawable(thing);
  this.things.remove(thing);
  this.thingsById[thing.id] = null;
};


World.prototype.addProjectile = function(projectile) {
  this.addDrawable(projectile);
  this.projectiles.add(projectile);
};


World.prototype.addEffect = function(effect) {
  this.addDrawable(effect);
  this.effects.add(effect);
};


World.prototype.addDrawable = function(drawable) {
  this.drawables.add(drawable);
};


World.prototype.removeDrawable = function(drawable) {
  this.drawables.remove(drawable);
};


World.prototype.draw = function() {
  Env.gl.reset(this.backgroundColor);

  Env.gl.pushViewMatrix();

  this.applyLights();
  this.camera.transform();
  Env.gl.setViewMatrixUniforms();

  if (this.sortBeforeDrawing) {
    var cameraPosition = this.camera.getPosition();

    this.transluscent.length = 0;
    this.opaque.length = 0;

    this.drawables.forEach(function(drawable) {
      if (drawable.isDisposed) return;
      drawable.computeDistanceSquaredToCamera(cameraPosition);
      if (drawable.transluscent) {
        this.transluscent.push(drawable);
      } else {
        this.opaque.push(drawable);
      }
    }, this);

    this.opaque.sort(function(thingA, thingB) {
      return thingA.distanceSquaredToCamera -
          thingB.distanceSquaredToCamera;
    });

    this.transluscent.sort(function(thingA, thingB) {
      return thingB.distanceSquaredToCamera -
          thingA.distanceSquaredToCamera;
    });

    util.array.forEach(this.opaque, function(opaqueDrawable) {
      opaqueDrawable.draw();
    });

    util.array.forEach(this.transluscent, function(transluscentDrawable) {
      transluscentDrawable.draw();
    });
  } else {
    this.drawables.forEach(function(drawable) {
      drawable.draw();
    });
  }

  Env.gl.popViewMatrix();
};


World.prototype.advance = function(dt) {
  this.advanceBasics(dt);
};


World.prototype.advanceBasics = function(dt) {
  this.age += dt;
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


/**
 * @param {Reader} reader
 */
World.prototype.setState = function(reader) {
  for (var i = 0; i < 3; i++) {
    reader.performAddRemove();
    var writablesCount = reader.readInt32();
    // console.log('Count: ' + writablesCount);
    for (var j = 0; j < writablesCount; j++) {
      var id = reader.readInt32();
      var thing = reader.readThing().setId(id);
      if (thing.alive) this.addThing(thing);
    }
    reader.checkSync();


    reader.checkSync();
  }
  this.stateSet = true;
};


/**
 * @param {Reader} reader
 */
World.prototype.updateWorld = function(reader) {
  for (var i = 0; i < 3; i++) {
    reader.performAddRemove();
    var writablesCount = reader.readInt32();
    for (var j = 0; j < writablesCount; j++) {
      var id = reader.readInt32();
      var message = reader.readThingMessage();
      var thing = this.getThing(id);
      if (thing) thing.update(message);
      else {
      }
    }
    reader.checkSync();


    reader.checkSync();
  }
};

World.prototype.getThing = function(id) {
  return this.thingsById[id];
};
