import * as THREE from "three";

export default class Sky extends THREE.Mesh {
  constructor(options = {}) {
    const geometry = new THREE.SphereGeometry(options.radius ?? 100, 32, 16);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true,
      uniforms: {
        uTopColor: { value: new THREE.Color(options.topColor ?? "#3a8ee6") },
        uBottomColor: {
          value: new THREE.Color(options.bottomColor ?? "#d9f5ff"),
        },
      },
      vertexShader: `
        varying vec3 vPosition;

        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uBottomColor;
        varying vec3 vPosition;

        void main() {
          float h = clamp(normalize(vPosition).y, 0.0, 1.0);
          gl_FragColor = vec4(mix(uBottomColor, uTopColor, h), 1.0);
        }
      `,
    });

    super(geometry, material);
  }
}
