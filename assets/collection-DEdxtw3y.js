import{g as B,W as C,a as r}from"./worlds-De2uRsnn.js";const x=new URLSearchParams(window.location.search),T=x.get("world")||"youngla-originals",t=B(T)||C[0],m=document.querySelector("[data-collection]"),u=document.querySelector("[data-eyebrow]"),g=document.querySelector("[data-title]"),h=document.querySelector("[data-tagline]"),p=document.querySelector("[data-garment]"),y=document.querySelector("[data-price]"),f=document.querySelector("[data-description]"),a=document.getElementById("main-asset-img"),S=document.getElementById("badge-franchise"),n=document.getElementById("color-swatches"),l=document.getElementById("active-color-name"),b=document.querySelectorAll(".size-btn"),w=document.getElementById("specs-list"),E=document.getElementById("other-worlds-grid"),q=document.getElementById("add-to-cart-btn"),v=document.getElementById("cart-count"),i=document.getElementById("cart-toast"),L=document.getElementById("toast-title"),I=document.getElementById("toast-sub");let d="L",c=t.colors[0]?.name||"Default";if(t&&m&&g&&h){document.title=`YOUNGLA × ${t.name} — The Collection`,m.style.setProperty("--world-accent",t.accent),u&&(u.textContent=t.franchise),g.textContent=t.name,h.textContent=t.tagline,p&&(p.textContent=t.garment),y&&(y.textContent=t.price),f&&(f.textContent=t.description),S&&(S.textContent=t.franchise),a&&(a.src=t.assetUrl,a.alt=`${t.name} Collection`);const s=document.getElementById("thumb-row");if(s&&t&&(s.innerHTML=`
      <button type="button" class="collection-thumb-btn is-active" data-src="${t.assetUrl}">
        <img src="${t.assetUrl}" alt="Installation" class="collection-thumb-img" />
        <span class="collection-thumb-title">INSTALLATION</span>
      </button>
      <button type="button" class="collection-thumb-btn" data-src="${t.garmentImgUrl}">
        <img src="${t.garmentImgUrl}" alt="${t.garment}" class="collection-thumb-img" />
        <span class="collection-thumb-title">SIGNATURE PIECE</span>
      </button>
    `,s.querySelectorAll(".collection-thumb-btn").forEach(e=>{e.addEventListener("click",()=>{s.querySelectorAll(".collection-thumb-btn").forEach(o=>o.classList.remove("is-active")),e.classList.add("is-active"),a&&e.dataset.src&&(a.src=e.dataset.src)})})),n&&t.colors.length>0&&(n.innerHTML=t.colors.map((e,o)=>`
      <button type="button" class="color-swatch ${o===0?"is-active":""}" data-color="${e.name}" style="--swatch-hex: ${e.hex}">
        <span class="swatch-circle"></span>
      </button>`).join(""),l&&(l.textContent=c),n.querySelectorAll(".color-swatch").forEach(e=>{e.addEventListener("click",()=>{n.querySelectorAll(".color-swatch").forEach(o=>o.classList.remove("is-active")),e.classList.add("is-active"),c=e.dataset.color||"",l&&(l.textContent=c)})})),b.forEach(e=>{e.addEventListener("click",()=>{b.forEach(o=>o.classList.remove("is-active")),e.classList.add("is-active"),d=e.dataset.size||"L"})}),w&&t.details&&(w.innerHTML=t.details.map(e=>`<li class="spec-item"><span class="spec-bullet">▪</span>${e}</li>`).join("")),E){const e=C.filter(o=>o.slug!==t.slug);E.innerHTML=e.map(o=>`
      <a href="collection.html?world=${o.slug}" class="other-world-card" style="--card-accent: ${o.accent}">
        <div class="other-world-img-wrap">
          <img src="${o.garmentImgUrl||o.assetUrl}" alt="${o.name}" class="other-world-img" loading="lazy" />
        </div>
        <div class="other-world-info">
          <span class="other-world-franchise">${o.franchise}</span>
          <h4 class="other-world-name">${o.name}</h4>
          <span class="other-world-garment-sub">${o.garment}</span>
          <span class="other-world-link">EXPLORE →</span>
        </div>
      </a>`).join("")}}function $(){const s=localStorage.getItem("youngla_cart_items"),e=s?JSON.parse(s):[];v&&(v.textContent=String(e.length))}function A(s,e){!i||!L||!I||(L.textContent=`${s} ADDED`,I.textContent=e,i.classList.add("is-visible"),setTimeout(()=>{i.classList.remove("is-visible")},3200))}q?.addEventListener("click",()=>{const s=localStorage.getItem("youngla_cart_items"),e=s?JSON.parse(s):[];e.push({worldSlug:t.slug,name:t.garment,price:t.price,size:d,color:c,addedAt:Date.now()}),localStorage.setItem("youngla_cart_items",JSON.stringify(e)),$(),A(t.garment,`${c} / Size ${d}`)});$();const U=window.matchMedia("(prefers-reduced-motion: reduce)").matches;U||(r.from(".collection-visual-panel",{opacity:0,x:-30,duration:1,ease:"power3.out"}),r.from(".collection-details-panel > *",{opacity:0,y:24,duration:.9,stagger:.08,ease:"power3.out"}),r.from(".other-worlds-section",{opacity:0,y:30,duration:1,delay:.4,ease:"power3.out"}));
