goog.provide('HUD');
goog.provide('Fraps');
goog.provide('Crosshair');
goog.provide('Logger');
goog.provide('StartButton');
goog.provide('Widget');

goog.require('util');
goog.require('Animator');

/** @constructor */
HUD = function(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.isRendering = true;

  this.widgets = [];
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

/** @constructor */
Widget = function(x, y, font, fillStyle) {
  this.context = null;
  this.x = x;
  this.y = y;
  this.position = null;
  this.font = font;
  this.fillStyle = fillStyle;
};

Widget.prototype.resize = function() {
  this.position = [
    this.x > 0 ? this.x : this.context.canvas.width + this.x,
    this.y > 0 ? this.y : this.context.canvas.height + this.y
  ];
};

Widget.prototype.setFont = function(opt_font, opt_fillStyle) {
  this.context.font = opt_font || this.font;
  this.context.fillStyle = opt_fillStyle || this.fillStyle;
};

/** @constructor */
Fraps = function(x, y) {
  goog.base(this, x, y, 'bold 16px courier');
};
goog.inherits(Fraps, Widget);

Fraps.prototype.render = function() {
  var animator = Animator.getInstance();
  var fraps = Animator.getInstance().getRollingAverageFramerate();
  this.setFont(null, fraps < 45 ? '#F00' : '#0F0');
  this.context.fillText('FPS: ' + fraps,
      this.position[0], this.position[1]);
};

/** @constructor */
Crosshair = function() {
  goog.base(this);
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

/** @constructor */
Logger = function(x, y) {
  goog.base(this, x, y, 'bold 20px courier', '#0F0');

  this.activeLines = 0;
  this.maxLinesToShow = 3;
  this.index = 0;
  this.lines = [];
};
goog.inherits(Logger, Widget);

Logger.prototype.log = function(line) {
  this.lines.push(line);
  this.activeLines = Math.min(this.maxLinesToShow, this.activeLines + 1);
  setTimeout(util.bind(this.fade, this), 5000);
};

Logger.prototype.fade = function() {
  this.activeLines = Math.max(0, this.activeLines - 1);
};

Logger.prototype.render = function() {
  if (!this.activeLines) return;
  this.setFont();
  var length = this.lines.length;

  this.context.fillText(this.lines[length - 1],
      this.position[0], this.position[1]);
  this.setFont('16px courier', '#AAA');
  for (var i = 1; i < this.activeLines && i < this.maxLinesToShow; i++) {
    var line = this.lines[length - i - 1];
    if (!line) return;
    this.context.fillText(line,
        this.position[0], this.position[1] + 25*(i));
  }
};

/** @constructor */
StartButton = function() {
  goog.base(this, 0, 0, '56px wolfenstein', '#FFF')
};
goog.inherits(StartButton, Widget);


StartButton.prototype.render = function() {
  if (!Animator.getInstance().isPaused()) return;
  this.setFont();
  this.context.fillText('Klicken f' + String.fromCharCode(252) + 'r St' + String.fromCharCode(228) + 'rten',
      this.context.canvas.width/2 - 200, this.context.canvas.height/2 - 25);
};

