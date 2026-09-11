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

  const editorialOverlay = document.querySelector<HTMLElement>("[data-editorial-overlay]");
  const flagshipPrompt = document.querySelector<HTMLElement>("[data-flagship-prompt]");
  const hudFranchise = document.querySelector<HTMLElement>("[data-hud-franchise]");
  const hudTitle = document.querySelector<HTMLElement>("[data-hud-title]");
  const hudTagline = document.querySelector<HTMLElement>("[data-hud-tagline]");
  const hudCta = document.querySelector<HTMLElement>("[data-hud-cta]");
  const worldBar = document.querySelector<HTMLElement>("[data-world-bar]");
  const campaignMarks = document.querySelectorAll<HTMLElement>(".campaign-mark");

  let activeHoveredWorld: World | null = null;
  let lastFocusedWorld: World | null = null;
  let isMouseOverOverlay = false;
  let isMouseOverBar = false;

  const canClearHover = () => !isMouseOverOverlay && !isMouseOverBar;

  function closeOverlayIfIdle() {
    if (!isMouseOverOverlay && !isMouseOverBar && !activeHoveredWorld) {
      editorialOverlay?.classList.remove("is-visible");
      flagshipPrompt?.classList.remove("is-dimmed");
      document.querySelectorAll<HTMLElement>(".editorial-ticker-item").forEach((item) => {
        item.classList.remove("is-active");
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

        if (!editorialOverlay) return;

        if (world) {
          const flank = world.xNorm <= 0 ? "left" : "right";
          editorialOverlay.dataset.flank = flank;

          if (hudFranchise) hudFranchise.textContent = world.franchise;
          if (hudTitle) hudTitle.textContent = world.name;
          if (hudTagline) hudTagline.textContent = world.tagline;
          editorialOverlay.style.setProperty("--hud-accent", world.accent);
          editorialOverlay.classList.add("is-visible");
          flagshipPrompt?.classList.add("is-dimmed");

          document.querySelectorAll<HTMLElement>(".editorial-ticker-item").forEach((item) => {
            item.classList.toggle("is-active", item.dataset.slug === world.slug);
          });
        } else if (!isMouseOverOverlay && !isMouseOverBar) {
          closeOverlayIfIdle();
        }
      },
      (world: World) => {
        if (wipe) {
          wipe.style.background = "#040406";
          gsap.to(wipe, {
            opacity: 1,
            duration: 0.55,
            ease: "power2.inOut",
          });
        }
        window.setTimeout(() => {
          window.location.href = `collection.html?world=${world.slug}`;
        }, 600);
      },

      canClearHover
    );

    // Keep overlay active if mouse moves directly onto it
    if (editorialOverlay) {
      editorialOverlay.addEventListener("mouseenter", () => {
        isMouseOverOverlay = true;
      });
      editorialOverlay.addEventListener("mouseleave", () => {
        isMouseOverOverlay = false;
        window.setTimeout(closeOverlayIfIdle, 350);
      });
    }

    // Wire up CTA link click
    hudCta?.addEventListener("click", (e) => {
      e.preventDefault();
      const targetWorld = activeHoveredWorld || lastFocusedWorld || WORLDS[0];
      if (targetWorld) {
        enterWorldBySlug(targetWorld.slug);
      }
    });

    // Populate bottom world ticker
    if (worldBar) {
      worldBar.addEventListener("mouseenter", () => {
        isMouseOverBar = true;
      });
      worldBar.addEventListener("mouseleave", () => {
        isMouseOverBar = false;
        window.setTimeout(closeOverlayIfIdle, 350);
      });

      worldBar.innerHTML = WORLDS.map((w, idx) => `
        <button type="button" class="editorial-ticker-item" data-slug="${w.slug}" style="--item-accent: ${w.accent}">
          ${w.name}
        </button>
        ${idx < WORLDS.length - 1 ? '<span class="editorial-ticker-sep">·</span>' : ''}
      `).join("");

      worldBar.querySelectorAll<HTMLElement>(".editorial-ticker-item").forEach((item) => {
        const slug = item.dataset.slug!;
        item.addEventListener("mouseenter", () => focusWorldBySlug(slug));
        item.addEventListener("click", () => enterWorldBySlug(slug));
      });
    }

    window.addEventListener("beforeunload", dispose, { once: true });

    // Staggered intro for subtle editorial UI marks
    gsap.to(campaignMarks, { opacity: 0.35, duration: 1.2, delay: 3.2, stagger: 0.1, ease: "power2.out" });
    if (worldBar) {
      gsap.to(worldBar, { opacity: 1, duration: 1.2, delay: 3.6, ease: "power2.out" });
    }
    if (flagshipPrompt) {
      gsap.to(flagshipPrompt, { opacity: 1, duration: 1.2, delay: 3.8, ease: "power2.out" });
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
