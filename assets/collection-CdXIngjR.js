import{g as k,W as $,a as c}from"./worlds-D32P4HSO.js";const x=new URLSearchParams(window.location.search),T=x.get("world")||"youngla-originals",t=k(T)||$[0],m=document.querySelector("[data-collection]"),u=document.querySelector("[data-eyebrow]"),g=document.querySelector("[data-title]"),h=document.querySelector("[data-tagline]"),p=document.querySelector("[data-garment]"),y=document.querySelector("[data-price]"),f=document.querySelector("[data-description]"),s=document.getElementById("main-asset-img"),b=document.getElementById("badge-franchise"),l=document.getElementById("color-swatches"),r=document.getElementById("active-color-name"),w=document.querySelectorAll(".size-btn"),S=document.getElementById("specs-list"),v=document.getElementById("other-worlds-grid"),U=document.getElementById("add-to-cart-btn"),E=document.getElementById("cart-count"),i=document.getElementById("cart-toast"),L=document.getElementById("toast-title"),I=document.getElementById("toast-sub");let d="L",n=t.colors[0]?.name||"Default";if(t&&m&&g&&h){document.title=`YOUNGLA × ${t.name} — The Collection`,m.style.setProperty("--world-accent",t.accent),u&&(u.textContent=t.franchise),g.textContent=t.name,h.textContent=t.tagline,p&&(p.textContent=t.garment),y&&(y.textContent=t.price),f&&(f.textContent=t.description),b&&(b.textContent=t.franchise),s&&(s.src=t.garmentImgUrl,s.alt=`${t.garment} — ${t.name}`);const a=document.getElementById("thumb-row");if(a&&t){const e=t.lookbookImgUrl?`
      <button type="button" class="collection-thumb-btn" data-src="${t.lookbookImgUrl}" data-fit="cover">
        <img src="${t.lookbookImgUrl}" alt="Lookbook" class="collection-thumb-img" />
        <span class="collection-thumb-title">LOOKBOOK</span>
      </button>`:"";a.innerHTML=`
      <button type="button" class="collection-thumb-btn is-active" data-src="${t.garmentImgUrl}" data-fit="contain">
        <img src="${t.garmentImgUrl}" alt="${t.garment}" class="collection-thumb-img" />
        <span class="collection-thumb-title">SIGNATURE PIECE</span>
      </button>
      ${e}
      <button type="button" class="collection-thumb-btn" data-src="${t.assetUrl}" data-fit="cover">
        <img src="${t.assetUrl}" alt="Installation" class="collection-thumb-img" />
        <span class="collection-thumb-title">INSTALLATION</span>
      </button>
    `,a.querySelectorAll(".collection-thumb-btn").forEach(o=>{o.addEventListener("click",()=>{a.querySelectorAll(".collection-thumb-btn").forEach(B=>B.classList.remove("is-active")),o.classList.add("is-active"),s&&o.dataset.src&&(c.killTweensOf(s),c.to(s,{opacity:0,duration:.15,ease:"power2.in",onComplete:()=>{s.src=o.dataset.src,o.dataset.fit==="cover"?s.classList.remove("is-contain"):s.classList.add("is-contain"),c.to(s,{opacity:1,duration:.25,ease:"power2.out"})}}))})})}if(l&&t.colors.length>0&&(l.innerHTML=t.colors.map((e,o)=>`
      <button type="button" class="color-swatch ${o===0?"is-active":""}" data-color="${e.name}" style="--swatch-hex: ${e.hex}">
        <span class="swatch-circle"></span>
      </button>`).join(""),r&&(r.textContent=n),l.querySelectorAll(".color-swatch").forEach(e=>{e.addEventListener("click",()=>{l.querySelectorAll(".color-swatch").forEach(o=>o.classList.remove("is-active")),e.classList.add("is-active"),n=e.dataset.color||"",r&&(r.textContent=n)})})),w.forEach(e=>{e.addEventListener("click",()=>{w.forEach(o=>o.classList.remove("is-active")),e.classList.add("is-active"),d=e.dataset.size||"L"})}),S&&t.details&&(S.innerHTML=t.details.map(e=>`<li class="spec-item"><span class="spec-bullet">▪</span>${e}</li>`).join("")),v){const e=$.filter(o=>o.slug!==t.slug);v.innerHTML=e.map(o=>`
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
      </a>`).join("")}}function C(){const a=localStorage.getItem("youngla_cart_items"),e=a?JSON.parse(a):[];E&&(E.textContent=String(e.length))}function q(a,e){!i||!L||!I||(L.textContent=`${a} ADDED`,I.textContent=e,i.classList.add("is-visible"),setTimeout(()=>{i.classList.remove("is-visible")},3200))}U?.addEventListener("click",()=>{const a=localStorage.getItem("youngla_cart_items"),e=a?JSON.parse(a):[];e.push({worldSlug:t.slug,name:t.garment,price:t.price,size:d,color:n,addedAt:Date.now()}),localStorage.setItem("youngla_cart_items",JSON.stringify(e)),C(),q(t.garment,`${n} / Size ${d}`)});C();const O=window.matchMedia("(prefers-reduced-motion: reduce)").matches;O||(c.from(".collection-visual-panel",{opacity:0,x:-30,duration:1,ease:"power3.out"}),c.from(".collection-details-panel > *",{opacity:0,y:24,duration:.9,stagger:.08,ease:"power3.out"}),c.from(".other-worlds-section",{opacity:0,y:30,duration:1,delay:.4,ease:"power3.out"}));
