import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import gsap from "gsap";
import { WORLDS, type World } from "../worlds";
import { soundFX } from "./audio";

export interface ExperienceHandles {
  dispose: () => void;
  focusWorldBySlug: (slug: string) => void;
  enterWorldBySlug: (slug: string) => void;
}

function createGlowTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, colorHex);
  grad.addColorStop(0.35, colorHex);
  grad.addColorStop(0.7, "rgba(0, 0, 0, 0.3)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function initExperience(
  container: HTMLElement,
  onWorldFocus: (world: World | null) => void,
  onWorldEnter: (world: World) => void,
  canClearHover?: () => boolean
): ExperienceHandles {
  const textureLoader = new THREE.TextureLoader();
  const disposableTextures: THREE.Texture[] = [];
  const base = import.meta.env.BASE_URL || "./";

  // --- Three.js Scene & Camera Setup ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060608);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 80);
  const BASE_CAM_Z = 7.5;
  camera.position.set(0, 0, BASE_CAM_Z);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  // --- Post-Processing (Cinematic Bloom) ---
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    0.32,
    0.35,
    0.85
  );
  composer.addPass(bloomPass);

  // --- Master Concept Render Backdrop ---
  const conceptTex = textureLoader.load(`${base}assets/master/youngla_concept_render.png`);
  conceptTex.colorSpace = THREE.SRGBColorSpace;
  conceptTex.minFilter = THREE.LinearMipmapLinearFilter;
  conceptTex.magFilter = THREE.LinearFilter;
  conceptTex.generateMipmaps = true;
  disposableTextures.push(conceptTex);

  // Compute frustum dimensions at Z=0 for FOV=45 and camera Z=7.5
  const baseFrustumH = 2 * BASE_CAM_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const baseFrustumW = baseFrustumH * (16 / 9);

  // Create curved backdrop mesh: vertices curve back at edges to create rotunda depth
  const segX = 32;
  const segY = 16;
  const backdropGeo = new THREE.PlaneGeometry(baseFrustumW, baseFrustumH, segX, segY);
  const posAttr = backdropGeo.attributes.position;
  const halfW = baseFrustumW / 2;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const curveSag = -Math.pow(x / halfW, 2) * 0.55;
    posAttr.setZ(i, curveSag);
  }
  backdropGeo.computeVertexNormals();

  const backdropMat = new THREE.MeshBasicMaterial({
    map: conceptTex,
    side: THREE.FrontSide,
  });
  const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
  backdropMesh.position.set(0, 0, 0);
  scene.add(backdropMesh);

  // --- Ambient & Fill Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambientLight);

  // --- World Alcove Interactive Rigs ---
  interface AlcoveRig {
    world: World;
    worldX: number;
    worldY: number;
    worldZ: number;
    hitPlane: THREE.Mesh;
    glowMesh: THREE.Mesh;
    glowMat: THREE.MeshBasicMaterial;
    spotLight: THREE.SpotLight;
  }

  const alcoveRigs: AlcoveRig[] = WORLDS.map((world) => {
    const worldX = world.xNorm * (baseFrustumW / 2) * 0.98;
    const worldY = -0.05;
    const worldZ = -Math.pow(worldX / halfW, 2) * 0.55;

    // 1. Invisible Hit Plane for Raycasting
    const hitGeo = new THREE.PlaneGeometry(1.32, 3.3);
    const hitMat = new THREE.MeshBasicMaterial({
      visible: false,
    });
    const hitPlane = new THREE.Mesh(hitGeo, hitMat);
    hitPlane.position.set(worldX, worldY, worldZ + 0.08);
    hitPlane.userData.slug = world.slug;
    scene.add(hitPlane);

    // 2. Localized Volumetric Accent Glow (illuminates alcove on hover)
    const glowTex = createGlowTexture(world.accent);
    disposableTextures.push(glowTex);
    const glowGeo = new THREE.PlaneGeometry(2.4, 3.6);
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(worldX, worldY + 0.1, worldZ + 0.04);
    scene.add(glowMesh);

    // 3. Localized 3D SpotLight pointing at the alcove
    const spotLight = new THREE.SpotLight(new THREE.Color(world.accent), 0, 10, Math.PI / 5, 0.45, 1.2);
    spotLight.position.set(worldX, 2.6, worldZ + 1.2);
    const targetObj = new THREE.Object3D();
    targetObj.position.set(worldX, worldY, worldZ);
    scene.add(targetObj);
    spotLight.target = targetObj;
    scene.add(spotLight);

    return {
      world,
      worldX,
      worldY,
      worldZ,
      hitPlane,
      glowMesh,
      glowMat,
      spotLight,
    };
  });

  // --- Atmospheric Floating 3D Particles ---
  const particleCount = 110;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * baseFrustumW * 1.1;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * baseFrustumH * 0.9;
    particlePositions[i * 3 + 2] = Math.random() * 5.5 + 0.5;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.04,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- Pointer & Parallax Interaction ---
  const pointer = { x: 0, y: 0 };
  const pointerNDC = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let hoveredRig: AlcoveRig | null = null;
  let isTransitioning = false;
  let hoverTimeout: number | null = null;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const camXTo = gsap.quickTo(camera.position, "x", { duration: 1.0, ease: "power2.out" });
  const camYTo = gsap.quickTo(camera.position, "y", { duration: 1.0, ease: "power2.out" });
  const camRotYTo = gsap.quickTo(camera.rotation, "y", { duration: 1.1, ease: "power2.out" });
  const camRotXTo = gsap.quickTo(camera.rotation, "x", { duration: 1.1, ease: "power2.out" });

  function setHover(nextRig: AlcoveRig | null) {
    if (nextRig === hoveredRig || isTransitioning) return;
    hoveredRig = nextRig;

    if (hoveredRig) {
      soundFX.playHover();
      onWorldFocus(hoveredRig.world);
      container.style.cursor = "pointer";

      if (!reduceMotion) {
        camXTo(hoveredRig.worldX * 0.22);
        camYTo(0.04);
        camRotYTo(-hoveredRig.worldX * 0.022);
      }
    } else {
      onWorldFocus(null);
      container.style.cursor = "default";
      if (!reduceMotion) {
        camXTo(pointer.x * 0.35);
        camYTo(pointer.y * 0.18);
        camRotYTo(-pointer.x * 0.03);
        camRotXTo(pointer.y * 0.02);
      }
    }

    alcoveRigs.forEach((rig) => {
      const isTarget = rig === hoveredRig;
      gsap.to(rig.spotLight, {
        intensity: isTarget ? 3.8 : 0,
        duration: 0.55,
        ease: "power2.out",
      });
      gsap.to(rig.glowMat, {
        opacity: isTarget ? 0.42 : 0,
        duration: 0.55,
        ease: "power2.out",
      });
    });
  }

  function onPointerMove(e: PointerEvent) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerNDC.set(pointer.x, pointer.y);

    if (!hoveredRig && !reduceMotion) {
      camXTo(pointer.x * 0.35);
      camYTo(pointer.y * 0.18);
      camRotYTo(-pointer.x * 0.03);
      camRotXTo(pointer.y * 0.02);
    }

    raycaster.setFromCamera(pointerNDC, camera);
    const intersects = raycaster.intersectObjects(alcoveRigs.map((r) => r.hitPlane));
    if (intersects.length > 0) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      const slug = intersects[0].object.userData.slug as string;
      const rig = alcoveRigs.find((r) => r.world.slug === slug) ?? null;
      setHover(rig);
    } else if (hoveredRig && !hoverTimeout) {
      hoverTimeout = window.setTimeout(() => {
        if (canClearHover && !canClearHover()) {
          hoverTimeout = null;
          return;
        }
        setHover(null);
        hoverTimeout = null;
      }, 450);
    }
  }
  container.addEventListener("pointermove", onPointerMove);

  function enterWorld(rig: AlcoveRig) {
    if (isTransitioning) return;
    isTransitioning = true;
    soundFX.playEnter();
    container.style.cursor = "default";

    const targetX = rig.worldX * 0.9;
    const targetY = rig.worldY + 0.1;
    const targetZ = rig.worldZ + 1.8;

    gsap.to(camera.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 0.82,
      ease: "power3.in",
    });
    gsap.to(camera, {
      fov: 58,
      duration: 0.82,
      ease: "power2.in",
      onUpdate: () => camera.updateProjectionMatrix(),
    });
    gsap.to(rig.spotLight, {
      intensity: 12,
      duration: 0.6,
      ease: "power2.in",
    });
    gsap.to(bloomPass, {
      strength: 2.2,
      duration: 0.65,
      ease: "power2.in",
    });

    window.setTimeout(() => {
      onWorldEnter(rig.world);
    }, 420);
  }

  function onClick() {
    if (hoveredRig) enterWorld(hoveredRig);
  }
  container.addEventListener("click", onClick);

  function focusWorldBySlug(slug: string) {
    const rig = alcoveRigs.find((r) => r.world.slug === slug || r.world.id === slug) ?? null;
    setHover(rig);
  }

  function enterWorldBySlug(slug: string) {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    const rig = alcoveRigs.find((r) => r.world.slug === slug || r.world.id === slug);
    if (rig) {
      setHover(rig);
      enterWorld(rig);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && hoveredRig) {
      enterWorld(hoveredRig);
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const curIdx = hoveredRig ? WORLDS.findIndex((w) => w.slug === hoveredRig!.world.slug) : 3;
      const nextIdx = e.key === "ArrowRight" ? Math.min(curIdx + 1, WORLDS.length - 1) : Math.max(curIdx - 1, 0);
      focusWorldBySlug(WORLDS[nextIdx].slug);
    }
  }
  window.addEventListener("keydown", onKeyDown);

  // Progressive Entrance Transition
  backdropMat.opacity = 0;
  backdropMat.transparent = true;
  gsap.to(backdropMat, {
    opacity: 1,
    duration: 1.4,
    ease: "power2.out",
    delay: 0.2,
  });

  // Render Loop
  let rafId: number;
  function tick() {
    const pos = particleGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] -= 0.002;
      if (pos[i * 3 + 1] < -baseFrustumH / 2) {
        pos[i * 3 + 1] = baseFrustumH / 2;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    composer.render();
    rafId = requestAnimationFrame(tick);
  }
  tick();

  // Responsive Resize Handler (Object-fit: cover equivalent in 3D WebGL)
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    const aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    const currentFrustumH = 2 * BASE_CAM_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const currentFrustumW = currentFrustumH * aspect;
    const scaleRatio = Math.max(currentFrustumW / baseFrustumW, currentFrustumH / baseFrustumH);

    backdropMesh.scale.set(scaleRatio, scaleRatio, scaleRatio);

    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.setSize(w, h);
  }
  const ro = new ResizeObserver(onResize);
  ro.observe(container);
  onResize();

  function dispose() {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    container.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKeyDown);
    disposableTextures.forEach((tex) => tex.dispose());
    renderer.dispose();
    composer.dispose();
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  return { dispose, focusWorldBySlug, enterWorldBySlug };
}
