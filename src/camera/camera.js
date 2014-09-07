goog.provide('Camera');


/** @interface */
Camera = function(){};

/** @return {vec3} */
Camera.prototype.getPosition = function() {};

Camera.prototype.transform = function() {};
