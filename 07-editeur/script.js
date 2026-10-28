  const $ = id => document.getElementById(id);
  const fmt = (n, p = 3) => { const r = Math.round(n * 10 ** p) / 10 ** p; return Object.is(r, -0) ? "0" : r.toString(); };
  const deg = r => r * 180 / Math.PI;

  /* ---------- Onglets (avec liens #deux-d / #trois-d) ---------- */
  function ouvrir(vue) {
    const est3d = vue === "trois-d";
    $("tab2d").setAttribute("aria-selected", !est3d);
    $("tab3d").setAttribute("aria-selected", est3d);
    $("vue2d").hidden = est3d; $("vue3d").hidden = !est3d;
    try { history.replaceState(null, "", "#" + vue); } catch (e) {}
  }
  $("tab2d").addEventListener("click", () => ouvrir("deux-d"));
  $("tab3d").addEventListener("click", () => ouvrir("trois-d"));

  /* ---------- 2D ---------- */
  const NOMS = ["a", "b", "c", "d", "e", "f"];
  const BORNES = { a: [-2, 2, .01], b: [-2, 2, .01], c: [-2, 2, .01], d: [-2, 2, .01], e: [-200, 200, 1], f: [-200, 200, 1] };
  const AIDE = { a: "colonne x", c: "colonne y", e: "origine" };
  let m2 = [1, 0, 0, 1, 0, 0];

  (function construire2d() {
    const box = $("valeurs2d");
    NOMS.forEach((n, i) => {
      if (AIDE[n]) {
        const t = document.createElement("div"); t.className = "groupe-titre";
        t.textContent = { a: "Colonne 1 : où va le pas vers la droite (a, b)", c: "Colonne 2 : où va le pas vers le bas (c, d)", e: "Colonne 3 : où va l’origine, la translation en px (e, f)" }[n];
        box.appendChild(t);
      }
      const [min, max, step] = BORNES[n];
      const row = document.createElement("div");
      row.className = "val " + (i < 2 ? "col1" : i < 4 ? "col2" : "col3");
      row.innerHTML = `<span class="nom">${n}</span>
        <input type="range" min="${min}" max="${max}" step="${step}" aria-label="Valeur ${n}">
        <input type="number" step="any" aria-label="Valeur ${n} (saisie)">`;
      const [rng, num] = row.querySelectorAll("input");
      rng.addEventListener("input", () => { m2[i] = +rng.value; maj2d(); });
      num.addEventListener("input", () => { const v = parseFloat(num.value); if (!isNaN(v)) { m2[i] = v; maj2d(num); } });
      box.appendChild(row);
    });
  })();

  function decompose([a, b, c, d, e, f]) {
    const sx = Math.hypot(a, b);
    if (sx < 1e-9) return null;
    const theta = Math.atan2(b, a);
    const det = a * d - b * c;
    const sy = det / sx;
    if (Math.abs(sy) < 1e-9) return null;
    const k = (a * c + b * d) / sx;
    const skew = Math.atan(k / sy);
    return { e, f, theta, skew, sx, sy };
  }

  function maj2d(source) {
    const [a, b, c, d, e, f] = m2;
    document.querySelectorAll("#valeurs2d .val").forEach((row, i) => {
      const [rng, num] = row.querySelectorAll("input");
      rng.value = m2[i];
      if (row.querySelector("input[type=number]") !== source) num.value = fmt(m2[i]);
    });
    const ms = `matrix(${m2.map(v => fmt(v)).join(", ")})`;
    $("boite2d").style.transform = ms;
    $("css2d").textContent = `transform: ${ms};`;

    const det = a * d - b * c;
    $("lecture2d").textContent =
      `| ${fmt(a).padStart(7)}  ${fmt(c).padStart(7)}  ${fmt(e).padStart(7)} |   axe x → (${fmt(a)}, ${fmt(b)})\n` +
      `| ${fmt(b).padStart(7)}  ${fmt(d).padStart(7)}  ${fmt(f).padStart(7)} |   axe y → (${fmt(c)}, ${fmt(d)})\n` +
      `| ${"0".padStart(7)}  ${"0".padStart(7)}  ${"1".padStart(7)} |   origine → (${fmt(e)}, ${fmt(f)}) px\n\n` +
      `x′ = ${fmt(a)}·x + ${fmt(c)}·y + ${fmt(e)}\n` +
      `y′ = ${fmt(b)}·x + ${fmt(d)}·y + ${fmt(f)}\n\n` +
      `déterminant = a·d − b·c = ${fmt(det)}`;

    let etat;
    if (Math.abs(det) < 1e-6) etat = `<span class="etat-ko">Non inversible</span> : la boîte est aplatie sur une ligne (ou un point).`;
    else {
      etat = `<span class="etat-ok">Inversible</span>. Aire multipliée par ${fmt(Math.abs(det))}`;
      etat += det < 0 ? ", et l’élément est retourné (déterminant négatif)." : ".";
      const perp = Math.abs(a * c + b * d) < 1e-3, memeLong = Math.abs(Math.hypot(a, b) - Math.hypot(c, d)) < 1e-3;
      if (perp && memeLong && det > 0) etat += " Les colonnes sont perpendiculaires et de même longueur : rotation et échelle uniforme, sans déformation.";
    }
    $("etat2d").innerHTML = etat;

    const D = decompose(m2);
    if (!D) {
      $("decomp2d").textContent = "Pas de décomposition possible : la matrice n’est pas inversible.";
      $("decompNote").textContent = "";
      $("preuve2d").style.transform = "scale(0)";
    } else {
      const parts = [];
      if (fmt(D.e) !== "0" || fmt(D.f) !== "0") parts.push(`translate(${fmt(D.e, 1)}px, ${fmt(D.f, 1)}px)`);
      if (fmt(deg(D.theta), 2) !== "0") parts.push(`rotate(${fmt(deg(D.theta), 2)}deg)`);
      if (fmt(deg(D.skew), 2) !== "0") parts.push(`skewX(${fmt(deg(D.skew), 2)}deg)`);
      if (fmt(D.sx) !== "1" || fmt(D.sy) !== "1") parts.push(`scale(${fmt(D.sx)}, ${fmt(D.sy)})`);
      const txt = parts.length ? parts.join("\n           ") : "none";
      $("decomp2d").textContent = `transform: ${txt};`;
      $("preuve2d").style.transform =
        `translate(${D.e}px, ${D.f}px) rotate(${deg(D.theta)}deg) skewX(${deg(D.skew)}deg) scale(${D.sx}, ${D.sy})`;
      $("decompNote").textContent =
        "Méthode : la rotation vient de l’angle de la colonne x (atan2(b, a)), l’échelle horizontale de sa longueur, l’échelle verticale du déterminant divisé par cette longueur, et l’inclinaison de ce qui reste. Lu de gauche à droite avec un repère qui bouge, comme à l’étape 5.";
    }
    document.querySelectorAll("#presets2d [data-m]").forEach(btn =>
      btn.classList.toggle("principal", btn.dataset.m.split(",").every((v, i) => Math.abs(+v - m2[i]) < 1e-6)));
  }

  document.querySelectorAll("#presets2d [data-m]").forEach(btn =>
    btn.addEventListener("click", () => { m2 = btn.dataset.m.split(",").map(Number); maj2d(); }));
  $("prouver2d").addEventListener("change", e => $("stage2d").classList.toggle("prouver", e.target.checked));
  $("stage2d").classList.add("prouver");

  /* ---------- 3D ---------- */
  // stockage colonne par colonne : m[col * 4 + ligne]
  let m3 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  const rad = x => x * Math.PI / 180;
  function mul(A, B) {
    const R = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      let s = 0; for (let k = 0; k < 4; k++) s += A[k * 4 + r] * B[c * 4 + k];
      R[c * 4 + r] = s;
    }
    return R;
  }
  const P = p => [1,0,0,0, 0,1,0,0, 0,0,1,-1/p, 0,0,0,1];
  const RY = t => { const c = Math.cos(rad(t)), s = Math.sin(rad(t)); return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; };
  const RX = t => { const c = Math.cos(rad(t)), s = Math.sin(rad(t)); return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]; };
  const TZ = z => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,z,1];

  (function construire3d() {
    const g = $("grille3d");
    const tetes = [["", ""], ["axe x", "t-x"], ["axe y", "t-y"], ["axe z", "t-z"], ["origine", "t-o"]];
    tetes.forEach(([t, cl]) => { const s = document.createElement("span"); s.className = "tete " + cl; s.textContent = t; g.appendChild(s); });
    for (let r = 0; r < 4; r++) {
      const l = document.createElement("span"); l.className = "ligne"; l.textContent = "→ " + "xyzw"[r]; g.appendChild(l);
      for (let c = 0; c < 4; c++) {
        const idx = c * 4 + r;
        const cell = document.createElement("div");
        cell.className = "cellule" + (r === 3 ? " w" : "");
        cell.innerHTML = `<small>${idx + 1}</small><input type="number" step="any" aria-label="Valeur ${idx + 1} de matrix3d">`;
        const inp = cell.querySelector("input");
        inp.addEventListener("input", () => { const v = parseFloat(inp.value); if (!isNaN(v)) { m3[idx] = v; maj3d(inp); } });
        g.appendChild(cell);
      }
    }
  })();

  function maj3d(source) {
    const inputs = document.querySelectorAll("#grille3d input");
    let i = 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const inp = inputs[i++];
      if (inp !== source) inp.value = fmt(m3[c * 4 + r], 5);
    }
    const s = `matrix3d(${m3.map(v => fmt(v, 5)).join(", ")})`;
    $("boite3d").style.transform = s;
    const noms = ["axe x", "axe y", "axe z", "origine"];
    const cols = [0, 1, 2, 3].map(c => {
      const vals = [0, 1, 2, 3].map(r => fmt(m3[c * 4 + r], 5)).join(", ") + (c < 3 ? "," : "");
      return `  ${vals.padEnd(36)} /* ${noms[c]} */`;
    });
    $("css3d").textContent = `transform: matrix3d(\n${cols.join("\n")}\n);`;

    const v = [70, -70, 0, 1];
    const [x, y, z, w] = [0, 1, 2, 3].map(r => m3[r] * v[0] + m3[4 + r] * v[1] + m3[8 + r] * v[2] + m3[12 + r] * v[3]);
    $("coin3d").textContent =
      `Coin haut droit (point rose) : (70, −70, 0, 1)\n` +
      `Après la matrice :  (${fmt(x, 1)}, ${fmt(y, 1)}, ${fmt(z, 1)}, w = ${fmt(w, 3)})\n` +
      (w > 0 ? `Division par w :    (${fmt(x / w, 1)}, ${fmt(y / w, 1)}) à l’écran`
             : `w ≤ 0 : le point est derrière l’œil, il ne peut pas être affiché correctement.`);
  }

  const PRESETS3D = {
    id: () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
    ry: () => mul(P(500), RY(45)),
    rx: () => mul(P(500), RX(55)),
    persp: () => mul(P(500), TZ(150)),
    from2d: () => { const [a, b, c, d, e, f] = m2; return [a,b,0,0, c,d,0,0, 0,0,1,0, e,f,0,1]; }
  };
  document.querySelectorAll("#presets3d [data-k]").forEach(btn =>
    btn.addEventListener("click", () => { m3 = PRESETS3D[btn.dataset.k](); maj3d(); }));

  maj2d(); maj3d();
  ouvrir(location.hash === "#trois-d" ? "trois-d" : "deux-d");
