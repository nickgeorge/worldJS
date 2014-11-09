goog.provide('Twiddler');

goog.require('WorldInputAdapter');
goog.require('KeyCode');

/** @constructor */
Twiddler = function(obj, attr, interval) {
  this.obj = obj;
  this.attr = attr;
  this.interval = interval;

  this.inputAdapter = new WorldInputAdapter().
      setKeyHandler(this.onKey, this);
};


Twiddler.prototype.onKey = function(event) {
  if (event.type == 'keydown') {
    if (event.keyCode == KeyCode.OPEN_SQUARE_BRACKET) {
      this.obj[this.attr] -= this.interval;
    }
    if (event.keyCode == KeyCode.CLOSE_SQUARE_BRACKET) {
      this.obj[this.attr] += this.interval;
    }
  }
};




