  const $ = id => document.getElementById(id);
  const rad = d => d * Math.PI / 180;
  // matrices 4×4 stockées colonne par colonne : m[col * 4 + ligne]
  const I = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  function mul(A, B) {
    const R = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      let s = 0; for (let k = 0; k < 4; k++) s += A[k * 4 + r] * B[c * 4 + k];
      R[c * 4 + r] = s;
    }
    return R;
  }
  const rotX = t => { const c = Math.cos(rad(t)), s = Math.sin(rad(t)); return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]; };
  const rotY = t => { const c = Math.cos(rad(t)), s = Math.sin(rad(t)); return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; };
  const rotZ = t => { const c = Math.cos(rad(t)), s = Math.sin(rad(t)); return [c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]; };
  const trZ = z => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,z,1];
  const persp = p => [1,0,0,0, 0,1,0,0, 0,0,1,-1/p, 0,0,0,1];
  const apply = (M, v) => [0,1,2,3].map(r => M[r] * v[0] + M[4 + r] * v[1] + M[8 + r] * v[2] + M[12 + r] * v[3]);

  const fmt = (n, p = 4) => { const r = Math.round(n * 10 ** p) / 10 ** p; return Object.is(r, -0) ? "0" : r.toString(); };
  const pad = s => s.padStart(8, " ");

  function maj() {
    const rx = +$("rx").value, ry = +$("ry").value, rz = +$("rz").value, tz = +$("tz").value, p = +$("p").value;
    const avecP = $("avecP").checked;
    $("p").disabled = !avecP;
    $("rxv").textContent = rx + "°"; $("ryv").textContent = ry + "°"; $("rzv").textContent = rz + "°";
    $("tzv").textContent = tz + "px"; $("pv").textContent = p + "px";

    let M = avecP ? persp(p) : I();
    M = mul(M, trZ(tz)); M = mul(M, rotX(rx)); M = mul(M, rotY(ry)); M = mul(M, rotZ(rz));

    const m3 = `matrix3d(${M.map(x => fmt(x)).join(", ")})`;
    $("boite").style.transform = m3;
    const fonctions = `${avecP ? `perspective(${p}px) ` : ""}translateZ(${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
    $("mesure").style.transform = fonctions;

    const noms = ["axe x", "axe y", "axe z", "origine"];
    const colonnes = [0, 1, 2, 3].map(c => {
      const vals = [0, 1, 2, 3].map(r => fmt(M[c * 4 + r])).join(", ") + (c < 3 ? "," : "");
      return `  ${vals.padEnd(34)} /* ${noms[c]} */`;
    });
    $("css").textContent =
      `transform: matrix3d(\n${colonnes.join("\n")}\n);\n\n/* équivalent :\n   ${fonctions} */`;
    const cls = ["cx", "cy", "cz", "ct"];
    let html = `<span class="entetes">${pad("axe x")}  ${pad("axe y")}  ${pad("axe z")}  ${pad("origine")}</span>\n`;
    for (let r = 0; r < 4; r++) {
      const cells = [0,1,2,3].map(c => `<span class="${cls[c]}">${pad(fmt(M[c * 4 + r], 3))}</span>`).join("  ");
      html += r === 3 ? `<span class="persp">${cells}</span>  ← w` : `${cells}  ← ${"xyz"[r]}`;
      html += "\n";
    }
    $("mat").innerHTML = html.trimEnd();

    $("note").textContent = avecP
      ? `La perspective place −1/${p} = ${fmt(-1 / p, 5)} sur la dernière ligne : w dépend désormais de z. Les 16 valeurs se passent à matrix3d() colonne par colonne, de gauche à droite.`
      : "Sans perspective, la dernière ligne vaut 0 0 0 1 et w reste égal à 1. Une rotation autour de y ne fait alors que rétrécir la carte, sans profondeur, et translateZ n’a aucun effet visible.";

    // coin haut droit : (70, −70, 0) par rapport au centre
    const [x, y, z, w] = apply(M, [70, -70, 0, 1]);
    $("coin").textContent =
      `Point de départ :   (70, −70, 0, 1)\n` +
      `Après la matrice :  (${fmt(x, 1)}, ${fmt(y, 1)}, ${fmt(z, 1)}, w = ${fmt(w, 3)})\n` +
      (w > 0
        ? `Division par w :    (${fmt(x / w, 1)}, ${fmt(y / w, 1)})  → position affichée à l’écran`
        : `w ≤ 0 : le point est derrière l’œil, le navigateur ne peut pas l’afficher correctement.`);

    try {
      $("lu").textContent = `getComputedStyle(el).transform\n→ ${getComputedStyle($("mesure")).transform}`;
    } catch (e) { $("lu").textContent = "Lecture impossible dans ce navigateur."; }
  }

  ["rx", "ry", "rz", "tz", "p"].forEach(id => $(id).addEventListener("input", maj));
  $("avecP").addEventListener("change", maj);
  document.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
    const [rx, ry, rz, tz] = b.dataset.v.split(",");
    $("rx").value = rx; $("ry").value = ry; $("rz").value = rz; $("tz").value = tz; maj();
  }));
  maj();
