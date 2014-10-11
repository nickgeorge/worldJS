goog.provide('Writer');

/**
 * @constructor
 * @struct
 */
Writer = function(length) {
  this.offset = 0;
  this.buffer = new ArrayBuffer(length);
  this.byteView = new DataView(this.buffer);
};

Writer.prototype.writeInt8 = function(n) {
  this.byteView.setInt8(this.offset, n);
  this.offset++;
};

Writer.prototype.writeInt16 = function(n) {
  this.byteView.setInt16(this.offset, n);
  this.offset += 2;
};


Writer.prototype.writeString = function(str) {
  for (var i = 0, length = str.length; i < length; i++) {
    this.writeInt8(str.charCodeAt(i));
  }
};


Writer.prototype.getBytes = function() {
  return new Int8Array(this.buffer);
};

