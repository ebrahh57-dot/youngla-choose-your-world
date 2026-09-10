import gsap from "gsap";
import { WORLDS, type World } from "./worlds";
import { soundFX } from "./scene/audio";

const DESKTOP_QUERY = "(min-width: 861px)";

const loader = document.getElementById("loader")!;
const loaderFill = document.getElementById("loader-fill")!;
const nav = document.querySelector<HTMLElement>("[data-nav]")!;
const wipe = document.getElementById("wipe")!;
const soundBtn = document.getElementById("sound-btn");

function runLoader(onDone: () => void) {
  const minDuration = 800;
  loaderFill.style.transition = `width ${minDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
  requestAnimationFrame(() => {
    loaderFill.style.width = "100%";
  });
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    nav.classList.add("is-visible");
    onDone();
  }, minDuration);
}

function initDesktop() {
  const container = document.getElementById("canvas-root");
  if (!container) return;

  const hud = document.querySelector<HTMLElement>("[data-world-hud]");
  const hudFranchise = document.querySelector<HTMLElement>("[data-hud-franchise]");
  const hudTitle = document.querySelector<HTMLElement>("[data-hud-title]");
  const hudTagline = document.querySelector<HTMLElement>("[data-hud-tagline]");
  const hudGarment = document.querySelector<HTMLElement>("[data-hud-garment]");
  const hudPrice = document.querySelector<HTMLElement>("[data-hud-price]");
  const hudCta = document.querySelector<HTMLElement>("[data-hud-cta]");
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  const kickers = document.querySelectorAll<HTMLElement>("[data-kicker]");
  const worldBar = document.querySelector<HTMLElement>("[data-world-bar]");

  let activeHoveredWorld: World | null = null;
  let lastFocusedWorld: World | null = null;
  let isMouseOverHud = false;
  let isMouseOverBar = false;

  const canClearHover = () => !isMouseOverHud && !isMouseOverBar;

  function closeHudIfIdle() {
    if (!isMouseOverHud && !isMouseOverBar && !activeHoveredWorld) {
      hud?.classList.remove("is-visible");
      hero?.style.setProperty("opacity", "1");
      document.querySelectorAll<HTMLElement>(".world-pill").forEach((pill) => {
        pill.classList.remove("is-active");
      });
    }
  }

  import("./scene/experience").then(({ initExperience }) => {
    const { dispose, focusWorldBySlug, enterWorldBySlug } = initExperience(
      container,
      (world: World | null) => {
        activeHoveredWorld = world;
        if (world) {
          lastFocusedWorld = world;
        }

        if (!hud) return;

        if (world) {
          if (hudFranchise) hudFranchise.textContent = world.franchise;
          if (hudTitle) hudTitle.textContent = world.name;
          if (hudTagline) hudTagline.textContent = world.tagline;
          if (hudGarment) hudGarment.textContent = world.garment;
          if (hudPrice) hudPrice.textContent = world.price;
          hud.style.setProperty("--hud-accent", world.accent);
          hud.classList.add("is-visible");
          hero?.style.setProperty("opacity", "0.25");

          document.querySelectorAll<HTMLElement>(".world-pill").forEach((pill) => {
            pill.classList.toggle("is-active", pill.dataset.slug === world.slug);
          });
        } else if (!isMouseOverHud && !isMouseOverBar) {
          closeHudIfIdle();
        }
      },
      (world: World) => {
        wipe.style.setProperty("--wipe-accent", world.accent);
        gsap.to(wipe, {
          opacity: 1,
          duration: 0.35,
          ease: "power2.in",
        });
        window.setTimeout(() => {
          window.location.href = `collection.html?world=${world.slug}`;
        }, 350);
      },
      canClearHover
    );

    // Keep HUD open when mouse enters it
    if (hud) {
      hud.addEventListener("mouseenter", () => {
        isMouseOverHud = true;
      });
      hud.addEventListener("mouseleave", () => {
        isMouseOverHud = false;
        window.setTimeout(closeHudIfIdle, 350);
      });
    }

    // Wire up HUD CTA click
    hudCta?.addEventListener("click", () => {
      const targetWorld = activeHoveredWorld || lastFocusedWorld || WORLDS[0];
      if (targetWorld) {
        enterWorldBySlug(targetWorld.slug);
      }
    });

    // Populate bottom world switcher bar
    if (worldBar) {
      worldBar.addEventListener("mouseenter", () => {
        isMouseOverBar = true;
      });
      worldBar.addEventListener("mouseleave", () => {
        isMouseOverBar = false;
        window.setTimeout(closeHudIfIdle, 350);
      });

      worldBar.innerHTML = WORLDS.map(
        (w) => `<button type="button" class="world-pill" data-slug="${w.slug}" style="--pill-accent: ${w.accent}">
          <span class="world-pill-dot"></span>
          <span class="world-pill-text">${w.name}</span>
        </button>`
      ).join("");

      worldBar.querySelectorAll<HTMLElement>(".world-pill").forEach((pill) => {
        const slug = pill.dataset.slug!;
        pill.addEventListener("mouseenter", () => focusWorldBySlug(slug));
        pill.addEventListener("click", () => enterWorldBySlug(slug));
      });
    }

    window.addEventListener("beforeunload", dispose, { once: true });

    gsap.timeline({ delay: 1.8 }).to(
      [hero?.querySelector(".hero-wordmark"), hero?.querySelector(".hero-tagline"), hero?.querySelector(".hero-sub")],
      { opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out" }
    );
    gsap.to(kickers, { opacity: 1, duration: 1.0, delay: 2.2, stagger: 0.08, ease: "power3.out" });
    if (worldBar) {
      gsap.to(worldBar, { opacity: 1, duration: 1.0, delay: 2.4, ease: "power3.out" });
    }
  });
}

function initMobile() {
  import("./mobile").then(({ renderMobileWorlds }) => renderMobileWorlds());
}

if (soundBtn) {
  soundBtn.addEventListener("click", () => {
    const isEnabled = soundFX.toggle();
    soundBtn.textContent = isEnabled ? "SOUND [ON]" : "SOUND [OFF]";
    soundBtn.classList.toggle("is-active", isEnabled);
  });
}

const cartCount = document.getElementById("cart-count");
if (cartCount) {
  const stored = localStorage.getItem("youngla_cart_items");
  const count = stored ? JSON.parse(stored).length : 0;
  cartCount.textContent = String(count);
}

let currentIsDesktop: boolean | null = null;
function boot() {
  const isDesktop = window.matchMedia(DESKTOP_QUERY).matches;
  if (currentIsDesktop === isDesktop) return;
  currentIsDesktop = isDesktop;
  runLoader(() => {
    if (isDesktop) initDesktop();
    else initMobile();
  });
}

boot();

window.matchMedia(DESKTOP_QUERY).addEventListener("change", () => {
  window.location.reload();
});
