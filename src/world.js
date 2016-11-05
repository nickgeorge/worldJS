goog.provide('World');

goog.require('Env');


/**
 * @constructor
 * @struct
 */
World = function() {
  this.lights = [];
  this.camera = null;
  this.collisionManager = new CollisionManager(this);

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

  /** @type Object.<string, ControlledList> */
  this.thingsByType = {};
};


World.prototype.populate = function() {};


/**
 * @param {boolean} isPaused
 */
World.prototype.onPauseChanged = function(isPaused) {};



World.prototype.setSortBeforeDrawing = function(sortBeforeDrawing) {
  this.sortBeforeDrawing = sortBeforeDrawing;
};


World.prototype.setCollisionManager = function(collisionManager) {
  this.collisionManager = collisionManager;
};


World.prototype.getCamera = function() {
  return this.camera;
};


World.prototype.setCamera = function(camera) {
  this.camera = camera;
};


World.prototype.addThing = function(thing) {
  this.addDrawable(thing);
  this.things.add(thing);
  this.thingsById[thing.id] = thing;

  var key = thing.getType();
  if (!this.thingsByType[key]) {
    this.thingsByType[key] = new ControlledList();
  }
  this.thingsByType[key].add(thing);
};


World.prototype.removeObject = function(thing) {
  this.removeDrawable(thing);
  // this.thingsById[thing.id] = null;

  var key = thing.getType();
  this.getThingsByType(key).remove(thing);
};


World.prototype.removeThing = function(thing) {
  this.things.remove(thing);
  this.removeObject(thing);
};


World.prototype.removeProjectile = function(thing) {
  this.projectiles.remove(thing);
  this.removeObject(thing);
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


World.prototype.getThingsByType = function(type) {
  return this.thingsByType[type] || ControlledList.EMTPY_LIST;
};


World.prototype.getThingsByClass = function(klass) {
  return this.getThingsByType(klass.getType());
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


    for (var i = 0; this.opaque[i]; i++) {
      this.opaque[i].draw();
    }
    for (var i = 0; this.transluscent[i]; i++) {
      this.transluscent[i].draw();
    }


  } else {
    for (var i = 0; this.drawables.get(i); i++) {
      this.drawables.get(i).draw();
    }
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

  util.object.forEach(this.thingsByType, function(value) {
    value.update();
  });

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
  reader.performAddRemove();
  var writablesCount = reader.readInt();
  for (var j = 0; j < writablesCount; j++) {
    var id = reader.readInt();
    var type = reader.readByte();
    var klass = Types.getConstructor(type);
    var thing = klass.newFromReader(reader).setId(id);
    if (thing.alive) this.addThing(thing);
  }
  reader.checkSync();
  this.stateSet = true;
  this.updateLists();
};


/**
 * @param {Reader} reader
 */
World.prototype.updateWorld = function(reader) {
  reader.performAddRemove();
  var writablesCount = reader.readInt();
  for (var j = 0; j < writablesCount; j++) {
    var id = reader.readInt();
    var thing = this.getThing(id);
    var type = reader.readByte();
    if (thing) {
      thing.updateFromReader(reader);
    } else {
      // Super hacky: consume proto
      var klass = Types.getConstructor(type);
      klass.newFromReader(reader);
    }
  }
  reader.checkSync();
};

World.prototype.getThing = function(id) {
  return this.thingsById[id];
};

World.prototype.hasThing = function(id) {
  return Boolean(this.thingsById[id]);
};

World.prototype.registerCollisionCondition = function(
    classA, classB, thresholdFunction, collisionFunction) {
  this.collisionManager.registerCollisionCondition(
    classA, classB, thresholdFunction, collisionFunction);
};
