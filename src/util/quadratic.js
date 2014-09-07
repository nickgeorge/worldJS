goog.provide('Quadratic');


/** @constructor @struct */
Quadratic = function(a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.discriminant = b*b - 4*a*c;
};


Quadratic.prototype.valueAt = function(t) {
  return this.a*t*t + this.b*t + this.c;
};


Quadratic.prototype.rootCount = function() {
  if (this.discriminant > 0) return 2;
  if (this.discriminant == 0) return 1;
  return 0;
};


/** returns the lower root */
Quadratic.prototype.firstRoot = function() {
  return (-this.b - Math.sqrt(this.discriminant)) / (2*this.a);
};


Quadratic.prototype.minT = function() {
  return -this.b / (2*this.a);
};

Quadratic.prototype.minValue = function() {
  return this.valueAt(this.minT());
};

Quadratic.newLineToOriginQuadratic = function(p_0, delta, opt_offset) {
  var a = 0, b = 0, c = 0;

  for (var i = 0; i < 3; i++) {
    a += util.math.sqr(delta[i]);
    b += 2 * delta[i] * (p_0[i]);
    c += util.math.sqr(p_0[i]);
  }
  c -= util.math.sqr(opt_offset || 0);

  return new Quadratic(a, b, c);
};

Quadratic.newLineToPointQuadratic = function(p_0, delta, p, opt_offset) {
  var a = 0, b = 0, c = 0;

  for (var i = 0; i < 3; i++) {
    a += util.math.sqr(delta[i] - p[i]);
    b += 2 * (delta[i] - p[i]) * (p_0[i]);
    c += util.math.sqr(p_0[i]);
  }
  c -= util.math.sqr(opt_offset || 0);

  return new Quadratic(a, b, c);
};

Quadratic.inFrame = function(t) {
  return t >= 0 && t <= 1;
};
