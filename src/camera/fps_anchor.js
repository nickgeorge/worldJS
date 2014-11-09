goog.provide('FpsAnchor');

goog.require('util');


/**
 * @interface
 */
FpsAnchor = function(){};


/**
 * @return {quat}
 */
FpsAnchor.prototype.getViewOrientation = util.unimplemented;


/**
 * @param {vec3} out
 * @return {vec3}
 */
FpsAnchor.prototype.getEyePosition = util.unimplemented;
