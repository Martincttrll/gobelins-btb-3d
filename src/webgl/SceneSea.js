import * as THREE from "three";
import CameraManager from "./CameraManager";
import Sea from "./Sea";

export default class SceneSea extends THREE.Scene {
  constructor(options = {}) {
    super();

    this.renderer = options.renderer;
    this.debugger = options.debugger;

    this.isCalm = true;

    this.cameraManager = this.createCameraManager();
    // this.fog = this.createFog();
    this.debugFolder = this.createDebugFolder();
    this.sea = this.createSea();
  }

  get camera() {
    return this.cameraManager.camera;
  }

  createCameraManager() {
    const cameraManager = new CameraManager({
      renderer: this.renderer,
      debugger: this.debugger,
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

    this.add(sea);
    return sea;
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
      this.renderer.setClearColor(0xd9f5ff);
    } else {
      this.renderer.setClearColor(0x000000);
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
