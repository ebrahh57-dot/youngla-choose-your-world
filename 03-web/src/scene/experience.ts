import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import gsap from "gsap";
import { WORLDS, type World, type CrestShape } from "../worlds";
import { soundFX } from "./audio";

export interface ExperienceHandles {
  dispose: () => void;
  focusWorldBySlug: (slug: string) => void;
  enterWorldBySlug: (slug: string) => void;
}

function createCrestGeometry(shape: CrestShape): THREE.BufferGeometry {
  switch (shape) {
    case "bat": {
      const shape2D = new THREE.Shape();
      shape2D.moveTo(0, 0.35);
      shape2D.lineTo(0.15, 0.45);
      shape2D.lineTo(0.12, 0.25);
      shape2D.lineTo(0.35, 0.4);
      shape2D.lineTo(0.55, 0.1);
      shape2D.lineTo(0.4, -0.15);
      shape2D.lineTo(0.18, -0.05);
      shape2D.lineTo(0, -0.3);
      shape2D.lineTo(-0.18, -0.05);
      shape2D.lineTo(-0.4, -0.15);
      shape2D.lineTo(-0.55, 0.1);
      shape2D.lineTo(-0.35, 0.4);
      shape2D.lineTo(-0.12, 0.25);
      shape2D.lineTo(-0.15, 0.45);
      shape2D.closePath();
      return new THREE.ExtrudeGeometry(shape2D, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
    }
    case "vought": {
      const shape2D = new THREE.Shape();
      shape2D.moveTo(-0.35, 0.38);
      shape2D.lineTo(-0.14, 0.38);
      shape2D.lineTo(0, -0.28);
      shape2D.lineTo(0.14, 0.38);
      shape2D.lineTo(0.35, 0.38);
      shape2D.lineTo(0.08, -0.42);
      shape2D.lineTo(-0.08, -0.42);
      shape2D.closePath();
      return new THREE.ExtrudeGeometry(shape2D, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
    }
    case "katana":
      return new THREE.TorusGeometry(0.32, 0.04, 12, 32);
    case "wings":
      return new THREE.DodecahedronGeometry(0.32, 0);
    case "swirl":
      return new THREE.TorusKnotGeometry(0.24, 0.06, 64, 12, 2, 3);
    case "hexagon":
      return new THREE.IcosahedronGeometry(0.32, 0);
    case "diamond":
    default:
      return new THREE.OctahedronGeometry(0.34, 0);
  }
}

function createMarqueeTexture(title: string, franchise: string, accentHex: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0c0d10";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  ctx.fillStyle = accentHex;
  [ [24, 24], [canvas.width - 24, 24], [24, canvas.height - 24], [canvas.width - 24, canvas.height - 24] ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(235, 235, 240, 0.85)";
  ctx.font = "600 32px Archivo, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(franchise.toUpperCase(), canvas.width / 2, 70);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 82px Bebas Neue, Archivo, sans-serif";
  ctx.fillText(title.toUpperCase(), canvas.width / 2, 160);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createGroundDiscTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  const center = 512;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(center, center, 490, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(center, center, 450, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(center, center, 360, 0, Math.PI * 2);
  ctx.stroke();

  const ticks = 48;
  for (let i = 0; i < ticks; i++) {
    const angle = (i / ticks) * Math.PI * 2;
    const r1 = i % 4 === 0 ? 460 : 475;
    const r2 = 488;
    ctx.strokeStyle = i % 4 === 0 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)";
    ctx.lineWidth = i % 4 === 0 ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(center + Math.cos(angle) * r1, center + Math.sin(angle) * r1);
    ctx.lineTo(center + Math.cos(angle) * r2, center + Math.sin(angle) * r2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createTotemTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#121215";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 48px Bebas Neue, Archivo, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ENTER WORLD", canvas.width / 2, 100);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 35, 175);
  ctx.lineTo(canvas.width / 2 + 35, 175);
  ctx.lineTo(canvas.width / 2 + 15, 160);
  ctx.moveTo(canvas.width / 2 + 35, 175);
  ctx.lineTo(canvas.width / 2 + 15, 190);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
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

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060608);
  scene.fog = new THREE.FogExp2(0x060608, 0.02);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 150);
  const cameraRig = new THREE.Group();
  scene.add(cameraRig);

  const BASE_CAM_Y = 1.82;
  const BASE_CAM_Z = 7.6;
  camera.position.set(0, BASE_CAM_Y, BASE_CAM_Z);
  camera.lookAt(0, 2.15, -2.5);
  cameraRig.add(camera);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    0.38,
    0.35,
    0.82
  );
  composer.addPass(bloomPass);

  // ---- Rotunda Wall Architecture --------------------------------------------
  const ROOM_RADIUS = 13.8;
  const ROTUNDA_H = 11.5;

  const base = import.meta.env.BASE_URL || "./";
  const rotundaTex = textureLoader.load(`${base}assets/master/youngla_rotunda_clean.png`);
  rotundaTex.colorSpace = THREE.SRGBColorSpace;
  disposableTextures.push(rotundaTex);

  // Cylinder geometry around origin, visible from inside
  const rotundaGeo = new THREE.CylinderGeometry(
    ROOM_RADIUS,
    ROOM_RADIUS,
    ROTUNDA_H,
    64,
    1,
    true,
    0,
    Math.PI * 2
  );
  const rotundaMat = new THREE.MeshBasicMaterial({
    map: rotundaTex,
    side: THREE.BackSide,
  });
  const rotunda = new THREE.Mesh(rotundaGeo, rotundaMat);
  rotunda.position.y = ROTUNDA_H / 2 - 0.2;
  scene.add(rotunda);

  // Top Architectural Beam: 3D Header Sign
  const headerTex = textureLoader.load(`${base}assets/worlds/youngla-header.png`);
  headerTex.colorSpace = THREE.SRGBColorSpace;
  disposableTextures.push(headerTex);

  const headerGeo = new THREE.PlaneGeometry(8.5, 3.2);
  const headerMat = new THREE.MeshBasicMaterial({
    map: headerTex,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  });
  const headerMesh = new THREE.Mesh(headerGeo, headerMat);
  headerMesh.position.set(0, 8.1, -11.5);
  scene.add(headerMesh);

  // Concrete Colonnade Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.24, 0.32, ROTUNDA_H, 16);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c20,
    roughness: 0.8,
    metalness: 0.2,
  });
  const PILLAR_COUNT = 12;
  for (let i = 0; i < PILLAR_COUNT; i++) {
    const angle = (i / PILLAR_COUNT) * Math.PI * 2;
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(Math.sin(angle) * (ROOM_RADIUS - 0.3), ROTUNDA_H / 2, -Math.cos(angle) * (ROOM_RADIUS - 0.3));
    scene.add(pillar);
  }

  // Polished Mirror Floor
  const floorBase = new THREE.Mesh(
    new THREE.CircleGeometry(ROOM_RADIUS * 1.05, 64),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.45, metalness: 0.4 })
  );
  floorBase.rotation.x = -Math.PI / 2;
  scene.add(floorBase);

  const floorReflector = new Reflector(new THREE.CircleGeometry(ROOM_RADIUS * 0.98, 64), {
    color: 0x141418,
    textureWidth: Math.min(window.innerWidth * window.devicePixelRatio, 1536),
    textureHeight: Math.min(window.innerHeight * window.devicePixelRatio, 1536),
    clipBias: 0.003,
  });
  floorReflector.rotation.x = -Math.PI / 2;
  floorReflector.position.y = 0.012;
  scene.add(floorReflector);

  // Glowing Neon Floor Track Rings
  const groundDiscTex = createGroundDiscTexture();
  disposableTextures.push(groundDiscTex);
  const groundRingMat = new THREE.MeshBasicMaterial({
    map: groundDiscTex,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const groundRingMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 10.8), groundRingMat);
  groundRingMesh.rotation.x = -Math.PI / 2;
  groundRingMesh.position.set(0, 0.02, 3.2);
  scene.add(groundRingMesh);

  // Central Platform
  const PLATFORM_Z = 3.2;
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.65, 1.82, 0.14, 48),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.55, metalness: 0.35 })
  );
  platform.position.set(0, 0.07, PLATFORM_Z);
  scene.add(platform);

  const platformGlowRing = new THREE.Mesh(
    new THREE.RingGeometry(1.68, 1.76, 48),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
  );
  platformGlowRing.rotation.x = -Math.PI / 2;
  platformGlowRing.position.set(0, 0.145, PLATFORM_Z);
  scene.add(platformGlowRing);

  // Floor Totem Sign: "ENTER WORLD ->"
  const totemTex = createTotemTexture();
  disposableTextures.push(totemTex);
  const totemMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.36),
    new THREE.MeshBasicMaterial({ map: totemTex, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
  );
  totemMesh.position.set(0, 0.35, PLATFORM_Z - 1.4);
  scene.add(totemMesh);

  // ---- Lighting ------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const modelKeySpot = new THREE.SpotLight(0xffffff, 3.5, 18, Math.PI / 6, 0.45, 1.5);
  modelKeySpot.position.set(0, 7.8, PLATFORM_Z + 2.5);
  modelKeySpot.target.position.set(0, 1.2, PLATFORM_Z);
  scene.add(modelKeySpot, modelKeySpot.target);

  const modelRimLight = new THREE.SpotLight(0xdbeafe, 2.8, 14, Math.PI / 5, 0.5, 1.3);
  modelRimLight.position.set(0, 4.5, PLATFORM_Z - 2.5);
  modelRimLight.target.position.set(0, 1.4, PLATFORM_Z);
  scene.add(modelRimLight, modelRimLight.target);

  // ---- Central Model (Fashion Model Cutout) ---------------------------------
  const charBackTex = textureLoader.load(`${base}assets/character/youngla_character_back.png`);
  charBackTex.colorSpace = THREE.SRGBColorSpace;
  const charLeftTex = textureLoader.load(`${base}assets/character/youngla_character_left.png`);
  charLeftTex.colorSpace = THREE.SRGBColorSpace;
  const charRightTex = textureLoader.load(`${base}assets/character/youngla_character_right.png`);
  charRightTex.colorSpace = THREE.SRGBColorSpace;
  disposableTextures.push(charBackTex, charLeftTex, charRightTex);

  const charHeight = 2.35;
  const charAspect = 315 / 740;
  const charWidth = charHeight * charAspect;

  const charGeo = new THREE.PlaneGeometry(charWidth, charHeight);
  const charMat = new THREE.MeshBasicMaterial({
    map: charBackTex,
    transparent: true,
    alphaTest: 0.05,
    side: THREE.DoubleSide,
  });

  const characterGroup = new THREE.Group();
  const characterMesh = new THREE.Mesh(charGeo, charMat);
  characterMesh.position.y = charHeight / 2 + 0.14;
  characterGroup.add(characterMesh);

  const shadowGeo = new THREE.PlaneGeometry(charWidth * 1.2, 0.45);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.75,
    blending: THREE.MultiplyBlending,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(0, 0.142, 0);
  characterGroup.add(shadowMesh);

  characterGroup.position.set(0, 0, PLATFORM_Z);
  scene.add(characterGroup);

  // ---- World Vitrines -------------------------------------------------------
  const VITRINE_DIST = 9.8;
  const VITRINE_W = 2.65;
  const VITRINE_H = 5.6;
  const VITRINE_D = 1.4;

  interface VitrineRig {
    world: World;
    group: THREE.Group;
    hitPlane: THREE.Mesh;
    backdropMesh: THREE.Mesh;
    backdropMat: THREE.MeshBasicMaterial;
    marqueeMesh: THREE.Mesh;
    crestMesh: THREE.Mesh;
    spotLight: THREE.SpotLight;
    neonBar: THREE.Mesh;
    baseIntensity: number;
    hoverIntensity: number;
  }

  const vitrines: VitrineRig[] = WORLDS.map((world) => {
    const group = new THREE.Group();
    const rad = (world.angle * Math.PI) / 180;
    group.position.set(Math.sin(rad) * VITRINE_DIST, 0, -Math.cos(rad) * VITRINE_DIST);
    group.rotation.y = -rad;

    const accentColor = new THREE.Color(world.accent);

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c20,
      roughness: 0.8,
      metalness: 0.25,
    });
    const colGeo = new THREE.BoxGeometry(0.18, VITRINE_H, 0.35);
    const colLeft = new THREE.Mesh(colGeo, frameMat);
    colLeft.position.set(-VITRINE_W / 2, VITRINE_H / 2, 0);
    const colRight = new THREE.Mesh(colGeo, frameMat);
    colRight.position.set(VITRINE_W / 2, VITRINE_H / 2, 0);

    const lintelGeo = new THREE.BoxGeometry(VITRINE_W + 0.2, 0.28, 0.42);
    const lintel = new THREE.Mesh(lintelGeo, frameMat);
    lintel.position.set(0, VITRINE_H - 0.14, 0);

    const basePlinthGeo = new THREE.BoxGeometry(VITRINE_W + 0.2, 0.22, VITRINE_D);
    const basePlinth = new THREE.Mesh(basePlinthGeo, frameMat);
    basePlinth.position.set(0, 0.11, 0);

    group.add(colLeft, colRight, lintel, basePlinth);

    const worldTexture = textureLoader.load(world.assetUrl);
    worldTexture.colorSpace = THREE.SRGBColorSpace;
    disposableTextures.push(worldTexture);

    const backdropGeo = new THREE.PlaneGeometry(VITRINE_W - 0.25, VITRINE_H - 0.8);
    const backdropMat = new THREE.MeshBasicMaterial({
      map: worldTexture,
      side: THREE.DoubleSide,
    });
    const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
    backdropMesh.position.set(0, (VITRINE_H - 0.8) / 2 + 0.25, -VITRINE_D / 2 + 0.05);
    group.add(backdropMesh);

    const marqueeTex = createMarqueeTexture(world.name, world.franchise, world.accent);
    disposableTextures.push(marqueeTex);
    const marqueeGeo = new THREE.PlaneGeometry(VITRINE_W - 0.1, 0.65);
    const marqueeMat = new THREE.MeshBasicMaterial({ map: marqueeTex, transparent: true, side: THREE.DoubleSide });
    const marqueeMesh = new THREE.Mesh(marqueeGeo, marqueeMat);
    marqueeMesh.position.set(0, VITRINE_H + 0.42, 0.05);
    group.add(marqueeMesh);

    const crestGeo = createCrestGeometry(world.crestShape);
    const crestMat = new THREE.MeshStandardMaterial({
      color: 0x111114,
      emissive: accentColor,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.85,
    });
    const crestMesh = new THREE.Mesh(crestGeo, crestMat);
    crestMesh.position.set(0, VITRINE_H * 0.78, 0.15);
    group.add(crestMesh);

    const neonGeo = new THREE.BoxGeometry(VITRINE_W * 0.85, 0.04, 0.04);
    const neonMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.85 });
    const neonBar = new THREE.Mesh(neonGeo, neonMat);
    neonBar.position.set(0, 0.23, VITRINE_D / 2 - 0.02);
    group.add(neonBar);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.08,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const hitPlaneGeo = new THREE.PlaneGeometry(VITRINE_W, VITRINE_H);
    const hitPlane = new THREE.Mesh(hitPlaneGeo, glassMat);
    hitPlane.position.set(0, VITRINE_H / 2, VITRINE_D / 2);
    hitPlane.userData.slug = world.slug;
    group.add(hitPlane);

    const spotLight = new THREE.SpotLight(accentColor, 4.0, 14, Math.PI / 8, 0.4, 1.4);
    spotLight.position.set(0, VITRINE_H + 1.2, 0.6);
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, VITRINE_H * 0.45, 0);
    group.add(spotTarget);
    spotLight.target = spotTarget;
    group.add(spotLight);

    scene.add(group);

    return {
      world,
      group,
      hitPlane,
      backdropMesh,
      backdropMat,
      marqueeMesh,
      crestMesh,
      spotLight,
      neonBar,
      baseIntensity: 4.0,
      hoverIntensity: 11.0,
    };
  });

  // Atmospheric Particles
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 20;
    particlePositions[i * 3 + 1] = Math.random() * 8 + 0.5;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.045,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Mouse Interaction & Parallax
  const pointer = { x: 0, y: 0 };
  const pointerNDC = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let hoveredRig: VitrineRig | null = null;
  let isTransitioning = false;
  let hoverTimeout: number | null = null;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yawTo = gsap.quickTo(cameraRig.rotation, "y", { duration: 1.1, ease: "power2.out" });
  const pitchTo = gsap.quickTo(cameraRig.rotation, "x", { duration: 1.2, ease: "power2.out" });
  const camXTo = gsap.quickTo(camera.position, "x", { duration: 1.2, ease: "power2.out" });
  const camZTo = gsap.quickTo(camera.position, "z", { duration: 1.2, ease: "power2.out" });

  function setHover(nextRig: VitrineRig | null) {
    if (nextRig === hoveredRig || isTransitioning) return;
    hoveredRig = nextRig;

    if (hoveredRig) {
      soundFX.playHover();
      onWorldFocus(hoveredRig.world);
      container.style.cursor = "pointer";

      const rad = (hoveredRig.world.angle * Math.PI) / 180;
      if (!reduceMotion) {
        gsap.to(characterGroup.rotation, { y: rad * 0.42, duration: 0.8, ease: "power2.out" });
        if (hoveredRig.world.angle < -30) {
          charMat.map = charLeftTex;
        } else if (hoveredRig.world.angle > 30) {
          charMat.map = charRightTex;
        } else {
          charMat.map = charBackTex;
        }
        charMat.needsUpdate = true;

        yawTo(rad * 0.32 + pointer.x * 0.05);
        camXTo(Math.sin(rad) * 1.4);
        camZTo(BASE_CAM_Z - 0.75);
      }
    } else {
      onWorldFocus(null);
      container.style.cursor = "default";
      if (!reduceMotion) {
        charMat.map = charBackTex;
        charMat.needsUpdate = true;
        gsap.to(characterGroup.rotation, { y: 0, duration: 0.8, ease: "power2.out" });
        yawTo(pointer.x * 0.18);
        pitchTo(pointer.y * -0.025);
        camXTo(0);
        camZTo(BASE_CAM_Z);
      }
    }

    vitrines.forEach((v) => {
      const isTarget = v === hoveredRig;
      const isDimmed = hoveredRig && !isTarget;

      gsap.to(v.spotLight, {
        intensity: isTarget ? v.hoverIntensity : isDimmed ? 0.8 : v.baseIntensity,
        duration: 0.7,
        ease: "power2.out",
      });
      gsap.to(v.crestMesh.scale, {
        x: isTarget ? 1.35 : 1,
        y: isTarget ? 1.35 : 1,
        z: isTarget ? 1.35 : 1,
        duration: 0.7,
        ease: "back.out(1.5)",
      });
      gsap.to(v.neonBar.scale, {
        x: isTarget ? 1.15 : 1,
        y: isTarget ? 2.5 : 1,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.to(v.group.scale, {
        x: isTarget ? 1.05 : 1,
        y: isTarget ? 1.05 : 1,
        z: isTarget ? 1.05 : 1,
        duration: 0.7,
        ease: "power2.out",
      });
    });
  }

  function onPointerMove(e: PointerEvent) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    pointerNDC.set(pointer.x, -pointer.y);

    if (!hoveredRig && !reduceMotion) {
      yawTo(pointer.x * 0.22);
      pitchTo(pointer.y * -0.035);
      camXTo(pointer.x * 0.4);
    }

    raycaster.setFromCamera(pointerNDC, camera);
    const intersects = raycaster.intersectObjects(vitrines.map((v) => v.hitPlane));
    if (intersects.length > 0) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      const slug = intersects[0].object.userData.slug as string;
      const rig = vitrines.find((v) => v.world.slug === slug) ?? null;
      setHover(rig);
    } else if (hoveredRig && !hoverTimeout) {
      hoverTimeout = window.setTimeout(() => {
        if (canClearHover && !canClearHover()) {
          hoverTimeout = null;
          return;
        }
        setHover(null);
        hoverTimeout = null;
      }, 500);
    }
  }
  container.addEventListener("pointermove", onPointerMove);

  function enterWorld(rig: VitrineRig) {
    if (isTransitioning) return;
    isTransitioning = true;
    soundFX.playEnter();
    container.style.cursor = "default";

    const rad = (rig.world.angle * Math.PI) / 180;
    const targetX = Math.sin(rad) * (VITRINE_DIST - 2.2);
    const targetZ = -Math.cos(rad) * (VITRINE_DIST - 2.2);

    gsap.to(cameraRig.rotation, { y: rad, duration: 0.8, ease: "power3.inOut" });
    gsap.to(camera.position, { x: targetX, y: 2.2, z: targetZ, duration: 0.8, ease: "power3.in" });
    gsap.to(camera, { fov: 68, duration: 0.8, ease: "power2.in", onUpdate: () => camera.updateProjectionMatrix() });
    gsap.to(characterGroup.position, { y: -2.0, duration: 0.6, ease: "power2.in" });
    gsap.to(charMat, { opacity: 0, duration: 0.4, ease: "power1.in" });
    gsap.to(rig.spotLight, { intensity: 18, duration: 0.7, ease: "power2.in" });
    gsap.to(bloomPass, { strength: 1.8, duration: 0.7, ease: "power2.in" });

    window.setTimeout(() => {
      onWorldEnter(rig.world);
    }, 450);
  }

  function onClick() {
    if (hoveredRig) enterWorld(hoveredRig);
  }
  container.addEventListener("click", onClick);

  function focusWorldBySlug(slug: string) {
    const rig = vitrines.find((v) => v.world.slug === slug || v.world.id === slug) ?? null;
    setHover(rig);
  }

  function enterWorldBySlug(slug: string) {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    const rig = vitrines.find((v) => v.world.slug === slug || v.world.id === slug);
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

  // Progressive Intro
  const introTl = gsap.timeline({ delay: 0.15 });
  modelKeySpot.intensity = 0;
  modelRimLight.intensity = 0;
  headerMat.opacity = 0;
  groundRingMat.opacity = 0;
  vitrines.forEach((v) => {
    v.spotLight.intensity = 0;
  });

  introTl.to(modelKeySpot, { intensity: 3.5, duration: 1.6, ease: "power2.out" }, 0.3);
  introTl.to(modelRimLight, { intensity: 2.8, duration: 1.4, ease: "power2.out" }, 0.4);
  introTl.to(headerMat, { opacity: 0.95, duration: 1.2, ease: "power2.out" }, 0.8);
  introTl.to(groundRingMat, { opacity: 0.85, duration: 1.4, ease: "power2.out" }, 0.9);

  vitrines.forEach((v, i) => {
    introTl.to(
      v.spotLight,
      { intensity: v.baseIntensity, duration: 0.9, ease: "power2.out" },
      1.1 + i * 0.1
    );
  });

  // Render Loop
  let rafId: number;
  const clock = new THREE.Clock();

  function tick() {
    const t = clock.getElapsedTime();

    vitrines.forEach((v, idx) => {
      v.crestMesh.rotation.y = t * 0.45 + idx * 0.5;
      v.crestMesh.rotation.x = Math.sin(t * 0.8 + idx) * 0.12;
      v.crestMesh.position.y = VITRINE_H * 0.78 + Math.sin(t * 1.5 + idx) * 0.05;
    });

    if (!isTransitioning) {
      characterGroup.position.y = Math.sin(t * 1.8) * 0.012;
    }

    const pos = particleGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] -= 0.003;
      if (pos[i * 3 + 1] < 0.2) pos[i * 3 + 1] = 8.5;
    }
    particleGeo.attributes.position.needsUpdate = true;

    composer.render();
    rafId = requestAnimationFrame(tick);
  }
  tick();

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.setSize(w, h);
  }
  const ro = new ResizeObserver(onResize);
  ro.observe(container);

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
