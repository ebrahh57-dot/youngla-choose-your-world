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
  grad.addColorStop(0.7, "rgba(0, 0, 0, 0.25)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(128, 64, 10, 128, 64, 120);
  grad.addColorStop(0, "rgba(0, 0, 0, 0.85)");
  grad.addColorStop(0.5, "rgba(0, 0, 0, 0.45)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);

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
  scene.background = new THREE.Color(0x050507); // Nocturnal charcoal black
  scene.fog = new THREE.FogExp2(0x050507, 0.016);

  const camera = new THREE.PerspectiveCamera(43, container.clientWidth / container.clientHeight, 0.1, 80);
  const BASE_CAM_Z = 7.6;
  const BASE_CAM_Y = 0.06;
  camera.position.set(0, BASE_CAM_Y, BASE_CAM_Z);
  camera.lookAt(0, 0.05, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  container.appendChild(renderer.domElement);

  // --- Post-Processing: Cinematic Bloom ---
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    0.34, // Subtle intensity
    0.42, // Radius
    0.84  // Threshold (only illuminates neon & architectural highlights)
  );
  composer.addPass(bloomPass);

  // --- 1. Monumental Architectural Rotunda Backdrop ---
  const conceptTex = textureLoader.load(`${base}assets/master/youngla_concept_render.png`);
  conceptTex.colorSpace = THREE.SRGBColorSpace;
  conceptTex.minFilter = THREE.LinearMipmapLinearFilter;
  conceptTex.magFilter = THREE.LinearFilter;
  conceptTex.generateMipmaps = true;
  disposableTextures.push(conceptTex);

  // Frustum dimensions at Z=0
  const baseFrustumH = 2 * BASE_CAM_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); // ~5.938
  const baseFrustumW = baseFrustumH * (16 / 9); // ~10.556

  // Curved cylindrical backdrop: outer edges curve back to create rotunda depth
  const segX = 48;
  const segY = 24;
  const backdropGeo = new THREE.PlaneGeometry(baseFrustumW, baseFrustumH, segX, segY);
  const posAttr = backdropGeo.attributes.position;
  const halfW = baseFrustumW / 2;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const curveSag = -Math.pow(x / halfW, 2) * 0.58;
    posAttr.setZ(i, curveSag);
  }
  backdropGeo.computeVertexNormals();

  const backdropMat = new THREE.MeshBasicMaterial({
    map: conceptTex,
    side: THREE.FrontSide,
    transparent: true,
    opacity: 0,
  });
  const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
  backdropMesh.position.set(0, 0, 0);
  scene.add(backdropMesh);

  // --- 2. Central Hero Model: Staged Visual Protagonist ---
  const modelTex = textureLoader.load(`${base}assets/character/youngla_hero_model_clean.png`);
  modelTex.colorSpace = THREE.SRGBColorSpace;
  modelTex.minFilter = THREE.LinearMipmapLinearFilter;
  modelTex.magFilter = THREE.LinearFilter;
  modelTex.generateMipmaps = true;
  disposableTextures.push(modelTex);

  // Precision dimensions matching 64.24% of image height
  const modelH = baseFrustumH * (370.0 / 576.0) * 1.015; // ~3.88
  const modelW = baseFrustumW * (125.0 / 1024.0) * 1.015; // ~1.31
  const modelBaseX = 0.005;
  const modelBaseY = -baseFrustumH * (87.0 / 576.0); // ~ -0.897
  const modelBaseZ = 0.12;

  const heroModelGroup = new THREE.Group();
  heroModelGroup.position.set(modelBaseX, modelBaseY, modelBaseZ);

  const heroModelGeo = new THREE.PlaneGeometry(modelW, modelH);
  const heroModelMat = new THREE.MeshStandardMaterial({
    map: modelTex,
    transparent: true,
    alphaTest: 0.02,
    roughness: 0.65,
    metalness: 0.15,
    opacity: 0,
  });
  const heroModelMesh = new THREE.Mesh(heroModelGeo, heroModelMat);
  heroModelGroup.add(heroModelMesh);

  // Ground Contact Shadow under model's sneakers
  const shadowTex = createContactShadowTexture();
  disposableTextures.push(shadowTex);
  const shadowGeo = new THREE.PlaneGeometry(modelW * 0.95, 0.38);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0,
    blending: THREE.MultiplyBlending,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(0, -modelH / 2 + 0.02, 0.02);
  heroModelGroup.add(shadowMesh);

  scene.add(heroModelGroup);

  // --- 3. Staged Editorial Lighting Rig ---
  // Controlled ambient lighting (darkness is part of the design)
  const ambientLight = new THREE.AmbientLight(0x181820, 0.85);
  scene.add(ambientLight);

  // Overhead Key Spotlight on Hero Model
  const modelKeySpot = new THREE.SpotLight(0xfff5ea, 0, 10, Math.PI / 5, 0.65, 1.2);
  modelKeySpot.position.set(0.6, 2.4, 2.2);
  modelKeySpot.target = heroModelGroup;
  scene.add(modelKeySpot);

  // Cool Rim Light highlighting model's shoulders and jawline
  const modelRimSpot = new THREE.SpotLight(0xa5b4fc, 0, 8, Math.PI / 4, 0.75, 1.1);
  modelRimSpot.position.set(-1.1, 1.8, -0.4);
  modelRimSpot.target = heroModelGroup;
  scene.add(modelRimSpot);

  // --- 4. Collaboration World Physical Installations ---
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
    const worldZ = -Math.pow(worldX / halfW, 2) * 0.58;

    // Invisible Hit Zone for interaction
    const hitGeo = new THREE.PlaneGeometry(1.35, 3.4);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitPlane = new THREE.Mesh(hitGeo, hitMat);
    hitPlane.position.set(worldX, worldY, worldZ + 0.08);
    hitPlane.userData.slug = world.slug;
    scene.add(hitPlane);

    // Volumetric Accent Glow (subtle atmospheric halo)
    const glowTex = createGlowTexture(world.accent);
    disposableTextures.push(glowTex);
    const glowGeo = new THREE.PlaneGeometry(2.3, 3.5);
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

    // Physical Directional Spotlight pointing down into the alcove
    const spotLight = new THREE.SpotLight(new THREE.Color(world.accent), 0, 11, Math.PI / 5, 0.5, 1.2);
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

  // --- 5. Atmospheric Floating Dust Motes (Subtle & Restrained) ---
  const particleCount = 75; // Restrained count for elegance
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * baseFrustumW * 1.05;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * baseFrustumH * 0.85;
    particlePositions[i * 3 + 2] = Math.random() * 5.0 + 0.8;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.035,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- 6. Interaction, Camera Parallax & Physical Staging ---
  const pointer = { x: 0, y: 0 };
  const pointerNDC = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let hoveredRig: AlcoveRig | null = null;
  let isTransitioning = false;
  let hoverTimeout: number | null = null;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Ultra-slow, expensive camera micro-parallax
  const camXTo = gsap.quickTo(camera.position, "x", { duration: 1.4, ease: "power2.out" });
  const camYTo = gsap.quickTo(camera.position, "y", { duration: 1.4, ease: "power2.out" });
  const camRotYTo = gsap.quickTo(camera.rotation, "y", { duration: 1.5, ease: "power2.out" });
  const camRotXTo = gsap.quickTo(camera.rotation, "x", { duration: 1.5, ease: "power2.out" });

  function setHover(nextRig: AlcoveRig | null) {
    if (nextRig === hoveredRig || isTransitioning) return;
    hoveredRig = nextRig;

    if (hoveredRig) {
      soundFX.playHover();
      onWorldFocus(hoveredRig.world);
      container.style.cursor = "pointer";

      // 1. Subtle camera shift: physically looking toward the installation
      if (!reduceMotion) {
        camXTo(hoveredRig.worldX * 0.18);
        camYTo(BASE_CAM_Y + 0.03);
        camRotYTo(-hoveredRig.worldX * 0.02);

        // 2. Hero model subtly leans / turns attention toward that world
        gsap.to(heroModelGroup.rotation, {
          y: -hoveredRig.worldX * 0.03,
          duration: 1.2,
          ease: "power2.out",
        });
      }

      // 3. Lighting contrast: ambient darkness drops, selected world surges
      gsap.to(ambientLight, {
        intensity: 0.48,
        duration: 0.7,
        ease: "power2.out",
      });
    } else {
      onWorldFocus(null);
      container.style.cursor = "default";

      if (!reduceMotion) {
        camXTo(pointer.x * 0.28);
        camYTo(BASE_CAM_Y + pointer.y * 0.12);
        camRotYTo(-pointer.x * 0.022);
        camRotXTo(pointer.y * 0.015);

        gsap.to(heroModelGroup.rotation, {
          y: 0,
          duration: 1.2,
          ease: "power2.out",
        });
      }

      // Ambient light returns to standard level
      gsap.to(ambientLight, {
        intensity: 0.85,
        duration: 0.7,
        ease: "power2.out",
      });
    }

    // Illuminate target alcove spotlight & glow
    alcoveRigs.forEach((rig) => {
      const isTarget = rig === hoveredRig;
      gsap.to(rig.spotLight, {
        intensity: isTarget ? 4.8 : 0.15,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.to(rig.glowMat, {
        opacity: isTarget ? 0.45 : 0,
        duration: 0.6,
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
      camXTo(pointer.x * 0.28);
      camYTo(BASE_CAM_Y + pointer.y * 0.12);
      camRotYTo(-pointer.x * 0.022);
      camRotXTo(pointer.y * 0.015);
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
      }, 420);
    }
  }
  container.addEventListener("pointermove", onPointerMove);

  function enterWorld(rig: AlcoveRig) {
    if (isTransitioning) return;
    isTransitioning = true;
    soundFX.playEnter();
    container.style.cursor = "default";

    // Strong cinematic camera surge directly into the world installation
    const targetX = rig.worldX * 0.88;
    const targetY = rig.worldY + 0.1;
    const targetZ = rig.worldZ + 1.8;

    gsap.to(camera.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 0.85,
      ease: "power3.in",
    });
    gsap.to(camera, {
      fov: 60,
      duration: 0.85,
      ease: "power2.in",
      onUpdate: () => camera.updateProjectionMatrix(),
    });
    gsap.to(rig.spotLight, {
      intensity: 14,
      duration: 0.65,
      ease: "power2.in",
    });
    gsap.to(bloomPass, {
      strength: 2.2,
      duration: 0.65,
      ease: "power2.in",
    });

    window.setTimeout(() => {
      onWorldEnter(rig.world);
    }, 450);
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

  // --- 7. 6-Stage Cinematic Introduction Sequence ---
  // BLACK -> presence -> architecture -> environment -> model revealed -> worlds activate
  const introTl = gsap.timeline({ delay: 0.2 });

  // Stage 1: Architecture slowly reveals itself from darkness
  introTl.to(
    backdropMat,
    { opacity: 0.45, duration: 1.2, ease: "power2.out" },
    0.3
  );

  // Stage 2: Environment becomes visible with full contrast
  introTl.to(
    backdropMat,
    { opacity: 1.0, duration: 1.2, ease: "power2.out" },
    1.4
  );

  // Stage 3: Hero Model is revealed by key spotlight sweep
  introTl.to(
    heroModelMat,
    { opacity: 1.0, duration: 1.0, ease: "power2.out" },
    2.2
  );
  introTl.to(
    shadowMat,
    { opacity: 0.7, duration: 1.0, ease: "power2.out" },
    2.2
  );
  introTl.to(
    modelKeySpot,
    { intensity: 3.4, duration: 1.2, ease: "power2.out" },
    2.4
  );
  introTl.to(
    modelRimSpot,
    { intensity: 1.8, duration: 1.2, ease: "power2.out" },
    2.6
  );

  // Stage 4: Collaboration Worlds begin to activate
  alcoveRigs.forEach((rig, idx) => {
    introTl.to(
      rig.spotLight,
      { intensity: 0.15, duration: 0.8, ease: "power2.out" },
      3.2 + idx * 0.08
    );
  });

  // --- 8. Render Loop with Micro-Movement ---
  let rafId: number;
  const clock = new THREE.Clock();

  function tick() {
    const t = clock.getElapsedTime();

    // Subtle human micro-movement (breathing cycle)
    if (!isTransitioning) {
      const breath = Math.sin(t * 1.4);
      heroModelMesh.position.y = breath * 0.007;
      heroModelMesh.scale.y = 1 + breath * 0.003;
      heroModelMesh.scale.x = 1 - breath * 0.0015;
    }

    // Slow atmospheric particle drift
    const pos = particleGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] -= 0.0015;
      if (pos[i * 3 + 1] < -baseFrustumH / 2) {
        pos[i * 3 + 1] = baseFrustumH / 2;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    composer.render();
    rafId = requestAnimationFrame(tick);
  }
  tick();

  // Responsive Object-fit: cover for WebGL
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
    introTl.kill();
    disposableTextures.forEach((tex) => tex.dispose());
    renderer.dispose();
    composer.dispose();
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  return { dispose, focusWorldBySlug, enterWorldBySlug };
}
