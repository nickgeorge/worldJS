goog.provide('PaneOutline');

goog.require('LeafThing');


/**
 * @constructor
 * @struct
 * @extends {LeafThing}
 */
PaneOutline = function(message){
  message.elementType = GL.LINES;
  message.drawType = LeafThing.DrawType.ELEMENTS;
  goog.base(this, message);

  this.pane = message.pane;
  this.color = message.color;

  if (!PaneOutline.inited) {
    PaneOutline.init();
  }

  this.position = this.pane.position;
  this.vertexBuffer = Env.gl.generateBuffer(this.pane.verticies, 3);
  this.indexBuffer = PaneOutline.indexBuffer;
  this.normalBuffer = this.pane.normalBuffer;

};
goog.inherits(PaneOutline, LeafThing);
PaneOutline.inited = false;

PaneOutline.indexBuffer = null;

PaneOutline.init = function() {
  PaneOutline.inited = true;

  var vertexNormals = [
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
  ];
  PaneOutline.normalBuffer = Env.gl.generateBuffer(vertexNormals, 3);

  var vertexIndices = [
    0, 1,
    1, 2,
    2, 3,
    3, 0
  ];
  PaneOutline.indexBuffer = Env.gl.generateIndexBuffer(vertexIndices);
};
