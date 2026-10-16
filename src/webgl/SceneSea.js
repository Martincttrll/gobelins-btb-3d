import * as THREE from "three";
import CameraManager from "./CameraManager";
import Sea from "./Sea";
import Animation from "./Animation";
import Sky from "./Sky";
import gsap from "gsap";

export default class SceneSea extends THREE.Scene {
  constructor(options = {}) {
    super();

    this.renderer = options.renderer;
    this.debugger = options.debugger;

    this.isCalm = true;

    this.canSwim = false;
    this.drowning = {
      baseY: 0,
      offset: 0,
      velocity: 0,
      strength: 1,
    };
    this.previousElapsed = 0;

    this.params = {
      calmSkyColor: "#87ddff",
      stormSkyColor: "#041824",
      swellStrength: 0.08,
      swellSpeed: 1.2,
      sinkingForce: 1,
      swimImpulse: 2.5,
      swimDecay: 0.65,
      swimGravity: 6,
      swimDrag: 1.5,
    };

    this.sky = new Sky({ topColor: "#c3a1fb", bottomColor: "#beefff" });
    this.add(this.sky);

    this.sea = this.createSea();
    this.cameraManager = this.createCameraManager();
    this.animation = this.createAnimation();
    this.debugFolder = this.createDebugFolder();

    this.setupEventListeners();
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

    const delta = Math.min(data.elapsed - this.previousElapsed, 1 / 30);
    this.previousElapsed = data.elapsed;
    if (this.canSwim) this.updateDrowning(delta);
  }

  startDrowning() {
    this.drowning.baseY = this.camera.position.y;
    this.drowning.offset = 0;
    this.drowning.velocity = 0;
    this.drowning.strength = 1;
    this.canSwim = true;
  }

  updateDrowning(delta) {
    const d = this.drowning;

    d.velocity -= this.params.swimGravity * delta;
    d.velocity *= Math.exp(-this.params.swimDrag * delta);
    d.offset += d.velocity * delta;

    if (d.offset < 0) {
      d.offset = 0;
      d.velocity = Math.max(d.velocity, 0);
    }

    this.camera.position.y = d.baseY + d.offset;
  }

  removeSky() {
    if (!this.sky) return;
    this.remove(this.sky);
    this.sky.geometry.dispose();
    this.sky.material.dispose();
    this.sky = null;
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

  setupEventListeners() {}

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

    const swimFolder = sceneFolder.addFolder({ title: "Swim" });
    swimFolder.addBinding(this.params, "swimImpulse", {
      min: 0,
      max: 10,
      label: "impulse",
    });
    swimFolder.addBinding(this.params, "swimDecay", {
      min: 0,
      max: 1,
      label: "decay",
    });
    swimFolder.addBinding(this.params, "swimGravity", {
      min: 0,
      max: 20,
      label: "gravity",
    });
    swimFolder.addBinding(this.params, "swimDrag", {
      min: 0,
      max: 5,
      label: "drag",
    });

    return sceneFolder;
  }
}
