goog.provide('Vec3Field');

goog.require('Field');

/**
 * @constructor
 * @struct
 * @extends {Field.<vec3>}
 */
Vec3Field = function() {
  goog.base(this);
};
goog.inherits(Vec3Field, Field);


/** @param {Reader} reader */
Vec3Field.prototype.read = function(reader) {
  this.markAsSet();
  this.value = reader.readVec3();
};


/**
 * @override
 * @return {vec3}
 */
Vec3Field.prototype.getInitial = function() {
  return vec3.create();
};


/**
 * Copies the value of this field into a target proto,
 * iff the field is marked set.
 * @param  {vec3} target
 */
Vec3Field.prototype.copyIfSet = function(target) {
  if (this.isSet()) {
    vec3.copy(target, this.get());
  }
};
