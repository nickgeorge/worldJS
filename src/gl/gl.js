goog.provide('GL');


// WebGLRenderingContext is a really obnoxiously long name.
// Here it is aliased to GL.
// I also supplement the prototype of WebGLRenderingContext directly
// to add useful functionality.
// It's a bit hacky, but I think it's cleaner to have the gl functions
// defined on the prototype itself rather than using ugly helpers.
// Fuck static helpers, and fuck wrapper classes.
GL = WebGLRenderingContext;

GL.createGL = function(canvas) {
  var gl;
  try {
    gl = canvas.getContext('experimental-webgl');
  } catch (e) {
    throw new Error('Didn\'t init GL')
  }
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  gl.modelMatrix = mat4.create();
  gl.invertedModelMatrix = mat4.create();
  gl.viewMatrix = mat4.create();
  gl.perspectiveMatrix = mat4.create();
  gl.normalMatrix = mat3.create();

  gl.modelMatrixStack = new MatrixStack();
  gl.viewMatrixStack = new MatrixStack();

  gl.canvas = canvas;

  gl.activeShaderProgram = null;

  return gl;
};


GL.createGLWithDefaultShaders = function(canvas) {
  var gl = GL.createGL(canvas);
  var shaderProgram = ShaderProgram.createProgramWithDefaultShaders(gl);
  gl.setActiveProgram(shaderProgram);
  return gl;
};


/**
 * <GL>.useShaderProgram actually makes the necessary bindings,
 * but I don't see any way to get the currently used program.
 * This 'uses' the passed in program, while also setting a local variable
 * that can be referenced.
 */
GL.prototype.setActiveProgram = function(program) {
  this.activeShaderProgram = program;
  this.useProgram(program);
};


/**
 * Gets the currently 'used' program (see <GL>.setShaderProgram).
 */
GL.prototype.getActiveProgram = function() {
  return this.activeShaderProgram;
};


GL.prototype.reset = function(backgroundColor) {
  util.assert(this.modelMatrixStack.nextIndex == 0,
      'Model matrix stack not fully unloaded');
  util.assert(this.viewMatrixStack.nextIndex == 0,
      'View matrix stack not fully unloaded');
  this.viewport(0, 0, this.viewportWidth, this.viewportHeight);
  this.clearColor(backgroundColor[0],
      backgroundColor[1],
      backgroundColor[2],
      backgroundColor[3]);
  this.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  mat4.perspective(this.perspectiveMatrix,
      Math.PI/4, this.viewportWidth/this.viewportHeight,
      .1, 10000.0);

  this.enable(GL.DEPTH_TEST);
  this.enable(GL.BLEND)
  this.enable(GL.CULL_FACE);
  this.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

  mat4.identity(this.modelMatrix);

  this.getActiveProgram().reset();
};

GL.prototype.pushModelMatrix = function() {
  this.modelMatrixStack.push(this.modelMatrix);
};

GL.prototype.popModelMatrix = function() {
  mat4.copy(this.modelMatrix, this.modelMatrixStack.pop());
};

GL.prototype.pushViewMatrix = function() {
  this.viewMatrixStack.push(this.viewMatrix);
};

GL.prototype.popViewMatrix = function() {
  mat4.copy(this.viewMatrix, this.viewMatrixStack.pop());
};

GL.prototype.setModelMatrixUniforms = function() {
  var shaderProgram = this.getActiveProgram();
  this.computeNormalMatrix();
  this.uniformMatrix4fv(shaderProgram.modelMatrixUniform, false, this.modelMatrix);
  this.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, this.normalMatrix);
};

GL.prototype.setViewMatrixUniforms = function() {
  var shaderProgram = this.getActiveProgram();
  this.uniformMatrix4fv(shaderProgram.perspectiveMatrixUniform, false, this.perspectiveMatrix);
  this.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, this.viewMatrix);
};

GL.prototype.computeNormalMatrix = function() {
  mat3.fromMat4(this.normalMatrix,
      mat4.invert(this.invertedModelMatrix, this.modelMatrix));
  mat3.transpose(this.normalMatrix, this.normalMatrix);
};

GL.prototype.rotate = function() {
  var temp = mat4.create();
  return function(rotation) {
    mat4.multiply(this.modelMatrix, this.modelMatrix,
        mat4.fromQuat(temp, rotation));
  }
}();

GL.prototype.translate = function(xyz) {
  mat4.translate(this.modelMatrix, this.modelMatrix, xyz);
};

GL.prototype.transform = function(transformation) {
  mat4.multiply(this.modelMatrix, this.modelMatrix, transformation);
};

GL.prototype.rotateView = function() {
  var temp = mat4.create();
  return function(rotation) {
    mat4.multiply(this.viewMatrix, this.viewMatrix,
        mat4.fromQuat(temp, rotation));
  }
}();

GL.prototype.translateView = function(translation) {
  mat4.translate(this.viewMatrix, this.viewMatrix,
      translation);
};

GL.prototype.updateBuffer = function(buffer, newData) {
  this.bindBuffer(GL.ARRAY_BUFFER, buffer);
  this.bufferSubData(GL.ARRAY_BUFFER, 0, new Float32Array(newData));
};

GL.prototype.generateBuffer = function(
    primitives, itemSize, opt_bufferType, opt_drawType) {
  var drawType = opt_drawType || GL.STATIC_DRAW;
  var bufferType = opt_bufferType || GL.ARRAY_BUFFER;
  var buffer = this.createBuffer();
  this.bindBuffer(bufferType, buffer);
  this.bufferData(bufferType,
      new Float32Array(primitives), drawType);
  buffer.itemSize = itemSize;
  buffer.numItems = primitives.length / itemSize;
  return buffer;
};



GL.prototype.generateIndexBuffer = function(primitives) {
  var buffer = this.createBuffer();
  this.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, buffer);
  this.bufferData(GL.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(primitives), GL.STATIC_DRAW);
  buffer.itemSize = 1;
  buffer.numItems = primitives.length;

  return buffer;
};
