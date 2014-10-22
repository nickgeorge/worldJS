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


ControlledList.prototype.sort = function(sortFunction) {
  this.elements.sort(sortFunction);
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
 * @param {ControlledList} otherList
 * @param {Function} f
 * @param {*=} opt_ctx
 */
ControlledList.prototype.forEachCross = function(
    otherList, f, opt_ctx) {
  this.forEach(function(element) {
    otherList.forEach(function(otherElement) {
      f.call(opt_ctx, element, otherElement);
    }, opt_ctx);
  }, opt_ctx);
};


/**
 * @param {Function} f
 * @param {*=} opt_ctx
 */
ControlledList.prototype.forEach = function(f, opt_ctx) {
  util.array.forEach(this.elements, f, opt_ctx);
};
