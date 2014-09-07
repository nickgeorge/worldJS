goog.provide('MatrixStack');


/** @constructor @struct */
MatrixStack = function() {
  this.stack = [];
  this.nextIndex = 0;
};


MatrixStack.prototype.push = function(newMatrix) {
  if (!this.stack[this.nextIndex]) {
    this.stack.push(mat4.clone(newMatrix));
  } else {
    mat4.copy(this.stack[this.nextIndex], newMatrix);
  }
  this.nextIndex++;
};


MatrixStack.prototype.pop = function() {
  this.nextIndex--;
  if (this.nextIndex == -1) {
    throw new Error('Invalid matrix pop!');
  }
  return this.stack[this.nextIndex];
};
