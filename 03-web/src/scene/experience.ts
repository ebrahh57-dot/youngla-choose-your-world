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
  batman: 0x9ec5ea,              // Nocturnal cool slate steel
  "the-boys": 0xdd4b4b,          // Deep industrial crimson
  "demon-slayer": 0x34d399,      // Sacred emerald pagoda wash
  "youngla-originals": 0xfff4e6, // Clean 3500K archival spotlight
  "attack-on-titan": 0x84cc16,   // Muted military scout olive
  "naruto-shippuden": 0xf97316,  // Warm amber chakra illumination
  "one-punch-man": 0xeab308      // Industrial hazard gold
};

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
  scene.fog = new THREE.FogExp2(0x040406, 0.014);

  const camera = new THREE.PerspectiveCamera(43, container.clientWidth / container.clientHeight, 0.1, 80);
  const BASE_CAM_Z = 7.6;
  const BASE_CAM_Y = 0.05;
  const BASE_CAM_X = 0;
  camera.position.set(BASE_CAM_X, BASE_CAM_Y, BASE_CAM_Z);

  const camLookTarget = new THREE.Vector3(0, 0.05, 0);
  camera.lookAt(camLookTarget);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  // --- Post-Processing: Restrained Filmic Bloom ---
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    0.18, // Subtle diffusion for architectural letters, never video-game glow
    0.35, // Radius
    0.90  // High threshold preserves photographic sharpness
  );
  composer.addPass(bloomPass);

  // --- 1. Monumental Architectural Rotunda Backdrop (Single Master Asset with Integrated Single Character) ---
  const conceptTex = textureLoader.load(`${base}assets/master/youngla_rotunda_master_hd.png`);
  conceptTex.colorSpace = THREE.SRGBColorSpace;
  conceptTex.minFilter = THREE.LinearMipmapLinearFilter;
  conceptTex.magFilter = THREE.LinearFilter;
  conceptTex.generateMipmaps = true;
  disposableTextures.push(conceptTex);

  // Frustum dimensions at Z=0 (native 2752 x 1536 aspect ratio)
  const baseFrustumH = 2 * BASE_CAM_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); // ~5.938
  const baseFrustumW = baseFrustumH * (2752 / 1536); // ~10.64

  // Curved cylindrical backdrop: outer edges curve back to create rotunda depth
  const segX = 48;
  const segY = 24;
  const backdropGeo = new THREE.PlaneGeometry(baseFrustumW, baseFrustumH, segX, segY);
  const posAttr = backdropGeo.attributes.position;
  const halfW = baseFrustumW / 2;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const curveSag = -Math.pow(x / halfW, 2) * 0.45;
    posAttr.setZ(i, curveSag);
  }
  backdropGeo.computeVertexNormals();

  // Standard PBR material for physical light and shadow response
  const backdropMat = new THREE.MeshStandardMaterial({
    map: conceptTex,
    side: THREE.FrontSide,
    transparent: true,
    opacity: 0,
    roughness: 0.78,
    metalness: 0.12,
  });
  const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
  backdropMesh.position.set(0, 0, 0);
  scene.add(backdropMesh);

  // --- 2. Dynamic Physical Architectural Lighting Rig ---
  // Ambient gallery light providing balanced visibility across all architecture (no black crush)
  const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.92);
  scene.add(ambientLight);

  // Overhead directional architectural ceiling light
  const ceilingLight = new THREE.DirectionalLight(0xfff4e6, 0.42);
  ceilingLight.position.set(0, 5.2, 4.0);
  scene.add(ceilingLight);

  // YOUNGLA Architectural Signage Light: practical light source right at the crown letters
  const signLight = new THREE.PointLight(0xffedd5, 1.8, 8.5, 1.4);
  signLight.position.set(0, 2.2, 0.5);
  scene.add(signLight);

  // Subtle ground bounce from dark reflective concrete
  const floorBounce = new THREE.DirectionalLight(0x38bdf8, 0.10);
  floorBounce.position.set(0, -3.0, 3.0);
  scene.add(floorBounce);

  // --- 3. Collaboration World Physical Installations (Physical Spotlights, Zero Fake Glow Forcefields) ---
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
    const worldZ = -Math.pow(worldX / halfW, 2) * 0.45;

    // Invisible Hit Zone for interaction
    const hitGeo = new THREE.PlaneGeometry(1.4, 3.6);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitPlane = new THREE.Mesh(hitGeo, hitMat);
    hitPlane.position.set(worldX, worldY, worldZ + 0.08);
    hitPlane.userData.slug = world.slug;
    scene.add(hitPlane);

    // Physical Directional Spotlight pointing into the portal installation
    const tintColor = ARCHITECTURAL_TINTS[world.slug] ?? 0xffffff;
    const spotLight = new THREE.SpotLight(new THREE.Color(tintColor), 0.55, 12, Math.PI / 4.4, 0.75, 1.2);
    spotLight.position.set(worldX, 2.6, worldZ + 1.5);
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

  // --- 4. Soft Atmospheric Floating Air Motes ---
  const particleCount = 35;
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
    size: 0.040,
    transparent: true,
    opacity: 0.10,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- 5. Interaction: Spatial Camera Hover & Physical Approach ---
  const pointer = { x: 0, y: 0 };
  const pointerNDC = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let hoveredRig: AlcoveRig | null = null;
  let isTransitioning = false;
  let hoverTimeout: number | null = null;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setHover(nextRig: AlcoveRig | null) {
    if (nextRig === hoveredRig || isTransitioning) return;
    hoveredRig = nextRig;

    if (hoveredRig) {
      soundFX.playHover();
      onWorldFocus(hoveredRig.world);
      container.style.cursor = "pointer";

      // ORBIT -> FOCUS -> APPROACH
      // Camera physically dollies toward the selected portal:
      // Approaches from Z=7.6 to Z=5.2 (stopping cleanly before entering)
      if (!reduceMotion) {
        const targetX = hoveredRig.worldX * 0.42;
        const targetY = BASE_CAM_Y + 0.05;
        const targetZ = BASE_CAM_Z - 2.4; // 5.2

        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(camLookTarget);

        gsap.to(camera.position, {
          x: targetX,
          y: targetY,
          z: targetZ,
          duration: 1.4,
          ease: "power2.out",
        });

        gsap.to(camLookTarget, {
          x: hoveredRig.worldX * 0.68,
          y: hoveredRig.worldY + 0.08,
          z: hoveredRig.worldZ,
          duration: 1.4,
          ease: "power2.out",
        });
      }

      // Hierarchy: selected world gains architectural focus
      gsap.to(ambientLight, {
        intensity: 0.60,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.to(ceilingLight, {
        intensity: 0.28,
        duration: 0.8,
        ease: "power2.out",
      });

      alcoveRigs.forEach((rig) => {
        const isTarget = rig === hoveredRig;
        gsap.to(rig.spotLight, {
          intensity: isTarget ? 4.2 : 0.28, // Other worlds stay visible, not black holes
          duration: 0.7,
          ease: "power2.out",
        });
      });
    } else {
      onWorldFocus(null);
      container.style.cursor = "default";

      if (!reduceMotion) {
        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(camLookTarget);

        gsap.to(camera.position, {
          x: pointer.x * 0.18,
          y: BASE_CAM_Y + pointer.y * 0.06,
          z: BASE_CAM_Z,
          duration: 1.4,
          ease: "power2.out",
        });

        gsap.to(camLookTarget, {
          x: 0,
          y: 0.05,
          z: 0,
          duration: 1.4,
          ease: "power2.out",
        });
      }

      // Ambient and directional return to full flagship visibility
      gsap.to(ambientLight, {
        intensity: 0.92,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.to(ceilingLight, {
        intensity: 0.42,
        duration: 0.8,
        ease: "power2.out",
      });

      alcoveRigs.forEach((rig) => {
        gsap.to(rig.spotLight, {
          intensity: 0.55,
          duration: 0.8,
          ease: "power2.out",
        });
      });
    }
  }

  function onPointerMove(e: PointerEvent) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerNDC.set(pointer.x, pointer.y);

    if (!hoveredRig && !reduceMotion && !isTransitioning) {
      gsap.to(camera.position, {
        x: pointer.x * 0.18,
        y: BASE_CAM_Y + pointer.y * 0.06,
        duration: 1.6,
        ease: "power2.out",
        overwrite: "auto",
      });
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
      }, 350);
    }
  }
  container.addEventListener("pointermove", onPointerMove);

  // --- 6. Transition: Cinematic Portal Entry into Natural Darkness (No White Flash) ---
  function enterWorld(rig: AlcoveRig) {
    if (isTransitioning) return;
    isTransitioning = true;
    soundFX.playEnter();
    container.style.cursor = "default";

    // 01 & 02: Camera accelerates from hover position (Z=5.2) directly toward portal
    const targetX = rig.worldX * 0.85;
    const targetY = rig.worldY + 0.06;
    const targetZ = 2.0;

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(camLookTarget);

    gsap.to(camera.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 0.95,
      ease: "power3.inOut",
    });

    gsap.to(camLookTarget, {
      x: rig.worldX,
      y: rig.worldY + 0.05,
      z: rig.worldZ,
      duration: 0.95,
      ease: "power3.inOut",
    });

    // 03: Selected world spotlight intensifies; surrounding environment drops into shadows
    gsap.to(rig.spotLight, {
      intensity: 6.0,
      duration: 0.6,
      ease: "power2.in",
    });
    gsap.to(ambientLight, {
      intensity: 0.02,
      duration: 0.7,
      ease: "power2.in",
    });
    gsap.to(ceilingLight, {
      intensity: 0.0,
      duration: 0.6,
      ease: "power2.in",
    });

    // Subdued, luxury photographic bloom (NO flash explosion)
    gsap.to(bloomPass, {
      strength: 0.20,
      duration: 0.6,
    });

    // 04 & 05: Trigger callback to fade to black and navigate
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

  // --- 7. Intro Sequence ---
  const introTl = gsap.timeline({ delay: 0.2 });
  introTl.to(
    backdropMat,
    { opacity: 1.0, duration: 1.4, ease: "power2.out" },
    0.3
  );

  alcoveRigs.forEach((rig, idx) => {
    introTl.to(
      rig.spotLight,
      { intensity: 0.55, duration: 0.8, ease: "power2.out" },
      1.2 + idx * 0.08
    );
  });

  // --- 8. Render Loop ---
  let rafId: number;
  function tick() {
    camera.lookAt(camLookTarget);

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
