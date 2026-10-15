uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform float uFogDensity;
uniform vec3 uFogColor;

varying float vElevation;
varying vec4 vGLPosition;


void main() {
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;

  vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);


// Get Fog Factor
   float depth = gl_FragCoord.z / gl_FragCoord.w;
   const float LOG2 = 1.442695;
   float fogFactor = exp2( - uFogDensity * uFogDensity * depth * depth * LOG2 );
   fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );


   // Apply fog
   vec4 fogFragColor = vec4(uFogColor, gl_FragColor.w);
  //  fragColor = mix(fragColor, fogFragColor, fogFactor);

  color = mix(color, uFogColor, fogFactor);

  gl_FragColor = vec4(color, 1.0);
  
  #include <tonemapping_fragment>
  #include <colorspace_fragment>


}