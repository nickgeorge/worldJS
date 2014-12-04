goog.provide('FloatField');

goog.require('Field');

/**
 * @constructor
 * @struct
 * @extends {Field.<number>}
 */
FloatField = function() {
  goog.base(this);
};
goog.inherits(FloatField, Field);

/** @param {Reader} reader */
FloatField.prototype.read = function(reader) {
  this.markAsSet();
  this.value = reader.readFloat();
};

/**
 * @override
 * @return {number}
 */
FloatField.prototype.getInitial = function() {
  return 0;
};

