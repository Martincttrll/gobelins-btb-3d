import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import gsap from "gsap";
import Animation from "./Animation";
export default class CameraManager {
  constructor(options = {}) {
    this.renderer = options.renderer;
    this.debugger = options.debugger;

    this.controlsEnabled = true;

    this.cameraRange = {
      vert: 0.8,
      horiz: 0.8,
    };

    this.lookAtTarget = new THREE.Vector3();
    this.lookAtCurrent = new THREE.Vector3();
    this.lookAtLerp = 0.5;

    this.camera = this.createCamera();
    this.controls = this.createControls();

    this.setupEventListeners();

    this.debugFolder = this.createDebugFolder();
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(
      45,
      this.renderWidth / this.renderHeight,
      0.1,
      500,
    );

    camera.position.set(0, 0.7, 2);
    camera.lookAt(0, 0, 0);

    return camera;
  }

  resetCameraPosition() {
    this.camera.position.set(0, 0.7, 2);
    this.camera.lookAt(0, 0, 0);
  }

  createControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    const savedPosition = JSON.parse(sessionStorage.getItem("cameraPosition"));
    const savedTarget = JSON.parse(sessionStorage.getItem("cameraTarget"));

    if (savedPosition)
      this.camera.position.set(
        savedPosition.x,
        savedPosition.y,
        savedPosition.z,
      );
    if (savedTarget)
      controls.target.set(savedTarget.x, savedTarget.y, savedTarget.z);

    controls.update();

    return controls;
  }

  update(options = {}) {
    if (!this.controlsEnabled) {
      this.camera.lookAt(0, 0, 0);
      return;
    }

    this.lookAtCurrent.lerp(this.lookAtTarget, this.lookAtLerp);
    this.camera.lookAt(this.lookAtCurrent);
  }

  resize(width, height) {
    this.renderWidth = width;
    this.renderHeight = height;

    this.camera.aspect = this.renderWidth / this.renderHeight;
    this.camera.updateProjectionMatrix();
  }

  setupEventListeners() {
    // this.controls.addEventListener(
    //   "change",
    //   this.controlsChangeHandler.bind(this),
    // );
    window.addEventListener("keyup", () => {
      console.log(this.camera);
    });

    window.addEventListener("pointermove", this.pointerMoveHandler.bind(this));
  }

  controlsChangeHandler() {
    sessionStorage.setItem(
      "cameraPosition",
      JSON.stringify(this.camera.position),
    );
    sessionStorage.setItem(
      "cameraTarget",
      JSON.stringify(this.controls.target),
    );
  }

  pointerMoveHandler(e) {
    if (!this.controlsEnabled) return;
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = (e.clientY / innerHeight) * 2 - 1;

    this.lookAtTarget.set(
      x * this.cameraRange.horiz,
      -y * this.cameraRange.vert,
      0,
    );
  }

  /**
   * Debug
   */
  createDebugFolder() {
    if (!this.debugger) return;

    const cameraChangedHandler = () => {
      this.camera.updateProjectionMatrix();
    };
    const cameraFolder = this.debugger.addFolder({ title: "Camera" });

    cameraFolder
      .addBinding(this.camera, "fov", { min: 15, max: 100 })
      .on("change", cameraChangedHandler);
    cameraFolder
      .addBinding(this.camera, "near", { min: 0.00001, max: 10 })
      .on("change", cameraChangedHandler);
    cameraFolder
      .addBinding(this.camera, "far", { min: 1, max: 1000 })
      .on("change", cameraChangedHandler);
    cameraFolder.addBinding(this.controls, "enabled").on("click", () => {
      //if enabled on vire les eyelids et on desactiv le handler cam rotation
    });
    cameraFolder.addButton({ title: "Reset Camera" }).on("click", () => {
      sessionStorage.removeItem("cameraPosition");
      sessionStorage.removeItem("cameraTarget");
      this.resetCameraPosition();
    });

    return cameraFolder;
  }
}
