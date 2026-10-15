import * as THREE from "three";
import gsap from "gsap";

export default class Animation {
  constructor(options = {}) {
    this.renderer = options.renderer;
    this.scene = options.scene;
    this.cameraManager = options.cameraManager;
    this.tl = this.createTimeline();
    this.createEyelids();

    this.setupEventListeners();
  }

  createTimeline() {
    const tl = gsap.timeline();

    return tl;
  }

  beginAnimation() {
    this.renderer.toneMappingExposure = 1;
    console.log(this.renderer.toneMapping);

    this.tl
      .to(this.renderer, {
        toneMappingExposure: 15,
        duration: 5,
        ease: "power3.in",
      })
      .to(
        this.scene.background,
        {
          r: 1,
          g: 1,
          b: 1,
          duration: 5,
          ease: "power3.in",
        },
        "<",
      )
      .to(
        ".eyelid",
        {
          height: "15%",
          duration: 2,
          ease: "power4.out",
        },
        "<2.5",
      )
      .to(
        ".eyelid",
        {
          height: "35%",
          duration: 3,
          ease: "power4.out",
        },
        "<2",
      )
      .to(
        ".eyelid",
        {
          height: "55%",
          duration: 2,
          ease: "power4.out",
        },
        "<0.5",
      )
      .call(
        () => {
          this.scene.changeState();
          this.renderer.toneMapping = THREE.NoToneMapping;
          this.scheduleLightning();
        },
        [],
        "<0.5",
      )
      .call(() => {
        this.cameraManager.controlsEnabled = false;
        this.cameraManager.camera.lookAt(0, 0, 0);
      })
      .to(".eyelid", {
        height: "10%",
        duration: 3,
        ease: "power2.out",
      })

      .to(this.cameraManager.camera.position, {
        y: -4,
        duration: 6,
        ease: "power1.in",
      })
      .to(
        ".eyelid",
        {
          height: "60%",
          duration: 6,
          ease: "power1.in",
        },
        "<2",
      );
  }

  //Lightning
  scheduleLightning() {
    const delay = gsap.utils.random(2000, 4000);
    this.lightningTimeout = setTimeout(() => {
      this.animateLightning();
      this.scheduleLightning();
    }, delay);
  }

  stopLightning() {
    clearTimeout(this.lightningTimeout);
    this.lightningTimeout = null;
    this.lightningTimeline?.kill();
  }

  animateLightning() {
    const stormColor = new THREE.Color(0x041824);
    const flashColor = new THREE.Color(0xffffff);
    const color = stormColor.clone();
    const intensity = { value: 0 };

    this.lightningTimeline?.kill();
    this.lightningTimeline = gsap
      .timeline({
        onUpdate: () => {
          color.lerpColors(stormColor, flashColor, intensity.value);
          this.scene.background = color;
        },
      })
      .to(intensity, { value: 1, duration: 0.04, ease: "none" })
      .to(intensity, { value: 0.2, duration: 0.08, ease: "power2.out" })
      .to(intensity, { value: 0.8, duration: 0.03, ease: "none" })
      .to(intensity, { value: 0.1, duration: 0.1, ease: "power2.out" })
      .to(intensity, { value: 1, duration: 0.04, ease: "none" }, "+=0.06")
      .to(intensity, { value: 0, duration: 0.6, ease: "power3.out" });
  }

  //Eyelids
  createEyelids() {
    const topEyelid = document.createElement("div");
    topEyelid.classList.add("eyelid", "top");
    const bottomEyelid = document.createElement("div");
    bottomEyelid.classList.add("eyelid", "bottom");

    document.querySelector("body").appendChild(topEyelid);
    document.querySelector("body").appendChild(bottomEyelid);

    this.scheduleBlink();
  }

  animateEyelids() {
    if (this.tl && this.tl.isActive()) return;
    this.tl = gsap.timeline();
    this.tl
      .to(".eyelid", {
        height: "50%",
        duration: 0.3,
        ease: "power2.inOut",
      })
      .to(".eyelid", {
        height: "10%",
        duration: 0.4,
        ease: "power2.out",
      });
  }

  scheduleBlink() {
    const delay = gsap.utils.random(3000, 7000);
    this.blinkTimeout = setTimeout(() => {
      this.animateEyelids();
      this.scheduleBlink();
    }, delay);
  }

  setupEventListeners() {
    window.addEventListener("click", this.beginAnimation.bind(this));
  }

  createDebugFolder() {
    if (!this.debugger) return;

    const folder = this.debugger.addFolder({
      title: "Animation",
    });

    return sceneFolder;
  }
}
