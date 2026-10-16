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
      vert: 0.4,
      horiz: 0.4,
      globalAmplitude: 1,
    };

    this.canSwim = false;

    this.swimFactor = 1.3;
    this.swimCount = 0;
    this.swimTimeout = false;
    this.swimCooldown = 1100;
    this.swimSurfaceLimit = -0.5;

    this.lookAtTarget = new THREE.Vector3();
    this.lookAtCurrent = new THREE.Vector3();
    this.lookAtLerp = 0.05;

    this.container = new THREE.Object3D();
    this.camera = this.createCamera();
    this.container.add(this.camera);

    // this.controls = this.createControls();

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

    this.container.add(camera);

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
  swimUp(e) {
    if (e.code !== "Space" || e.repeat) return;
    if (this.swimCount >= 3) return;
    if (!this.canSwim || this.swimFactor <= 0) return;
    if (this.swimTimeout) return;

    e.preventDefault();

    const worldY = this.container.position.y + this.camera.position.y;
    const distance = Math.min(
      1 * this.swimFactor,
      this.swimSurfaceLimit - worldY,
    );
    if (distance <= 0) return;

    const startY = this.container.position.y;

    this.swimTl?.kill();
    this.swimTl = gsap
      .timeline()
      .to(this.container.position, {
        y: startY - distance * 0.1,
        duration: 0.2,
        ease: "sine.inOut",
      })
      .to(this.container.position, {
        y: startY + distance,
        duration: 0.7,
        ease: "power3.out",
      })
      .to(this.container.position, {
        y: startY + distance * 0.85,
        duration: 0.6,
        ease: "sine.inOut",
      });

    this.swimFactor -= 0.1;
    this.swimCount++;
    this.swimTimeout = true;
    setTimeout(() => {
      this.swimTimeout = false;
    }, this.swimCooldown);
  }

  setupEventListeners() {
    // this.controls.addEventListener(
    //   "change",
    //   this.controlsChangeHandler.bind(this),
    // );
    window.addEventListener("keyup", this.swimUp.bind(this));

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
      x * this.cameraRange.horiz * this.cameraRange.globalAmplitude,
      -y * this.cameraRange.vert * this.cameraRange.globalAmplitude,
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
