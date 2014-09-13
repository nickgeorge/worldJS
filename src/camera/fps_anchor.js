goog.provide('FpsAnchor');

goog.require('util');


/**
 * @interface
 */
FpsAnchor = function(){};


/**
 * @param {quat} out
 * @return {quat}
 */
FpsAnchor.prototype.getViewOrientation = util.unimplemented;


/**
 * @param {vec3} out
 * @return {vec3}
 */
FpsAnchor.prototype.getEyePosition = util.unimplemented;
