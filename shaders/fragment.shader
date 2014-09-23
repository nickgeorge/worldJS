precision highp float;

uniform mat4 uViewMatrix;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying vec3 vEyeDirection;

uniform bool uUseLighting;
uniform bool uUseTexture;

uniform vec3 uPointLightingLocation;
uniform vec4 uColor;
uniform vec3 uAmbientColor;
uniform vec3 uPointLightingColor;

uniform sampler2D uSampler;

void main(void) {
  vec3 lightWeighting;
  if (!uUseLighting) {
    lightWeighting = vec3(1.0, 1.0, 1.0);
  } else {
    vec3 relativeLightPosition = uPointLightingLocation - vPosition.xyz;
    vec3 lightDirection = normalize(relativeLightPosition);
    vec3 normal = vTransformedNormal;
    vec3 reflectionDirection = reflect(-lightDirection, normal);

    float directionalLightWeighting = max(0.0, dot(normal, lightDirection));

    float specularLightWeighting = 0.0;
    if (directionalLightWeighting > 0.0) {
      specularLightWeighting = pow(
          max(0.0, dot(reflectionDirection, vEyeDirection)), 8.0);
    }
    // TODO: Maybe need different dropoff factors for diffuse/specular
    // Right now specular dropoff only factors light -> thing distance, not
    // thing -> eye.  Think about this some more.
    float distance = length(relativeLightPosition);
    float distanceDropoff = 1.0 - distance*distance/100625.0;

    lightWeighting = uAmbientColor +
        uPointLightingColor * specularLightWeighting * distanceDropoff +
        uPointLightingColor * directionalLightWeighting * distanceDropoff;
  }

  vec4 fragmentColor;
  if (uUseTexture) {
    fragmentColor = texture2D(uSampler, vTextureCoord) * uColor;
  } else {
    fragmentColor = uColor;
  }
  gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
}
