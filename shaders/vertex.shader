precision highp float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uPerspectiveMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 uEyeLocation;
uniform vec3 uScale;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying vec3 vEyeDirection;

void main(void) {
  vPosition = uModelMatrix * vec4(uScale * aVertexPosition, 1.0);
  
  gl_Position = uPerspectiveMatrix * uViewMatrix * vPosition;
  vTextureCoord = aTextureCoord;
  vTransformedNormal = uNormalMatrix * aVertexNormal;
  vEyeDirection = normalize(uEyeLocation - vPosition.xyz);
}