import * as THREE from "three";
import frag from "../shaders/sea/fragment.glsl";
import vert from "../shaders/sea/vertex.glsl";

export default class Sea extends THREE.Object3D {
  constructor(options = {}) {
    super();
    this.debugger = options.debugger;

    this.isCalm = true;

    this.params = {
      depthColor: this.isCalm ? "#0e3b55" : "#1281c1",
      surfaceColor: this.isCalm ? "#d5d9f9" : "#83b0ed",
      uBigWavesElevation: this.isCalm ? 0.2 : 0.2,
      uBigWavesFrequency: this.isCalm
        ? new THREE.Vector2(4, 1.5)
        : new THREE.Vector2(4, 1.5),
      uBigWavesSpeed: this.isCalm ? 0.75 : 0.6,
      uColorOffset: this.isCalm ? 0.25 : 0.1,
      uSmallWavesElevation: this.isCalm ? 0.15 : 0.1,
      uSmallWavesFrequency: this.isCalm ? 3 : 1.25,
      uSmallWavesSpeed: this.isCalm ? 0.2 : 0.2,
      uSmallIterations: this.isCalm ? 4 : 2.8,
    };

    this.material = this.createSeaMaterial();
    this.sea = this.createSea();
    this.folder = this.createDebugFolder();
  }

  createSeaMaterial() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uBigWavesElevation: { value: 0.03 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.6 },
        uDepthColor: { value: new THREE.Color("#5ea6d0") },
        uSurfaceColor: {
          value: new THREE.Color("#ffffff"),
        },
        uColorOffset: { value: 0.1 },
        uColorMultiplier: { value: 1.8 },
        uSmallWavesElevation: { value: 0.1 },
        uSmallWavesFrequency: { value: 1.25 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 2.8 },

        uFogDensity: { value: 0.03 },
        uFogColor: { value: new THREE.Color("#d9f5ff") },
      },
      fragmentShader: frag,
      vertexShader: vert,
      fog: true,
    });

    material.side = THREE.DoubleSide;

    return material;
  }

  createSea() {
    const geometry = new THREE.PlaneGeometry(150, 150, 512, 512);

    const mesh = new THREE.Mesh(geometry, this.material);
    this.add(mesh);

    mesh.rotation.x = -Math.PI / 2;
    mesh.position;
    return mesh;
  }

  changeSeaState() {
    this.isCalm = !this.isCalm;
    if (this.isCalm) {
      this.material.uniforms.uDepthColor.value.set("#1281c1");
      this.material.uniforms.uSurfaceColor.value.set("#ffffff");
      this.material.uniforms.uBigWavesElevation.value = 0.03;
      this.material.uniforms.uBigWavesSpeed.value = 0.6;
      this.material.uniforms.uColorMultiplier.value = 1.8;
      this.material.uniforms.uColorOffset.value = 0.1;
      this.material.uniforms.uSmallWavesElevation.value = 0.1;
      this.material.uniforms.uSmallWavesFrequency.value = 1.25;
      this.material.uniforms.uSmallWavesSpeed.value = 0.2;
      this.material.uniforms.uSmallIterations.value = 2.8;
    } else {
      this.material.uniforms.uDepthColor.value.set("#0e3b55");
      this.material.uniforms.uSurfaceColor.value.set("#d5d9f9");
      this.material.uniforms.uBigWavesElevation.value = 0.2;
      this.material.uniforms.uBigWavesSpeed.value = 0.75;
      this.material.uniforms.uColorMultiplier.value = 0.29;
      this.material.uniforms.uColorOffset.value = 0.1;
      this.material.uniforms.uSmallWavesElevation.value = 0.3;
      this.material.uniforms.uSmallWavesFrequency.value = 2;
      this.material.uniforms.uSmallWavesSpeed.value = 0.6;
      this.material.uniforms.uSmallIterations.value = 2.3;
    }
  }

  update(data = {}) {
    this.material.uniforms.uTime.value = data.elapsed;
  }

  createDebugFolder() {
    if (!this.debugger) return;
    const folder = this.debugger.addFolder({ title: "Sea", expanded: false });
    folder.addBinding(this.material.uniforms.uBigWavesElevation, "value", {
      min: 0,
      max: 1,
      label: "uBigWavesElevation",
    });
    folder.addBinding(this.material.uniforms.uBigWavesFrequency, "value", {
      min: 0,
      max: 10,
      label: "uBigWavesFrequency",
    });
    folder.addBinding(this.material.uniforms.uBigWavesSpeed, "value", {
      min: 0,
      max: 5,
      label: "uBigWavesSpeed",
    });
    folder
      .addBinding(this.params, "depthColor")
      .on("change", (e) =>
        this.material.uniforms.uDepthColor.value.set(e.value),
      );
    folder
      .addBinding(this.params, "surfaceColor")
      .on("change", (e) =>
        this.material.uniforms.uSurfaceColor.value.set(e.value),
      );
    folder.addBinding(this.material.uniforms.uColorMultiplier, "value", {
      min: 0,
      max: 3,
      label: "uColorMultiplier",
    });
    folder.addBinding(this.material.uniforms.uColorOffset, "value", {
      min: 0,
      max: 10,
      label: "uColorOffset",
    });
    folder.addBinding(this.material.uniforms.uSmallWavesElevation, "value", {
      min: 0,
      max: 1,
      label: "uSmallWavesElevation",
    });
    folder.addBinding(this.material.uniforms.uSmallWavesFrequency, "value", {
      min: 0,
      max: 3,
      label: "uSmallWavesFrequency",
    });
    folder.addBinding(this.material.uniforms.uSmallWavesSpeed, "value", {
      min: 0,
      max: 4,
      label: "uSmallWavesSpeed",
    });
    folder.addBinding(this.material.uniforms.uSmallIterations, "value", {
      min: 0,
      max: 5,
      label: "uSmallIterations",
    });
    folder.addBinding(this.material.uniforms.uFogDensity, "value", {
      min: 0,
      max: 1,
      label: "uFogDensity",
    });

    return folder;
  }
}
