goog.provide('ContainerManager');

/** @constructor @struct */
ContainerManager = function(fullscreenContainer, container) {
  this.fullscreenContainer = fullscreenContainer;
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

  this.fullscreen = false;

  this.container.focus();
};
ContainerManager.instance_ = null;

ContainerManager.initSingleton = function(fullscreenContainer, container) {
  util.assertNull(ContainerManager.instance_,
      'Cannot init ContainerManager: already init\'d');

  ContainerManager.instance_ = new ContainerManager(fullscreenContainer, container);
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
    this.fullscreenContainer.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    this.fullscreenContainer.exitFullScreen();
  }
};


ContainerManager.prototype.isFullScreen = function() {
  return this.fullscreen;
};


ContainerManager.prototype.setPointerLock = function(pointerLock) {
  if (pointerLock) {
    this.container.requestPointerLock();
  } else {
    document.exitPointerLock();
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
  this.fullscreenContainer.requestFullScreen = this.container.requestFullscreen ||
      this.container.mozRequestFullScreen ||
      this.container.webkitRequestFullscreen;

  this.fullscreenContainer.exitFullScreen = this.container.exitFullscreen ||
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
