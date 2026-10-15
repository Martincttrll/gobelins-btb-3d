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

    this.sea = this.createSea();
    this.cameraManager = this.createCameraManager();
    this.animation = this.createAnimation();
    // this.fog = this.createFog();
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

    this.background = new THREE.Color(0xd9f5ff);

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
  }

  changeState() {
    this.sea.changeSeaState();
    this.isCalm = !this.isCalm;
    if (this.isCalm) {
      this.animation.stopLightning();
      this.background = new THREE.Color(0xd9f5ff);
    } else {
      this.background = new THREE.Color(0x041824);
    }
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

    // const fogFolder = sceneFolder.addFolder({ title: "Fog" });
    // fogFolder.addBinding(this.fog, "near", { min: 0, max: 100 });
    // fogFolder.addBinding(this.fog, "far", { min: 0, max: 100 });
    // fogFolder.addBinding(this.fog, "color");

    return sceneFolder;
  }
}
