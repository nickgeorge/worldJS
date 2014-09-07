goog.provide('ControlledList');

/** @constructor @struct */
ControlledList = function() {
  this.elements = [];
  this.elementsToAdd = [];
  this.elementsToRemove = [];
};


ControlledList.prototype.get = function(i) {
  return this.elements[i];
};

ControlledList.prototype.getAll = function(i) {
  return this.elements;
};


ControlledList.prototype.add = function(element) {
  this.elementsToAdd.push(element);
};


ControlledList.prototype.remove = function(element) {
  this.elementsToRemove.push(element);
};

ControlledList.prototype.size = function() {
  return this.elements.length;
};

ControlledList.prototype.update = function() {
  util.array.pushAll(this.elements, this.elementsToAdd);
  this.elementsToAdd.length = 0;

  util.array.removeAll(this.elements, this.elementsToRemove);
  this.elementsToRemove.length = 0;
};


/**
 * @param {Function} f
 * @param {*=} opt_ctx
 */
ControlledList.prototype.forEach = function(f, opt_ctx) {
  util.array.forEach(this.elements, f, opt_ctx);
};
