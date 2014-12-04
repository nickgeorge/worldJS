goog.provide('Field');

goog.require('util');

/**
 * @constructor
 * @struct
 * @template T
 */
Field = function() {
  /**
   * @private {boolean}
   */
  this.valueSet = false;

  /** @protected {T} */
  this.value = this.getInitial();
};


/** @return {boolean} */
Field.prototype.isSet = function() {
  return this.valueSet;
};


Field.prototype.reset = function() {
  this.valueSet = false;
};


/** @protected */
Field.prototype.markAsSet = function() {
  this.valueSet = true;
};

/** @return {T} */
Field.prototype.get = function() {
  return this.value;
};


/** @return {T} */
Field.prototype.getInitial = util.unimplemented;
