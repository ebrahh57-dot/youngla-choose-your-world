import{g as x,W as C,a as c}from"./worlds-Da8N_v4A.js";const T=new URLSearchParams(window.location.search),U=T.get("world")||"youngla-originals",t=x(U)||C[0],u=document.querySelector("[data-collection]"),g=document.querySelector("[data-eyebrow]"),p=document.querySelector("[data-title]"),h=document.querySelector("[data-tagline]"),y=document.querySelector("[data-garment]"),f=document.querySelector("[data-price]"),b=document.querySelector("[data-description]"),s=document.getElementById("main-asset-img"),w=document.getElementById("badge-franchise"),l=document.getElementById("color-swatches"),r=document.getElementById("active-color-name"),S=document.querySelectorAll(".size-btn"),E=document.getElementById("specs-list"),v=document.getElementById("other-worlds-grid"),q=document.getElementById("add-to-cart-btn"),I=document.getElementById("cart-count"),d=document.getElementById("cart-toast"),L=document.getElementById("toast-title"),$=document.getElementById("toast-sub");let m="L",n=t.colors[0]?.name||"Default";const i=document.getElementById("wipe");i&&(i.style.background="#040406",i.style.opacity="1",c.to(i,{opacity:0,duration:.75,ease:"power2.out",delay:.08}));if(t&&u&&p&&h){document.title=`YOUNGLA × ${t.name} — The Collection`,u.style.setProperty("--world-accent",t.accent),g&&(g.textContent=t.franchise),p.textContent=t.name,h.textContent=t.tagline,y&&(y.textContent=t.garment),f&&(f.textContent=t.price),b&&(b.textContent=t.description),w&&(w.textContent=t.franchise),s&&(s.src=t.garmentImgUrl,s.alt=`${t.garment} — ${t.name}`);const a=document.getElementById("thumb-row");if(a&&t){const e=t.lookbookImgUrl?`
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
    `,a.querySelectorAll(".collection-thumb-btn").forEach(o=>{o.addEventListener("click",()=>{a.querySelectorAll(".collection-thumb-btn").forEach(k=>k.classList.remove("is-active")),o.classList.add("is-active"),s&&o.dataset.src&&(c.killTweensOf(s),c.to(s,{opacity:0,duration:.15,ease:"power2.in",onComplete:()=>{s.src=o.dataset.src,o.dataset.fit==="cover"?s.classList.remove("is-contain"):s.classList.add("is-contain"),c.to(s,{opacity:1,duration:.25,ease:"power2.out"})}}))})})}if(l&&t.colors.length>0&&(l.innerHTML=t.colors.map((e,o)=>`
      <button type="button" class="color-swatch ${o===0?"is-active":""}" data-color="${e.name}" style="--swatch-hex: ${e.hex}">
        <span class="swatch-circle"></span>
      </button>`).join(""),r&&(r.textContent=n),l.querySelectorAll(".color-swatch").forEach(e=>{e.addEventListener("click",()=>{l.querySelectorAll(".color-swatch").forEach(o=>o.classList.remove("is-active")),e.classList.add("is-active"),n=e.dataset.color||"",r&&(r.textContent=n)})})),S.forEach(e=>{e.addEventListener("click",()=>{S.forEach(o=>o.classList.remove("is-active")),e.classList.add("is-active"),m=e.dataset.size||"L"})}),E&&t.details&&(E.innerHTML=t.details.map(e=>`<li class="spec-item"><span class="spec-bullet">▪</span>${e}</li>`).join("")),v){const e=C.filter(o=>o.slug!==t.slug);v.innerHTML=e.map(o=>`
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
      </a>`).join("")}}function B(){const a=localStorage.getItem("youngla_cart_items"),e=a?JSON.parse(a):[];I&&(I.textContent=String(e.length))}function O(a,e){!d||!L||!$||(L.textContent=`${a} ADDED`,$.textContent=e,d.classList.add("is-visible"),setTimeout(()=>{d.classList.remove("is-visible")},3200))}q?.addEventListener("click",()=>{const a=localStorage.getItem("youngla_cart_items"),e=a?JSON.parse(a):[];e.push({worldSlug:t.slug,name:t.garment,price:t.price,size:m,color:n,addedAt:Date.now()}),localStorage.setItem("youngla_cart_items",JSON.stringify(e)),B(),O(t.garment,`${n} / Size ${m}`)});B();const A=window.matchMedia("(prefers-reduced-motion: reduce)").matches;A||(c.from(".collection-visual-panel",{opacity:0,x:-30,duration:1,ease:"power3.out"}),c.from(".collection-details-panel > *",{opacity:0,y:24,duration:.9,stagger:.08,ease:"power3.out"}),c.from(".other-worlds-section",{opacity:0,y:30,duration:1,delay:.4,ease:"power3.out"}));
