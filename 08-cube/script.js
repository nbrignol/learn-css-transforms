  const $ = id => document.getElementById(id);
  const rad = d => d * Math.PI / 180;
  const fmt = (n, p = 3) => { const r = Math.round(n * 10 ** p) / 10 ** p; return Object.is(r, -0) ? "0" : r.toString(); };

  // matrices 4×4 stockées colonne par colonne : m[col * 4 + ligne]
  function mul(A, B) {
    const R = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      let s = 0; for (let k = 0; k < 4; k++) s += A[k * 4 + r] * B[c * 4 + k];
      R[c * 4 + r] = s;
    }
    return R;
  }
  const I = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  const T = (x, y, z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
  const RX = t => { const c = Math.cos(rad(t)), s = Math.sin(rad(t)); return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]; };
  const RY = t => { const c = Math.cos(rad(t)), s = Math.sin(rad(t)); return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; };
  const m3 = M => `matrix3d(${M.map(v => fmt(v)).join(", ")})`;

  // position dans le patron (en nombre d’arêtes) et orientation dans le cube
  const FACES = [
    { cls: "avant",   nom: "Avant",   col: 0,  lig: 0,  rot: I },
    { cls: "droite",  nom: "Droite",  col: 1,  lig: 0,  rot: RY(90) },
    { cls: "arriere", nom: "Arrière", col: 2,  lig: 0,  rot: RY(180) },
    { cls: "gauche",  nom: "Gauche",  col: -1, lig: 0,  rot: RY(-90) },
    { cls: "haut",    nom: "Haut",    col: 0,  lig: -1, rot: RX(90) },
    { cls: "bas",     nom: "Bas",     col: 0,  lig: 1,  rot: RX(-90) }
  ];

  let S = 120, aPlat = false;
  const cube = $("cube");
  FACES.forEach(f => {
    const el = document.createElement("div");
    el.className = "face " + f.cls;
    el.innerHTML = `<span>${f.nom}</span>`;
    f.el = el; cube.appendChild(el);
  });

  function geometrie() {
    const w = $("scene").clientWidth;
    S = Math.max(56, Math.min(120, Math.floor(w / 5.4)));
    cube.style.width = S + "px"; cube.style.height = S + "px";
    cube.style.margin = `${-S / 2}px 0 0 ${-S / 2}px`;
    FACES.forEach(f => {
      const ox = f.col * S, oy = f.lig * S;
      Object.assign(f.el.style, { width: S + "px", height: S + "px", left: ox + "px", top: oy + "px" });
      // ramener au centre du cube, tourner, avancer d’une demi-arête
      f.M = mul(mul(T(-ox, -oy, 0), f.rot), T(0, 0, S / 2));
    });
  }

  function maj() {
    const h = +$("h").value, v = +$("v").value, p = +$("p").value;
    $("hv").textContent = h + "°"; $("vv").textContent = v + "°"; $("pv").textContent = p + "px";
    $("scene").style.perspective = p + "px";

    const C = mul(RX(v), RY(h));
    cube.style.transform = m3(C);
    $("cssCube").textContent =
      `.scene { perspective: ${p}px; }\n\n.cube {\n  transform-style: preserve-3d;\n  transform: ${m3(C)};\n}\n/* équivalent : rotateX(${v}deg) rotateY(${h}deg) */`;

    FACES.forEach(f => { f.el.style.transform = aPlat ? "none" : m3(f.M); });
    $("cssFaces").textContent = FACES.map(f => {
      const val = aPlat ? "none" : m3(f.M);
      return `.${f.cls.padEnd(8)} { transform: ${val}; }`;
    }).join("\n");

    $("plat").textContent = aPlat ? "Replier le cube" : "Mettre les faces à plat";
    $("plat").setAttribute("aria-pressed", aPlat);
  }

  ["h", "v", "p"].forEach(id => $(id).addEventListener("input", maj));
  $("plat").addEventListener("click", () => { aPlat = !aPlat; maj(); });
  $("reset").addEventListener("click", () => { $("h").value = 0; $("v").value = 0; maj(); });
  window.addEventListener("resize", () => { geometrie(); maj(); });
  geometrie(); maj();
