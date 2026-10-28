  const $ = id => document.getElementById(id);
  const TYPES = {
    aucune:     { label: "aucune",     min: 0,    max: 0,   step: 1,    def: 0,   unit: "" },
    translateX: { label: "translateX", min: -200, max: 200, step: 5,    def: 100, unit: "px" },
    translateY: { label: "translateY", min: -150, max: 150, step: 5,    def: 100, unit: "px" },
    rotate:     { label: "rotate",     min: -180, max: 180, step: 5,    def: 90,  unit: "deg" },
    scale:      { label: "scale",      min: 0.2,  max: 2,   step: 0.05, def: 2,   unit: "" },
    skewX:      { label: "skewX",      min: -60,  max: 60,  step: 5,    def: 30,  unit: "deg" }
  };
  const rad = d => d * Math.PI / 180;
  function mat(type, v) {
    switch (type) {
      case "translateX": return [1, 0, 0, 1, v, 0];
      case "translateY": return [1, 0, 0, 1, 0, v];
      case "rotate": return [Math.cos(rad(v)), Math.sin(rad(v)), -Math.sin(rad(v)), Math.cos(rad(v)), 0, 0];
      case "scale": return [v, 0, 0, v, 0, 0];
      case "skewX": return [1, 0, Math.tan(rad(v)), 1, 0, 0];
      default: return [1, 0, 0, 1, 0, 0];
    }
  }
  function mul(m, n) {
    const [a1, b1, c1, d1, e1, f1] = m, [a2, b2, c2, d2, e2, f2] = n;
    return [
      a1 * a2 + c1 * b2, b1 * a2 + d1 * b2,
      a1 * c2 + c1 * d2, b1 * c2 + d1 * d2,
      a1 * e2 + c1 * f2 + e1, b1 * e2 + d1 * f2 + f1
    ];
  }
  const ID = [1, 0, 0, 1, 0, 0];
  const fmt = n => { const r = Math.round(n * 1000) / 1000; return Object.is(r, -0) ? "0" : r.toString(); };
  const mStr = m => `matrix(${m.map(fmt).join(", ")})`;
  const fnStr = (t, v) => `${TYPES[t].label}(${fmt(v)}${TYPES[t].unit})`;

  let ops = [
    { type: "translateX", v: 100 },
    { type: "rotate", v: 90 },
    { type: "aucune", v: 0 }
  ];

  function construireChaine() {
    const ch = $("chaine"); ch.innerHTML = "";
    ops.forEach((op, i) => {
      const t = TYPES[op.type];
      const row = document.createElement("div"); row.className = "op";
      row.innerHTML = `
        <span class="num">${i + 1}</span>
        <select aria-label="Opération ${i + 1}">${Object.keys(TYPES).map(k =>
          `<option value="${k}" ${k === op.type ? "selected" : ""}>${TYPES[k].label}</option>`).join("")}</select>
        <input type="range" aria-label="Valeur de l’opération ${i + 1}" min="${t.min}" max="${t.max}" step="${t.step}" value="${op.v}" ${op.type === "aucune" ? "disabled" : ""}>
        <span class="mono val">${op.type === "aucune" ? "" : fmt(op.v) + t.unit}</span>`;
      row.querySelector("select").addEventListener("change", e => {
        op.type = e.target.value; op.v = TYPES[op.type].def; construireChaine(); maj();
      });
      row.querySelector("input").addEventListener("input", e => {
        op.v = Number(e.target.value);
        row.querySelector(".val").textContent = fmt(op.v) + t.unit; maj();
      });
      ch.appendChild(row);
    });
  }

  function maj() {
    const actifs = ops.filter(o => o.type !== "aucune");
    const mats = actifs.map(o => mat(o.type, o.v));
    const M = mats.reduce(mul, ID);
    const Minv = [...mats].reverse().reduce(mul, ID);
    const origin = $("origin").value;

    for (const el of [$("boite"), $("inverse"), $("inter1"), $("inter2")]) el.style.transformOrigin = origin;
    $("boite").style.transform = mStr(M);
    $("inverse").style.transform = mStr(Minv);

    // étapes intermédiaires : produits partiels M1, M1·M2
    let partiel = ID;
    ["inter1", "inter2"].forEach((id, k) => {
      const el = $(id);
      if (k < mats.length - 1) {
        partiel = mul(partiel, mats[k]);
        el.style.transform = mStr(partiel);
        el.classList.add("actif");
        el.textContent = k === 0 ? "après 1" : "après 1 et 2";
      } else el.classList.remove("actif");
    });

    // point d’origine
    const [ox, oy] = origin.split(" ").map(s => parseFloat(s) / (s.endsWith("%") ? 100 : 1));
    $("origine").style.left = `calc(50% - 50px + ${ox * 100}px)`;
    $("origine").style.top = `calc(50% - 50px + ${oy * 100}px)`;

    const ecrit = actifs.length ? actifs.map(o => fnStr(o.type, o.v)).join(" ") : "none";
    $("css").textContent = `transform: ${ecrit};\ntransform-origin: ${origin};`;
    $("detail").textContent = actifs.length
      ? actifs.map((o, i) => `${i + 1}. ${fnStr(o.type, o.v).padEnd(18)} → ${mStr(mats[i])}`).join("\n")
      : "Aucune opération : matrice identité.";
    $("produit").textContent =
      `Produit ${actifs.map((_, i) => "M" + (i + 1)).join(" × ") || "—"}\n  = ${mStr(M)}` +
      (actifs.length > 1 ? `\nOrdre inverse\n  = ${mStr(Minv)}` : "");

    const same = M.every((x, i) => Math.abs(x - Minv[i]) < 1e-9);
    $("note").textContent = actifs.length < 2
      ? "Ajoute une deuxième opération pour voir l’effet de l’ordre."
      : same
        ? "Ici les deux ordres donnent la même matrice : ces opérations commutent (par exemple deux translations, ou rotate et scale uniforme)."
        : "Les deux ordres donnent des matrices différentes : l’opération de droite agit en premier, dans le repère déjà transformé par celles de gauche.";
  }

  const PRESETS = {
    tr: [{ type: "translateX", v: 100 }, { type: "rotate", v: 90 }, { type: "aucune", v: 0 }],
    rt: [{ type: "rotate", v: 90 }, { type: "translateX", v: 100 }, { type: "aucune", v: 0 }],
    st: [{ type: "scale", v: 2 }, { type: "translateX", v: 50 }, { type: "aucune", v: 0 }],
    orbit: [{ type: "rotate", v: 45 }, { type: "translateX", v: 150 }, { type: "rotate", v: -45 }]
  };
  document.querySelectorAll("#presets [data-p]").forEach(b => b.addEventListener("click", () => {
    ops = PRESETS[b.dataset.p].map(o => ({ ...o })); construireChaine(); maj();
  }));
  $("inverser").addEventListener("click", () => {
    const actifs = ops.filter(o => o.type !== "aucune").reverse();
    const vides = ops.filter(o => o.type === "aucune");
    ops = [...actifs, ...vides]; construireChaine(); maj();
  });
  $("origin").addEventListener("change", maj);
  $("comparer").addEventListener("change", e => $("stage").classList.toggle("comparer", e.target.checked));
  $("etapes").addEventListener("change", e => $("stage").classList.toggle("etapes", e.target.checked));
  $("stage").classList.add("comparer");
  construireChaine(); maj();
