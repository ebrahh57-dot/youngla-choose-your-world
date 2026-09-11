import gsap from "gsap";
import { WORLDS, getWorldBySlug } from "./worlds";

const params = new URLSearchParams(window.location.search);
const worldSlug = params.get("world") || "youngla-originals";
const world = getWorldBySlug(worldSlug) || WORLDS[0];

const root = document.querySelector<HTMLElement>("[data-collection]");
const eyebrow = document.querySelector<HTMLElement>("[data-eyebrow]");
const title = document.querySelector<HTMLElement>("[data-title]");
const tagline = document.querySelector<HTMLElement>("[data-tagline]");
const garment = document.querySelector<HTMLElement>("[data-garment]");
const price = document.querySelector<HTMLElement>("[data-price]");
const description = document.querySelector<HTMLElement>("[data-description]");
const mainImg = document.getElementById("main-asset-img") as HTMLImageElement;
const badgeFranchise = document.getElementById("badge-franchise");
const colorSwatchesContainer = document.getElementById("color-swatches");
const activeColorName = document.getElementById("active-color-name");
const sizeButtons = document.querySelectorAll<HTMLElement>(".size-btn");
const specsList = document.getElementById("specs-list");
const otherWorldsGrid = document.getElementById("other-worlds-grid");
const addToCartBtn = document.getElementById("add-to-cart-btn");
const cartCountElem = document.getElementById("cart-count");
const cartToast = document.getElementById("cart-toast");
const toastTitle = document.getElementById("toast-title");
const toastSub = document.getElementById("toast-sub");

let selectedSize = "L";
let selectedColor = world.colors[0]?.name || "Default";

// Ensure wipe starts at solid threshold darkness
const wipe = document.getElementById("wipe");
if (wipe) {
  wipe.style.background = "#040406";
  wipe.style.opacity = "1";
}

// Initialize World Content
if (world && root && title && tagline) {
  document.title = `YOUNGLA × ${world.name} — The Collection`;

  root.style.setProperty("--world-accent", world.accent);

  if (eyebrow) eyebrow.textContent = world.franchise;
  title.textContent = world.name;
  tagline.textContent = world.tagline;
  if (garment) garment.textContent = world.garment;
  if (price) price.textContent = world.price;
  if (description) description.textContent = world.description;
  if (badgeFranchise) badgeFranchise.textContent = world.franchise;

  if (mainImg) {
    mainImg.src = world.garmentImgUrl;
    mainImg.alt = `${world.garment} — ${world.name}`;
  }

  // Populate Interactive Image Switcher (Signature Garment vs Lookbook vs Installation)
  const thumbRow = document.getElementById("thumb-row");
  if (thumbRow && world) {
    const lookbookBtn = world.lookbookImgUrl
      ? `
      <button type="button" class="collection-thumb-btn" data-src="${world.lookbookImgUrl}" data-fit="cover">
        <img src="${world.lookbookImgUrl}" alt="Lookbook" class="collection-thumb-img" />
        <span class="collection-thumb-title">LOOKBOOK</span>
      </button>`
      : "";

    thumbRow.innerHTML = `
      <button type="button" class="collection-thumb-btn is-active" data-src="${world.garmentImgUrl}" data-fit="contain">
        <img src="${world.garmentImgUrl}" alt="${world.garment}" class="collection-thumb-img" />
        <span class="collection-thumb-title">SIGNATURE PIECE</span>
      </button>
      ${lookbookBtn}
      <button type="button" class="collection-thumb-btn" data-src="${world.assetUrl}" data-fit="cover">
        <img src="${world.assetUrl}" alt="Installation" class="collection-thumb-img" />
        <span class="collection-thumb-title">INSTALLATION</span>
      </button>
    `;

    thumbRow.querySelectorAll<HTMLElement>(".collection-thumb-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        thumbRow.querySelectorAll(".collection-thumb-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        if (mainImg && btn.dataset.src) {
          gsap.killTweensOf(mainImg);
          gsap.to(mainImg, {
            opacity: 0,
            duration: 0.15,
            ease: "power2.in",
            onComplete: () => {
              mainImg.src = btn.dataset.src!;
              if (btn.dataset.fit === "cover") {
                mainImg.classList.remove("is-contain");
              } else {
                mainImg.classList.add("is-contain");
              }
              gsap.to(mainImg, { opacity: 1, duration: 0.25, ease: "power2.out" });
            }
          });
        }
      });
    });
  }

  // Render Color Swatches
  if (colorSwatchesContainer && world.colors.length > 0) {
    colorSwatchesContainer.innerHTML = world.colors
      .map(
        (c, idx) => `
      <button type="button" class="color-swatch ${idx === 0 ? "is-active" : ""}" data-color="${c.name}" style="--swatch-hex: ${c.hex}">
        <span class="swatch-circle"></span>
      </button>`
      )
      .join("");

    if (activeColorName) activeColorName.textContent = selectedColor;

    colorSwatchesContainer.querySelectorAll<HTMLElement>(".color-swatch").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        colorSwatchesContainer.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("is-active"));
        swatch.classList.add("is-active");
        selectedColor = swatch.dataset.color || "";
        if (activeColorName) activeColorName.textContent = selectedColor;
      });
    });
  }

  // Size Selector Handlers
  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      selectedSize = btn.dataset.size || "L";
    });
  });

  // Render Tech Specs
  if (specsList && world.details) {
    specsList.innerHTML = world.details
      .map((detail) => `<li class="spec-item"><span class="spec-bullet">▪</span>${detail}</li>`)
      .join("");
  }

  // Render Other Worlds
  if (otherWorldsGrid) {
    const otherWorlds = WORLDS.filter((w) => w.slug !== world.slug);
    otherWorldsGrid.innerHTML = otherWorlds
      .map(
        (w) => `
      <a href="collection.html?world=${w.slug}" class="other-world-card" style="--card-accent: ${w.accent}">
        <div class="other-world-img-wrap">
          <img src="${w.garmentImgUrl || w.assetUrl}" alt="${w.name}" class="other-world-img" loading="lazy" />
        </div>
        <div class="other-world-info">
          <span class="other-world-franchise">${w.franchise}</span>
          <h4 class="other-world-name">${w.name}</h4>
          <span class="other-world-garment-sub">${w.garment}</span>
          <span class="other-world-link">EXPLORE →</span>
        </div>
      </a>`
      )
      .join("");
  }
}

// Cart System
function updateCartBadge() {
  const stored = localStorage.getItem("youngla_cart_items");
  const items = stored ? JSON.parse(stored) : [];
  if (cartCountElem) {
    cartCountElem.textContent = String(items.length);
  }
}

function showCartToast(itemName: string, variant: string) {
  if (!cartToast || !toastTitle || !toastSub) return;
  toastTitle.textContent = `${itemName} ADDED`;
  toastSub.textContent = variant;
  cartToast.classList.add("is-visible");
  setTimeout(() => {
    cartToast.classList.remove("is-visible");
  }, 3200);
}

addToCartBtn?.addEventListener("click", () => {
  const stored = localStorage.getItem("youngla_cart_items");
  const items = stored ? JSON.parse(stored) : [];
  items.push({
    worldSlug: world.slug,
    name: world.garment,
    price: world.price,
    size: selectedSize,
    color: selectedColor,
    addedAt: Date.now(),
  });
  localStorage.setItem("youngla_cart_items", JSON.stringify(items));
  updateCartBadge();
  showCartToast(world.garment, `${selectedColor} / Size ${selectedSize}`);
});

updateCartBadge();

// Disciplined, Restrained Cinematic Collection Reveal
// Sequence: 1. Primary Image -> 2. Title -> 3. Product Info -> 4. Controls
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduce) {
  // Set initial spatial states
  gsap.set(".collection-main-frame", { opacity: 0, scale: 0.985 });
  gsap.set([".collection-back-link", ".collection-eyebrow", ".collection-title", ".collection-tagline"], {
    opacity: 0,
    y: 12,
  });
  gsap.set([".product-header", ".product-badge", "[data-description]", ".tech-specs-block"], {
    opacity: 0,
    y: 10,
  });
  gsap.set([".selector-block", ".product-actions", ".collection-thumb-row", ".other-worlds-section"], {
    opacity: 0,
    y: 8,
  });

  const revealTl = gsap.timeline({ delay: 0.06 });

  // Phase 0: Wipe lifts from nocturnal threshold darkness
  if (wipe) {
    revealTl.to(
      wipe,
      {
        opacity: 0,
        duration: 0.70,
        ease: "power2.out",
      },
      0
    );
  }

  // 1. Primary Image: emerges out of threshold darkness with photographic presence
  revealTl.to(
    ".collection-main-frame",
    {
      opacity: 1,
      scale: 1,
      duration: 0.90,
      ease: "power2.out",
    },
    0.16
  );

  // 2. Collection Title & Brand Framing
  revealTl.to(
    [".collection-back-link", ".collection-eyebrow", ".collection-title", ".collection-tagline"],
    {
      opacity: 1,
      y: 0,
      duration: 0.80,
      stagger: 0.07,
      ease: "power2.out",
    },
    0.36
  );

  // 3. Product Information: craftsmanship and specifications
  revealTl.to(
    [".product-header", ".product-badge", "[data-description]", ".tech-specs-block"],
    {
      opacity: 1,
      y: 0,
      duration: 0.75,
      stagger: 0.07,
      ease: "power2.out",
    },
    0.56
  );

  // 4. Controls: purchase actions, sizing, colorway, and navigation
  revealTl.to(
    [".selector-block", ".product-actions", ".collection-thumb-row", ".other-worlds-section"],
    {
      opacity: 1,
      y: 0,
      duration: 0.70,
      stagger: 0.07,
      ease: "power2.out",
    },
    0.76
  );
} else if (wipe) {
  gsap.to(wipe, { opacity: 0, duration: 0.4 });
}
