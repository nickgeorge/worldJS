goog.provide('OffsetContainer');
goog.provide('OffsetBox');

goog.require('Box');
goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
OffsetContainer = function(message) {
  goog.base(this, message);
  this.thing = message.thing;

  this.addPart(this.thing);
};
goog.inherits(OffsetContainer, Thing);


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
OffsetBox = function(message) {
  goog.base(this, {
    position: vec3.nullableClone(message.position),
    name: message.name,
    parentScale: message.parentScale,
  });

  message.position = message.offset;
  message.offset = null;
  message.parentScale = this.scale;
  this.thing = new Box(message);
  this.addPart(this.thing);
};
goog.inherits(OffsetBox, Thing);
