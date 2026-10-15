import * as THREE from "three";
import SceneSea from "./SceneSea";

import { Pane } from "tweakpane";

export default class WebGLApplication {
  constructor() {
    this.renderWidth = window.innerWidth;
    this.renderHeight = window.innerHeight;

    this.clock = new THREE.Timer();
    this.clock.connect(document);

    this.delta = 0;
    this.time = 0;
    this.elapsed = 0;

    this.renderer = this.createRenderer();
    this.debugger = this.createDebugger();
    this.scene = this.createSceneSea();

    this.resize();
    this.setupEventListeners();
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector(".webgl"),
    });

    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.shadowMap.enabled = true;

    return renderer;
  }

  createSceneSea() {
    const scene = new SceneSea({
      renderer: this.renderer,
      debugger: this.debugger,
    });

    return scene;
  }

  resize() {
    this.renderer.setSize(this.renderWidth, this.renderHeight);

    this.scene.resize(this.renderWidth, this.renderHeight);
  }

  update() {
    this.clock.update();
    this.elapsed = this.clock.getElapsed();

    this.scene.update({
      elapsed: this.elapsed,
    });
  }

  render() {
    this.renderer.render(this.scene, this.scene.camera);
  }

  setupEventListeners() {
    window.addEventListener("resize", this.resizeHandler.bind(this));

    this.tickHandler();
  }

  resizeHandler() {
    this.renderWidth = window.innerWidth;
    this.renderHeight = window.innerHeight;

    this.resize();
  }

  tickHandler() {
    requestAnimationFrame(this.tickHandler.bind(this));
    this.update();
    this.render();
  }

  // DEBUG
  createDebugger() {
    const pane = new Pane({ title: "WebGL App" });

    return pane;
  }
}
