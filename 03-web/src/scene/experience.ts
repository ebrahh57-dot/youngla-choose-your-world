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

// Sophisticated architectural studio light temperatures (not saturated neon / game UI)
const ARCHITECTURAL_TINTS: Record<string, number> = {
  batman: 0x9ec5ea,         // Nocturnal cool slate steel
  "the-boys": 0xdd4b4b,     // Deep industrial crimson
  "demon-slayer": 0x9f86c0, // Traditional indigo-violet wash
  youngla: 0xfff6ea,        // Clean 3500K gallery spotlight
  "attack-on-titan": 0x5a9e52, // Muted military olive-moss (photographic, not laser-green)
  naruto: 0xd9822b,         // Warm amber lantern illumination
  "one-punch-man": 0xdba832 // Architectural ochre gold
};

function createContactShadowTexture(isTight = false): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(128, 64, isTight ? 4 : 14, 128, 64, isTight ? 80 : 124);
  if (isTight) {
    grad.addColorStop(0, "rgba(0, 0, 0, 0.95)");
    grad.addColorStop(0.45, "rgba(0, 0, 0, 0.65)");
    grad.addColorStop(0.8, "rgba(0, 0, 0, 0.18)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  } else {
    grad.addColorStop(0, "rgba(0, 0, 0, 0.60)");
    grad.addColorStop(0.4, "rgba(0, 0, 0, 0.30)");
    grad.addColorStop(0.75, "rgba(0, 0, 0, 0.08)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSoftParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  grad.addColorStop(0.25, "rgba(255, 255, 255, 0.45)");
  grad.addColorStop(0.65, "rgba(255, 255, 255, 0.1)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

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
  scene.background = new THREE.Color(0x040406); // Deepest nocturnal black
  scene.fog = new THREE.FogExp2(0x040406, 0.016);

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
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // --- Post-Processing: Filmic Bloom (High threshold, subtle natural diffusion) ---
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    0.20, // Subdued, luxury photographic bloom (never cloudy or video-gamey)
    0.35, // Radius
    0.88  // Catches only true emissive letterings
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

  // Standard PBR material for physical light and shadow response
  const backdropMat = new THREE.MeshStandardMaterial({
    map: conceptTex,
    side: THREE.FrontSide,
    transparent: true,
    opacity: 0,
    roughness: 0.82,
    metalness: 0.10,
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

  const modelH = baseFrustumH * (370.0 / 576.0) * 1.03; // ~3.93
  const modelW = baseFrustumW * (125.0 / 1024.0) * 1.03; // ~1.33
  const modelBaseX = 0.005;
  const modelBaseY = -baseFrustumH * (87.0 / 576.0); // ~ -0.897
  const modelBaseZ = 0.14;

  const heroModelGroup = new THREE.Group();
  heroModelGroup.position.set(modelBaseX, modelBaseY, modelBaseZ);

  const heroModelGeo = new THREE.PlaneGeometry(modelW, modelH);
  const heroModelMat = new THREE.MeshStandardMaterial({
    map: modelTex,
    transparent: true,
    alphaTest: 0.02,
    roughness: 0.62,
    metalness: 0.12,
    opacity: 0,
  });
  const heroModelMesh = new THREE.Mesh(heroModelGeo, heroModelMat);
  heroModelGroup.add(heroModelMesh);

  // Multi-tier Ground Contact Shadow under model's sneakers
  const shadowTightTex = createContactShadowTexture(true);
  disposableTextures.push(shadowTightTex);
  const shadowTightGeo = new THREE.PlaneGeometry(modelW * 0.75, 0.26);
  const shadowTightMat = new THREE.MeshBasicMaterial({
    map: shadowTightTex,
    transparent: true,
    opacity: 0,
    blending: THREE.MultiplyBlending,
  });
  const shadowTightMesh = new THREE.Mesh(shadowTightGeo, shadowTightMat);
  shadowTightMesh.rotation.x = -Math.PI / 2;
  shadowTightMesh.position.set(0, -modelH / 2 + 0.015, 0.03);
  heroModelGroup.add(shadowTightMesh);

  const shadowSoftTex = createContactShadowTexture(false);
  disposableTextures.push(shadowSoftTex);
  const shadowSoftGeo = new THREE.PlaneGeometry(modelW * 1.12, 0.52);
  const shadowSoftMat = new THREE.MeshBasicMaterial({
    map: shadowSoftTex,
    transparent: true,
    opacity: 0,
    blending: THREE.MultiplyBlending,
  });
  const shadowSoftMesh = new THREE.Mesh(shadowSoftGeo, shadowSoftMat);
  shadowSoftMesh.rotation.x = -Math.PI / 2;
  shadowSoftMesh.position.set(0, -modelH / 2 + 0.01, 0.04);
  heroModelGroup.add(shadowSoftMesh);

  scene.add(heroModelGroup);

  // --- 3. Staged Editorial Lighting Rig ---
  // Ambient gallery light providing balanced visibility across all architecture
  const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.90);
  scene.add(ambientLight);

  // Subtle directional fill from high above
  const directionalFill = new THREE.DirectionalLight(0xfff8f0, 0.32);
  directionalFill.position.set(0, 5, 5);
  scene.add(directionalFill);

  // Overhead Studio Key Spotlight on Hero Model
  const modelKeySpot = new THREE.SpotLight(0xfff7ee, 0, 11, Math.PI / 5, 0.65, 1.2);
  modelKeySpot.position.set(0.5, 2.6, 2.2);
  modelKeySpot.target = heroModelGroup;
  scene.add(modelKeySpot);

  // Cool Architectural Rim Light on model silhouette
  const modelRimSpot = new THREE.SpotLight(0xc7d2fe, 0, 9, Math.PI / 4, 0.75, 1.1);
  modelRimSpot.position.set(-1.2, 2.0, -0.3);
  modelRimSpot.target = heroModelGroup;
  scene.add(modelRimSpot);

  // --- 4. Collaboration World Physical Installations (Physical Spotlights, Zero Fake Glow Forcefields) ---
  interface AlcoveRig {
    world: World;
    worldX: number;
    worldY: number;
    worldZ: number;
    hitPlane: THREE.Mesh;
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

    // Physical Directional Spotlight pointing down into the alcove
    // Uses architectural studio light tints rather than raw oversaturated neons
    const tintColor = ARCHITECTURAL_TINTS[world.slug] ?? 0xffffff;
    const spotLight = new THREE.SpotLight(new THREE.Color(tintColor), 0, 12, Math.PI / 4.6, 0.75, 1.2);
    spotLight.position.set(worldX, 2.7, worldZ + 1.4);
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
      spotLight,
    };
  });

  // --- 5. Soft Atmospheric Floating Air Motes (Ultra-subtle, organic circular discs) ---
  const particleCount = 35; // Sparse, high-end atmosphere
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  let pIdx = 0;
  while (pIdx < particleCount) {
    const px = (Math.random() - 0.5) * baseFrustumW * 1.05;
    const py = (Math.random() - 0.5) * baseFrustumH * 0.85;
    const pz = Math.random() * 4.5 + 0.8;

    if (Math.abs(px) < 0.65 && py > -1.2 && py < 1.4) {
      continue;
    }
    particlePositions[pIdx * 3] = px;
    particlePositions[pIdx * 3 + 1] = py;
    particlePositions[pIdx * 3 + 2] = pz;
    pIdx++;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

  const particleTex = createSoftParticleTexture();
  disposableTextures.push(particleTex);

  const particleMat = new THREE.PointsMaterial({
    map: particleTex,
    color: 0xffffff,
    size: 0.042,
    transparent: true,
    opacity: 0.11,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
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

  // Controlled, slow, weighted cinematic camera micro-parallax
  const camXTo = gsap.quickTo(camera.position, "x", { duration: 1.8, ease: "power3.out" });
  const camYTo = gsap.quickTo(camera.position, "y", { duration: 1.8, ease: "power3.out" });
  const camRotYTo = gsap.quickTo(camera.rotation, "y", { duration: 2.0, ease: "power3.out" });
  const camRotXTo = gsap.quickTo(camera.rotation, "x", { duration: 2.0, ease: "power3.out" });

  function setHover(nextRig: AlcoveRig | null) {
    if (nextRig === hoveredRig || isTransitioning) return;
    hoveredRig = nextRig;

    if (hoveredRig) {
      soundFX.playHover();
      onWorldFocus(hoveredRig.world);
      container.style.cursor = "pointer";

      // 1. Controlled camera shift looking toward the chosen installation
      if (!reduceMotion) {
        camXTo(hoveredRig.worldX * 0.2);
        camYTo(BASE_CAM_Y + 0.02);
        camRotYTo(-hoveredRig.worldX * 0.022);

        // 2. Hero model subtly turns attention toward chosen world with heavy presence
        gsap.to(heroModelGroup.rotation, {
          y: -hoveredRig.worldX * 0.032,
          duration: 1.6,
          ease: "power2.out",
        });
      }

      // 3. Environmental contrast: rest of the building becomes quieter (0.52 preserves architectural legibility)
      gsap.to(ambientLight, {
        intensity: 0.52,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.to(directionalFill, {
        intensity: 0.16,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.to(modelKeySpot, {
        intensity: 3.6,
        duration: 0.8,
        ease: "power2.out",
      });
    } else {
      onWorldFocus(null);
      container.style.cursor = "default";

      if (!reduceMotion) {
        camXTo(pointer.x * 0.22);
        camYTo(BASE_CAM_Y + pointer.y * 0.08);
        camRotYTo(-pointer.x * 0.018);
        camRotXTo(pointer.y * 0.012);

        gsap.to(heroModelGroup.rotation, {
          y: 0,
          duration: 1.6,
          ease: "power2.out",
        });
      }

      // Ambient light returns to pristine flagship visibility
      gsap.to(ambientLight, {
        intensity: 0.90,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.to(directionalFill, {
        intensity: 0.32,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.to(modelKeySpot, {
        intensity: 3.4,
        duration: 0.8,
        ease: "power2.out",
      });
    }

    // Illuminate target alcove with practical architectural light
    alcoveRigs.forEach((rig) => {
      const isTarget = rig === hoveredRig;
      gsap.to(rig.spotLight, {
        intensity: isTarget ? 4.4 : 0.18,
        duration: 0.7,
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
      camXTo(pointer.x * 0.22);
      camYTo(BASE_CAM_Y + pointer.y * 0.08);
      camRotYTo(-pointer.x * 0.018);
      camRotXTo(pointer.y * 0.012);
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
      intensity: 12,
      duration: 0.65,
      ease: "power2.in",
    });
    gsap.to(bloomPass, {
      strength: 1.8,
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
  const introTl = gsap.timeline({ delay: 0.2 });

  introTl.to(
    backdropMat,
    { opacity: 0.45, duration: 1.2, ease: "power2.out" },
    0.3
  );

  introTl.to(
    backdropMat,
    { opacity: 1.0, duration: 1.2, ease: "power2.out" },
    1.4
  );

  introTl.to(
    heroModelMat,
    { opacity: 1.0, duration: 1.0, ease: "power2.out" },
    2.2
  );
  introTl.to(
    shadowTightMat,
    { opacity: 0.85, duration: 1.0, ease: "power2.out" },
    2.2
  );
  introTl.to(
    shadowSoftMat,
    { opacity: 0.4, duration: 1.0, ease: "power2.out" },
    2.2
  );
  introTl.to(
    modelKeySpot,
    { intensity: 3.4, duration: 1.2, ease: "power2.out" },
    2.4
  );
  introTl.to(
    modelRimSpot,
    { intensity: 2.2, duration: 1.2, ease: "power2.out" },
    2.6
  );

  alcoveRigs.forEach((rig, idx) => {
    introTl.to(
      rig.spotLight,
      { intensity: 0.18, duration: 0.8, ease: "power2.out" },
      3.2 + idx * 0.08
    );
  });

  // --- 8. Render Loop with Micro-Movement ---
  let rafId: number;
  const clock = new THREE.Clock();

  function tick() {
    const t = clock.getElapsedTime();

    if (!isTransitioning) {
      const breath = Math.sin(t * 1.1);
      heroModelMesh.position.y = breath * 0.005;
      heroModelMesh.scale.y = 1 + breath * 0.002;
      heroModelMesh.scale.x = 1 - breath * 0.001;
    }

    const pos = particleGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] -= 0.0012;
      if (pos[i * 3 + 1] < -baseFrustumH / 2) {
        pos[i * 3 + 1] = baseFrustumH / 2;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    composer.render();
    rafId = requestAnimationFrame(tick);
  }
  tick();

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
