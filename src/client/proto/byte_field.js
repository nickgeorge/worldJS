goog.provide('ByteField');

goog.require('Field');

/**
 * @constructor
 * @struct
 * @extends {Field.<number>}
 */
ByteField = function() {
  goog.base(this);
};
goog.inherits(ByteField, Field);

/** @param {Reader} reader */
ByteField.prototype.read = function(reader) {
  this.value = reader.readByte();
  this.markAsSet();
};

/**
 * @override
 * @return {number}
 */
ByteField.prototype.getInitial = function() {
  return 0;
};
