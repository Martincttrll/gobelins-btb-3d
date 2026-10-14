import * as THREE from "three";
import { Sky } from "three/examples/jsm/Addons.js";

export default class Sky extends THREE.Object3D {
  constructor() {
    super();
    this.sky = this.createSky();
  }

  createSky() {}
}
