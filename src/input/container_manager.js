goog.provide('ContainerManager');

/** @constructor */
ContainerManager = function(container) {
  this.container = container;
  this.keyMap = {};
  this.mouseMap = {};

  this.resolvePrefixes();

  this.container.addEventListener('keydown',
      util.bind(this.onKey, this));
  this.container.addEventListener('keyup',
      util.bind(this.onKey, this));
  this.container.addEventListener('mousedown',
      util.bind(this.onMouseButton, this));
  this.container.addEventListener('mouseup',
      util.bind(this.onMouseButton, this));

  this.container.focus();
};
ContainerManager.instance_ = null;

ContainerManager.initSingleton = function(container) {
  util.assertNull(ContainerManager.instance_,
      'Cannot init ContainerManager: already init\'d');

  ContainerManager.instance_ = new ContainerManager(container);
  return ContainerManager.instance_;
};

ContainerManager.getInstance = function() {
  return ContainerManager.instance_;
};


ContainerManager.prototype.onKey = function(event) {
  this.keyMap[event.keyCode] = event.type == 'keydown';
};


ContainerManager.prototype.onMouseButton = function(event) {
  this.keyMap[event.button] = event.type == 'mousedown';
};


ContainerManager.prototype.isKeyDown = function(key) {
  return this.keyMap[key];
};


ContainerManager.prototype.isMouseButtonDown = function(button) {
  return this.mouseMap[button];
};


ContainerManager.prototype.setFullScreen = function(fullscreen) {
  if (fullscreen) {
    this.container.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    this.container.exitFullScreen();
  }
};


ContainerManager.prototype.setPointerLock = function(pointerLock) {
  if (pointerLock) {
    this.container.requestPointerLock();
  } else {
    this.container.exitPointerLock();
  }
};


/** @suppress {missingProperties} */
ContainerManager.prototype.isPointerLocked = function() {
  return Boolean(
      document.pointerLockElement ||
      document.mozPointerLockElement ||
      document.webkitPointerLockElement);
};


/** @suppress {missingProperties} */
ContainerManager.prototype.resolvePrefixes = function() {
  this.container.requestFullScreen = this.container.requestFullscreen ||
      this.container.mozRequestFullScreen ||
      this.container.webkitRequestFullscreen;

  this.container.exitFullScreen = this.container.exitFullscreen ||
      this.container.mozCancelFullScreen ||
      this.container.webkitExitFullscreen;

  this.container.requestPointerLock = this.container.requestPointerLock ||
      this.container.mozRequestPointerLock ||
      this.container.webkitRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock ||
      document.mozExitPointerLock ||
      document.webkitExitPointerLock;

  document.fullScreenElement = document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement;
};
