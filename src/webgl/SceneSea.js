import * as THREE from "three";
import CameraManager from "./CameraManager";
import Sea from "./Sea";
import Animation from "./Animation";
import gsap from "gsap";

export default class SceneSea extends THREE.Scene {
  constructor(options = {}) {
    super();

    this.renderer = options.renderer;
    this.debugger = options.debugger;

    this.isCalm = true;

    this.params = {
      calmSkyColor: "#8dc7ff",
      stormSkyColor: "#041824",
      swellStrength: 0.08,
      swellSpeed: 1.2,
    };

    this.sea = this.createSea();
    this.cameraManager = this.createCameraManager();
    this.animation = this.createAnimation();
    this.debugFolder = this.createDebugFolder();
  }

  get camera() {
    return this.cameraManager.camera;
  }

  createCameraManager() {
    const cameraManager = new CameraManager({
      renderer: this.renderer,
      debugger: this.debugger,
      animation: this.animation,
    });

    return cameraManager;
  }

  createFog() {
    const fog = new THREE.Fog(0x000000, 10, 15);
    this.fog = fog;
    console.log(this);
    return fog;
  }

  createSea() {
    const sea = new Sea({ debugger: this.debugger });

    this.background = new THREE.Color(this.params.calmSkyColor);

    this.add(sea);
    return sea;
  }

  createAnimation() {
    const tl = new Animation({
      renderer: this.renderer,
      sea: this.sea,
      scene: this,
      cameraManager: this.cameraManager,
    });

    return tl;
  }

  update(data = {}) {
    this.sea.update({
      elapsed: data.elapsed,
    });
    this.cameraManager.update(data.elapsed);

    this.position.y =
      Math.sin(data.elapsed * this.params.swellSpeed) *
      this.params.swellStrength;

    this.sea.material.uniforms.uFogColor.value.copy(this.background);
  }

  changeState() {
    this.sea.changeSeaState();
    this.isCalm = !this.isCalm;
    if (this.isCalm) {
      this.animation.stopLightning();
      this.background = new THREE.Color(this.params.calmSkyColor);
    } else {
      this.background = new THREE.Color(this.params.stormSkyColor);
      this.params.swellStrength = 0.3;
      this.params.swellSpeed = 2.17;
    }
    this.debugger?.refresh();
  }

  resize(width, height) {
    this.cameraManager.resize(width, height);
  }

  createDebugFolder() {
    if (!this.debugger) return;

    const sceneFolder = this.debugger.addFolder({
      title: "Scene",
    });
    sceneFolder
      .addButton({ title: "change State" })
      .on("click", this.changeState.bind(this));

    const skyFolder = sceneFolder.addFolder({ title: "Sky" });
    skyFolder
      .addBinding(this.params, "calmSkyColor", { label: "calm" })
      .on("change", (e) => {
        if (this.isCalm) this.background.set(e.value);
      });
    skyFolder
      .addBinding(this.params, "stormSkyColor", { label: "storm" })
      .on("change", (e) => {
        if (!this.isCalm) this.background.set(e.value);
      });

    const fogFolder = sceneFolder.addFolder({ title: "Fog" });
    fogFolder.addBinding(this.sea.material.uniforms.uFogDensity, "value", {
      min: 0,
      max: 0.3,
      step: 0.001,
      label: "density",
    });

    const swellFolder = sceneFolder.addFolder({ title: "Swell" });
    swellFolder.addBinding(this.params, "swellStrength", {
      min: 0,
      max: 0.5,
      label: "strength",
    });
    swellFolder.addBinding(this.params, "swellSpeed", {
      min: 0,
      max: 5,
      label: "speed",
    });

    return sceneFolder;
  }
}
