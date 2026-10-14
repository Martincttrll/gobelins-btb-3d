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
        fogDensity: { value: 0.00025 },
        fogNear: { value: 1 },
        fogFar: { value: 2000 },
        fogColor: { value: /*@__PURE__*/ new THREE.Color(0xffffff) },

        uTime: { value: 0.0 },
        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },
        uDepthColor: { value: new THREE.Color("#0e3b55") },
        uSurfaceColor: {
          value: new THREE.Color("#d5d9f9"),
        },
        uColorOffset: { value: 0.25 },
        uColorMultiplier: { value: 0.15 },
        uSmallWavesElevation: { value: 0.3 },
        uSmallWavesFrequency: { value: 3.0 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 4.0 },
      },
      fragmentShader: frag,
      vertexShader: vert,
      fog: true,
    });

    return material;
  }

  createSea() {
    const geometry = new THREE.PlaneGeometry(4, 4, 512, 512);

    const mesh = new THREE.Mesh(geometry, this.material);
    this.add(mesh);

    mesh.rotation.x = -Math.PI / 2;
    mesh.position;
    return mesh;
  }

  changeSeaState() {
    this.isCalm = !this.isCalm;
    if (this.isCalm) {
      this.material.uniforms.depthColor = "#0e3b55";
      this.material.uniforms.surfaceColor = "#d5d9f9";
      this.material.uniforms.uBigWavesElevation = 0.2;
      this.material.uniforms.uBigWavesSpeed = 0.75;
      this.material.uniforms.uColorOffset = 0.25;
      this.material.uniforms.uSmallWavesElevation = 0.15;
      this.material.uniforms.uSmallWavesFrequency = 2;
      this.material.uniforms.uSmallWavesSpeed = 0.6;
      this.material.uniforms.uSmallIterations = 4;
    } else {
      this.material.uniforms.depthColor = "#1281c1";
      this.material.uniforms.surfaceColor = "#83b0ed";
      //   this.material.uniforms.uBigWavesElevation = 0.2;
      //   this.material.uniforms.uBigWavesSpeed = 0.6;
      //   this.material.uniforms.uColorOffset = 0.1;
      //   this.material.uniforms.uSmallWavesElevation = 0.1;
      //   this.material.uniforms.uSmallWavesFrequency = 1.25;
      //   this.material.uniforms.uSmallWavesSpeed = 0.2;
      //   this.material.uniforms.uSmallIterations = 2.8;
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

    folder
      .addButton({ title: "change Sea State" })
      .on("click", this.changeSeaState.bind(this));

    return folder;
  }
}
