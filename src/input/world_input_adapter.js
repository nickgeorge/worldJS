goog.provide('WorldInputAdapter');
goog.require('Animator');

/** @constructor @struct */
WorldInputAdapter = function() {
  this.onMouseMove = util.fn.noOp;
  this.onKey = util.fn.noOp;
  this.onMouseButton = util.fn.noOp;
  this.onPointerLockChange = util.fn.noOp;

  this.attachEvents();
};


WorldInputAdapter.prototype.isKeyDown = function(keycode) {
  return ContainerManager.getInstance().isKeyDown(keycode);
};


WorldInputAdapter.prototype.isMouseButtonDown = function(mouseButton) {
  return ContainerManager.getInstance().isMouseButtonDown(mouseButton);
};


WorldInputAdapter.prototype.isPointerLocked = function() {
  return ContainerManager.getInstance().isPointerLocked();
};


WorldInputAdapter.prototype.setKeyHandler = function(handler, opt_context) {
  this.onKey = util.bind(handler, opt_context);
  return this;
};


WorldInputAdapter.prototype.setMouseButtonHandler = function(handler, opt_context) {
  this.onMouseButton = util.bind(handler, opt_context);
  return this;
};


WorldInputAdapter.prototype.setMouseMoveHandler = function(handler, opt_context) {
  this.onMouseMove = util.bind(handler, opt_context);
  return this;
};


WorldInputAdapter.prototype.setPointerLockChangeHandler = function(handler, opt_context) {
  this.onPointerLockChange = util.bind(handler, opt_context);
  return this;
};


WorldInputAdapter.prototype.onKeyInternal_ = function(event) {
  this.onKey(event);
};


WorldInputAdapter.prototype.onMouseButtonInternal_ = function(event) {
  this.onMouseButton(event);
};


WorldInputAdapter.prototype.onMouseMoveInternal_ = function(event) {
  this.onMouseMove(event);
};


WorldInputAdapter.prototype.onPointerLockChangeInternal_  = function(event) {
  this.onPointerLockChange(event);
};


/** @suppress {missingProperties} */
WorldInputAdapter.prototype.getMovementX = function(event) {
  return event.movementX ||
      event.mozMovementX ||
      event.webkitMovementX ||
      0;
};


/** @suppress {missingProperties} */
WorldInputAdapter.prototype.getMovementY = function(event) {
  return event.movementY ||
      event.mozMovementY ||
      event.webkitMovementY ||
      0;
};


WorldInputAdapter.prototype.attachEvents = function() {
  var container = ContainerManager.getInstance().container;

  container.addEventListener('keydown',
      util.bind(this.onKeyInternal_, this), true);
  container.addEventListener('keyup',
      util.bind(this.onKeyInternal_, this), true);
  container.addEventListener('mousedown',
      util.bind(this.onMouseButtonInternal_, this), true);
  container.addEventListener('mouseup',
      util.bind(this.onMouseButtonInternal_, this), true);
  document.addEventListener('mousemove',
      util.bind(this.onMouseMoveInternal_, this), false);


  document.addEventListener('pointerlockchange',
      util.bind(this.onPointerLockChangeInternal_, this));
  document.addEventListener('mozpointerlockchange',
      util.bind(this.onPointerLockChangeInternal_, this));
  document.addEventListener('webkitpointerlockchange',
      util.bind(this.onPointerLockChangeInternal_, this));
};

