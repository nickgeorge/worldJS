goog.provide('HUD');
goog.provide('Fraps');
goog.provide('Crosshair');
goog.provide('Logger');
goog.provide('StartButton');
goog.provide('Widget');
goog.provide('UpdatingWriter');

goog.require('util');
goog.require('Animator');

/** @constructor @struct */
HUD = function(canvas) {
  this.widgets = [];
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.isRendering = true;
  this.logger = new Logger(10, 300);
  this.addWidget(this.logger);

};

HUD.prototype.render = function() {
  if (this.isRendering) {
    this.clear();
    util.array.forEach(this.widgets, function(widget) {
      widget.render();
    });
  }
};

HUD.prototype.addWidget = function(widget) {
  this.widgets.push(widget);
  widget.context = this.context;
  widget.resize();
  return this;
};

HUD.prototype.resize = function() {
  util.array.forEach(this.widgets, function(widget) {
    widget.resize();
  });
};

HUD.prototype.clear = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

/** @constructor @struct */
Widget = function(x, y) {
  this.context = null;
  this.x = x;
  this.y = y;
  this.position = null;
  this.font = null;
  this.fillStyle = null;
};

Widget.prototype.resize = function() {
  this.position = [
    this.x > 0 ? this.x : this.context.canvas.width + this.x,
    this.y > 0 ? this.y : this.context.canvas.height + this.y
  ];
};


Widget.prototype.setFont = function(font) {
  this.context.font = font;
};


Widget.prototype.setFillStyle = function(fillStyle) {
  this.context.fillStyle = fillStyle;
};


/**
 * @constructor
 * @extends {Widget}
 */
Fraps = function(x, y) {
  goog.base(this, x, y);
};
goog.inherits(Fraps, Widget);

Fraps.prototype.render = function() {
  var animator = Animator.getInstance();
  var fraps = Animator.getInstance().getRollingAverageFramerate();
  this.setFillStyle(fraps < 45 ? '#F00' : '#0F0');
  this.setFont('bold 16px courier');
  this.context.fillText('FPS: ' + fraps,
      this.position[0], this.position[1]);
};

/**
 * @constructor
 * @extends {Widget}
 */
Crosshair = function() {
  goog.base(this, 0, 0);
};
goog.inherits(Crosshair, Widget);

Crosshair.prototype.resize = function() {
  this.position = [
    this.context.canvas.width / 2,
    this.context.canvas.height / 2
  ];
};

Crosshair.prototype.render = function() {
  if (Animator.getInstance().isPaused()) return;
  this.context.strokeStyle = '#ff0000';
  this.context.translate(this.position[0], this.position[1]);
  this.context.beginPath();
  this.context.moveTo(-10,  0);
  this.context.lineTo(10, 0);
  this.context.stroke();
  this.context.beginPath();
  this.context.moveTo(0, -10);
  this.context.lineTo(0, 10);
  this.context.stroke();
  this.context.translate(-this.position[0], -this.position[1]);
};

/**
 * @constructor
 * @extends {Widget}
 */
Logger = function(x, y) {
  goog.base(this, x, y);

  this.activeLines = 0;
  this.maxLinesToShow = 6;
  this.index = 0;
  this.lines = [];
  this.timeout = null;
};
goog.inherits(Logger, Widget);


Logger.prototype.log = function(line) {
  this.lines.push(line);
  this.activeLines = Math.min(this.maxLinesToShow, this.activeLines + 1);
  clearTimeout(this.timeout);
  this.timeout = setTimeout(util.bind(this.fade, this), 5000);
};


Logger.prototype.fade = function() {
  this.activeLines = Math.max(0, this.activeLines - 1);
  if (this.activeLines > 0) setTimeout(util.bind(this.fade, this), 5000);
};


Logger.prototype.render = function() {
  if (!this.activeLines) return;
  var length = this.lines.length;
  this.setFillStyle('#CCC');
  this.setFont('14px courier');
  for (var i = 0; i < this.activeLines && i < this.maxLinesToShow; i++) {
    var line = this.lines[length - i - 1];
    if (!line) return;
    this.context.fillText(line,
        this.position[0], this.position[1] - 25*(i));
  }
};


/**
 * @constructor
 * @extends {Widget}
 */
StartButton = function() {
  goog.base(this, 0, 0)
};
goog.inherits(StartButton, Widget);


StartButton.prototype.render = function() {
  if (!Animator.getInstance().isPaused()) return;
  this.setFont('56px wolfenstein');
  this.setFillStyle('#FFF');
  this.context.fillText('Klicken f' + String.fromCharCode(252) + 'r St' + String.fromCharCode(228) + 'rten',
      this.context.canvas.width/2 - 200, this.context.canvas.height/2 - 25);
};


/**
 * @constructor
 * @extends {Widget}
 */
UpdatingWriter = function(x, y, textFunction) {
  goog.base(this, x, y);
  this.textFunction = textFunction;

  this.font = 'bold 28px courier';
  this.fillStyle = '#00F';
};
goog.inherits(UpdatingWriter, Widget);


UpdatingWriter.prototype.render = function() {
  this.setFont(this.font);
  this.setFillStyle(this.fillStyle);
  this.context.fillText(this.textFunction(),
      this.position[0], this.position[1]);
};


