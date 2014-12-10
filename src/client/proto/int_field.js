goog.provide('IntField');

goog.require('Field');

/**
 * @constructor
 * @struct
 * @extends {Field.<number>}
 */
IntField = function() {
  goog.base(this);
};
goog.inherits(IntField, Field);

/** @param {Reader} reader */
IntField.prototype.read = function(reader) {
  this.value = reader.readInt();
  this.markAsSet();
};

/**
 * @override
 * @return {number}
 */
IntField.prototype.getInitial = function() {
  return 0;
};
