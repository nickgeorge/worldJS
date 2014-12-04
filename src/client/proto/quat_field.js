goog.provide('QuatField');

goog.require('Field');

/**
 * @constructor
 * @struct
 * @extends {Field.<quat>}
 */
QuatField = function() {
  goog.base(this);
};
goog.inherits(QuatField, Field);


/** @param {Reader} reader */
QuatField.prototype.read = function(reader) {
  this.markAsSet();
  this.value = reader.readVec4();
};


/**
 * @override
 * @return {quat}
 */
QuatField.prototype.getInitial = function() {
  return quat.create();
};

