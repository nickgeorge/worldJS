goog.provide('Client');

goog.require('Reader');
goog.require('MessageCode');

/** @constructor */
Client = function(world, port) {
  this.world = world;
  this.host = window.location.host
  // this.host = 'www.biologicalspeculation.com';
  this.socket = new WebSocket(
    ['ws://', this.host, ':', port, '/websock'].join(''));

  this.socket.onmessage = util.bind(this.onMessage, this);
  this.socket.binaryType = 'arraybuffer';
  this.socket.onopen = util.bind(this.onOpen, this);


  window.onbeforeunload = util.bind(function() {
    this.socket.close()
  }, this);
};

// var updateRate = new Framerate();
// var t0 = 0;
Client.prototype.onMessage = function(message) {
  var reader = new Reader(message.data);

  var checkEOM = true;

  var code = reader.readInt8();
  switch(code) {
    case MessageCode.SET_STATE:
      var serverTime = reader.readInt32();
      Env.world.setState(reader);
      Env.world.stateSet = true;
      break;
    case MessageCode.UPDATE_WORLD:
      var t = new Date().getTime();
      var serverTime = reader.readInt32();
      // console.log(t % 5000 - serverTime);
      if (Env.world.stateSet) {
        Env.world.updateWorld(reader);
      } else {
        checkEOM = false;
      }
      // updateRate.snapshot();
      Env.world.draw();
      // var t1 = new Date().getTime();
      // console.log((t1 - t0) + " : " + message.data.byteLength);
      // t0 = t1;
      break;
    case MessageCode.SCORE:
      Env.world.scoreMap = Messages.readScoreMessage(reader);
      break;
    case MessageCode.NAME_MAP:
      Env.world.nameMap = Messages.readNameMapMessage(reader);
      break;
    case MessageCode.YOU_ARE:
      Env.world.hero = Env.world.getThing(reader.readInt32());
      break;
    case MessageCode.BROADCAST:
      var id = reader.readInt32();
      var messageText = reader.readString();
      var name = Env.world.nameMap[id].name;
      Env.hud.logger.log(name + ': ' + messageText);
      break;
    default:
      console.log('Unrecognized code: ' + code);
      checkEOM = false;
  }
  if (checkEOM) reader.checkEOM();
};

Client.prototype.send = function(msg) {
  this.socket.send(msg)
};

Client.prototype.sendCode = function(code) {
  this.send(new Uint8Array([code]));
};

Client.prototype.sendEOM = function() {
  this.sendCode(MessageCode.EOM);
};


// ostrich only
Client.prototype.sendMode = function(mode) {
  var ab = new ArrayBuffer(8);
  var dataView = new DataView(ab);
  dataView.setInt8(0, MessageCode.MODE);
  dataView.setInt32(1, mode);
  this.send(new Int8Array(ab));
};

Client.prototype.sendKeyEvent = function(isKeyDown, keyCode) {
  this.send(new Uint8Array(
      [MessageCode.KEY_EVENT, isKeyDown ? 1 : 0, keyCode]));
};

// quantum only
Client.prototype.sendMyScoreIs = function(score) {
  var ab = new ArrayBuffer(1 + 4);
  var dataView = new DataView(ab);
  dataView.setInt8(0, MessageCode.MY_SCORE_IS);
  dataView.setInt32(1, score);
  this.send(new Int8Array(ab));
};

Client.prototype.sendMouseMoveEvent = function(dX, dY) {
  var ab = new ArrayBuffer(3);
  var dataView = new DataView(ab);
  dataView.setInt8(0, MessageCode.MOUSE_MOVE_EVENT);
  dataView.setInt8(1, dX);
  dataView.setInt8(2, dY);
  this.send(new Int8Array(ab));
};

Client.prototype.myNameIs = function(name) {
  var writer = new Writer(1 + name.length);
  writer.writeInt8(MessageCode.MY_NAME_IS);
  writer.writeString(name);
  this.send(writer.getBytes());
};

Client.prototype.say = function(msg) {
  var writer = new Writer(1 + msg.length);
  writer.writeInt8(MessageCode.SAY);
  writer.writeString(msg);
  this.send(writer.getBytes());
};

Client.prototype.onOpen = function() {
  this.sendCode(MessageCode.JOIN);
};
