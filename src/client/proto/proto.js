goog.provide('Proto');

goog.require('util');

/**
 * @constructor
 * @struct
 */
var Proto = function() {
  this.fields = {}
};


Proto.EOM = 127;


Proto.prototype.read = function(reader) {
  while (true) {
    var index = reader.readByte();
    if (index == Proto.EOM) return;
    this.fields[index].read(reader)
  }
};

/**
 * @param {number} index
 * @param {T} field
 * @return {T}
 * @template T
 */
Proto.prototype.addField = function(index, field) {
  this.fields[index] = field;
  return field;
};
