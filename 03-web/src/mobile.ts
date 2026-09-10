import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORLDS, type CrestShape } from "./worlds";

gsap.registerPlugin(ScrollTrigger);

const CREST_SHAPE_CLASS: Record<CrestShape, string> = {
  bat: "crest--diamond",
  vought: "crest--triangle-down",
  katana: "crest--circle",
  wings: "crest--pentagon",
  swirl: "crest--circle",
  hexagon: "crest--hex",
  diamond: "crest--diamond",
};

export function renderMobileWorlds() {
  const list = document.querySelector<HTMLUListElement>("[data-world-list]");
  if (!list) return;

  list.innerHTML = WORLDS.map(
    (world) => `
    <li class="world-card" style="--card-accent: ${world.accent}">
      <div class="world-card-glow" aria-hidden="true"></div>
      <div class="world-card-image-wrap">
        <img src="${world.assetUrl}" alt="${world.name}" class="world-card-img" loading="lazy" />
        <div class="world-card-badge">
          <span class="world-card-crest ${CREST_SHAPE_CLASS[world.crestShape]}"></span>
          <span class="world-card-franchise">${world.franchise}</span>
        </div>
      </div>
      <div class="world-card-info">
        <h2 class="world-card-name">${world.name}</h2>
        <p class="world-card-tagline">${world.tagline}</p>
        <div class="world-card-product-pill">
          <span class="world-card-garment">${world.garment}</span>
          <span class="world-card-price">${world.price}</span>
        </div>
        <a class="world-card-cta" href="collection.html?world=${world.slug}">ENTER WORLD →</a>
      </div>
    </li>`
  ).join("");

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray<HTMLElement>(".world-card").forEach((card) => {
      const imgWrap = card.querySelector(".world-card-image-wrap");
      const info = card.querySelector(".world-card-info");
      gsap.set([imgWrap, info], { opacity: 0, y: 28 });
      ScrollTrigger.create({
        trigger: card,
        start: "top 80%",
        once: true,
        onEnter: () =>
          gsap.to([imgWrap, info], {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
            ease: "power3.out",
          }),
      });
    });
  });
}
