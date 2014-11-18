goog.provide('Reader');

goog.require('MessageCode');


/**
 * @constructor
 * @struct
 */
Reader = function(arrayBuffer) {
  this.position = 0;
  this.buffer = arrayBuffer;
  this.view = new DataView(this.buffer);
};

Reader.prototype.readFloat32 = function() {
  var value = this.view.getFloat32(this.position);
  this.position += 4;
  return value;
};

Reader.prototype.readInt32 = function() {
  var value = this.view.getInt32(this.position);
  this.position += 4;
  return value;
};

Reader.prototype.readInt16 = function() {
  var value = this.view.getInt16(this.position);
  this.position += 2;
  return value;
};

Reader.prototype.readInt8 = function() {
  var value = this.view.getInt8(this.position);
  this.position++;
  return value;
};

Reader.prototype.readString = function() {
  var length = this.readInt32();
  var str = String.fromCharCode.apply(
      null, new Uint8Array(this.buffer, this.position, length));
  this.position += length;
  console.log(str);
  return str;
};

Reader.prototype.checkSync = function() {
  this.checkCode(MessageCode.SYNC, 'Sync');
};

Reader.prototype.checkEOM = function() {
  this.checkCode(MessageCode.EOM, 'EOM');
};

Reader.prototype.checkCode = function(code, opt_name) {
  var actual = this.readInt8();
  var name = opt_name || code;
  if (actual != code) {
    throw new Error("checkCode failled on " + name + '. Got ' + actual);
  }
};

Reader.prototype.checkIntCode = function(code, opt_name) {
  var actual = this.readInt32();
  var name = opt_name || code;
  if (actual != code) {
    throw new Error("checkCode failled on " + name + '. Got ' + actual);
  }
};


Reader.prototype.readThingMessage = function() {
  var type = this.readInt8();

  var constructor = Types.getConstructor(type);

  if (constructor) {
    return constructor.readMessage(this);
  } else {
    throw new Error("Don't recognize " + type);
  }
};


Reader.prototype.readThing = function() {
  /** @type {{klass: Function, alive: number}} */
  var message = (this.readThingMessage());
  return new message.klass(message);
};

/**
 * @param  {vec3=} opt_out Vector to populate.
 *     If null, creates a new vector.
 * @return {vec3} The read in vector.
 */
Reader.prototype.readVec3 = function(opt_out) {
  var out = opt_out || vec3.create();
  out[0] = this.readFloat32();
  out[1] = this.readFloat32();
  out[2] = this.readFloat32();
  return out;
};


/**
 * @param  {vec4=} opt_out Vector to populate.
 *     If null, creates a new vector.
 * @return {vec4} The read in vector.
 */
Reader.prototype.readVec4 = function(opt_out) {
  var out = opt_out || vec4.create();
  out[0] = this.readFloat32();
  out[1] = this.readFloat32();
  out[2] = this.readFloat32();
  out[3] = this.readFloat32();
  return out;
};

Reader.prototype.performAddRemove = function() {
  var addListCount = this.readInt32();
  for (var i = 0; i < addListCount; i++) {
    var id = this.readInt32();
    var thing = this.readThing().setId(id);
    if (!Env.world.thingsById[id] && thing.alive) {
      Env.world.addThing(thing);
    }
  }
  this.checkSync();

  var removeListCount = this.readInt32();
  for (var i = 0; i < removeListCount; i++) {
    var id = this.readInt32();
    var thing = Env.world.thingsById[id];
    if (Env.world.thingsById[id]) {
      Env.world.removeThing(thing);
    }
  }
  this.checkSync();
};
