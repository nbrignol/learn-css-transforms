  const $ = id => document.getElementById(id);
  const rad = d => d * Math.PI / 180;
  const fmt = (n, p = 3) => { const r = Math.round(n * 10 ** p) / 10 ** p; return Object.is(r, -0) ? "0" : r.toString(); };

  /* --- matrices 2D : [a, b, c, d, e, f] --- */
  const mul2 = (m, n) => {
    const [a1, b1, c1, d1, e1, f1] = m, [a2, b2, c2, d2, e2, f2] = n;
    return [a1*a2 + c1*b2, b1*a2 + d1*b2, a1*c2 + c1*d2, b1*c2 + d1*d2, a1*e2 + c1*f2 + e1, b1*e2 + d1*f2 + f1];
  };
  const T2 = (x, y) => [1, 0, 0, 1, x, y];
  const R2 = t => [Math.cos(rad(t)), Math.sin(rad(t)), -Math.sin(rad(t)), Math.cos(rad(t)), 0, 0];
  const m2 = M => `matrix(${M.map(v => fmt(v)).join(", ")})`;

  /* --- matrices 3D, colonne par colonne --- */
  const mul3 = (A, B) => {
    const R = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      let s = 0; for (let k = 0; k < 4; k++) s += A[k * 4 + r] * B[c * 4 + k];
      R[c * 4 + r] = s;
    }
    return R;
  };
  const T3 = (x, y, z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
  const RX = t => { const c = Math.cos(rad(t)), s = Math.sin(rad(t)); return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]; };
  const RY = t => { const c = Math.cos(rad(t)), s = Math.sin(rad(t)); return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; };
  const m3 = M => `matrix3d(${M.map(v => fmt(v)).join(", ")})`;

  let mode = "grille", T = 96, GAP = 14;

  const anneau = $("anneau");
  const tuiles = [1, 2, 3, 4, 5, 6].map(n => {
    const el = document.createElement("div");
    el.className = "tuile"; el.textContent = n;
    anneau.appendChild(el); return el;
  });

  function taille() {
    const w = $("scene").clientWidth;
    T = Math.max(52, Math.min(96, Math.floor(w / 5.6)));
    GAP = Math.round(T * .15);
    tuiles.forEach(el => Object.assign(el.style, {
      width: T + "px", height: T + "px", left: -T / 2 + "px", top: -T / 2 + "px", fontSize: T * .32 + "px"
    }));
  }

  function matrices() {
    const pas = T + GAP;
    if (mode === "grille") {
      return tuiles.map((_, i) => {
        const col = i % 3, lig = Math.floor(i / 3);
        return { css: m2(T2((col - 1) * pas, (lig - .5) * pas)), detail: `translate(${fmt((col - 1) * pas)}px, ${fmt((lig - .5) * pas)}px)` };
      });
    }
    if (mode === "cercle") {
      const R = Math.min(1.75 * T, $("scene").clientWidth / 2 - T * .75, 150);
      return tuiles.map((_, i) => {
        const t = i * 60;
        return { css: m2(mul2(R2(t), T2(0, -R))), detail: `rotate(${t}deg) translateY(${fmt(-R)}px)` };
      });
    }
    const R = pas / (2 * Math.tan(rad(30))); // apothème d’un hexagone de côté « pas »
    return tuiles.map((_, i) => {
      const t = i * 60;
      return { css: m3(mul3(RY(t), T3(0, 0, R))), detail: `rotateY(${t}deg) translateZ(${fmt(R)}px)` };
    });
  }

  function majConteneur() {
    const h = +$("h").value, v = +$("v").value, p = +$("p").value;
    $("hv").textContent = h + "°";
    $("vv").textContent = (v < 0 ? "−" + Math.abs(v) : v) + "°";
    $("pv").textContent = p + "px";
    $("scene").style.perspective = p + "px";
    let txt;
    if (mode === "anneau") {
      const C = mul3(RX(v), RY(h));
      anneau.style.transform = m3(C);
      txt = `.scene   { perspective: ${p}px; }\n.anneau  {\n  transform-style: preserve-3d;\n  transform: ${m3(C)};\n}\n/* équivalent : rotateX(${v}deg) rotateY(${h}deg) */`;
    } else {
      anneau.style.transform = "none";
      txt = `.anneau { transform: none; }\n/* en 2D, le conteneur ne bouge pas : seules les tuiles changent */`;
    }
    $("cssConteneur").textContent = txt;
  }

  function maj() {
    const ms = matrices();
    tuiles.forEach((el, i) => { el.style.transform = ms[i].css; });
    $("cssTuiles").textContent = ms.map((m, i) =>
      `.tuile-${i + 1} { transform: ${m.css}; }\n           /* ${m.detail} */`).join("\n");
    $("explication").textContent = {
      grille: "Une simple translation par tuile : seules e et f changent, comme à l’étape 1. Les quatre premières valeurs restent celles de l’identité.",
      cercle: "Chaque tuile tourne de 60° de plus que la précédente, puis recule de R pixels vers le « haut » de son propre repère, qui pointe maintenant vers l’extérieur (la lecture « repère qui bouge » de l’étape 5). Chaque tuile garde donc sa base tournée vers le centre, comme les chiffres d’une horloge gravés sur le cadran.",
      anneau: "Même idée qu’en 2D, mais autour de l’axe y : rotateY puis translateZ. La distance R est l’apothème d’un hexagone, pour que les bords des tuiles se touchent presque. On passe en matrix3d() car z intervient."
    }[mode];
    ["H", "V", "P"].forEach(k => {
      $("lbl" + k).classList.toggle("off", mode !== "anneau");
      $(k.toLowerCase()).disabled = mode !== "anneau";
    });
    document.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === mode));
    majConteneur();
  }

  document.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; maj(); }));
  ["h", "v", "p"].forEach(id => {
    $(id).addEventListener("input", () => { anneau.classList.add("suit"); majConteneur(); });
    $(id).addEventListener("change", () => anneau.classList.remove("suit"));
  });
  window.addEventListener("resize", () => { taille(); maj(); });
  taille(); maj();
