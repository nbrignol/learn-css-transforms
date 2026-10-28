  const boite = document.getElementById("boite");
  const bIn = document.getElementById("b"), cIn = document.getElementById("c");
  const bv = document.getElementById("bv"), cv = document.getElementById("cv");
  const css = document.getElementById("css"), mat = document.getElementById("mat");
  const eq = document.getElementById("eq"), etat = document.getElementById("etat");
  const boutons = document.querySelectorAll("#presets button");

  const fmt = n => { const r = Math.round(n * 100) / 100; return Object.is(r, -0) ? "0" : r.toString(); };
  const pad = s => s.padStart(5, " ");
  const deg = v => Math.round(Math.atan(v) * 180 / Math.PI);
  const signe = n => n < 0 ? "− " + fmt(Math.abs(n)) : "+ " + fmt(n);

  function description(b, c) {
    const det = 1 - b * c;
    if (b === 0 && c === 0) return "Matrice identité : rien ne change.";
    if (Math.abs(det) < 0.005) return "Déterminant nul : la boîte s’aplatit sur une diagonale. Les deux colonnes pointent dans la même direction.";
    if (b === 1 && c === -1) return "Les deux flèches restent perpendiculaires et de même longueur : c’est une rotation de 45° avec un agrandissement de √2 ≈ 1,41. Aire × 2.";
    const parts = [];
    if (c !== 0) parts.push(`bords verticaux penchés de ${Math.abs(deg(c))}° (skewX)`);
    if (b !== 0) parts.push(`bords horizontaux penchés de ${Math.abs(deg(b))}° (skewY)`);
    let txt = parts.join(", ") + ". ";
    txt += (b === 0 || c === 0)
      ? "Aire conservée (déterminant = 1)."
      : `Aire × ${fmt(Math.abs(det))}${det < 0 ? ", et la boîte est retournée (déterminant négatif)" : ""}.`;
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  function maj() {
    const b = Number(bIn.value), c = Number(cIn.value);
    boite.style.transform = `matrix(1, ${b}, ${c}, 1, 0, 0)`;
    bv.textContent = fmt(b); cv.textContent = fmt(c);
    css.textContent = `transform: matrix(1, ${fmt(b)}, ${fmt(c)}, 1, 0, 0);`;
    mat.innerHTML =
      `| <span class="col-a">${pad("1")}</span>  <span class="col-c">${pad(fmt(c))}</span>  ${pad("0")} |\n` +
      `| <span class="col-a">${pad(fmt(b))}</span>  <span class="col-c">${pad("1")}</span>  ${pad("0")} |\n` +
      `| ${pad("0")}  ${pad("0")}  ${pad("1")} |`;
    eq.textContent = `x′ = x ${signe(c)} · y\ny′ = y ${signe(b)} · x\n\ndét = 1 − b·c = ${fmt(1 - b * c)}`;
    etat.textContent = description(b, c);
    boutons.forEach(btn => btn.setAttribute("aria-pressed",
      Number(btn.dataset.b) === b && Number(btn.dataset.c) === c ? "true" : "false"));
  }

  bIn.addEventListener("input", maj);
  cIn.addEventListener("input", maj);
  boutons.forEach(btn => btn.addEventListener("click", () => {
    bIn.value = btn.dataset.b; cIn.value = btn.dataset.c; maj();
  }));
  maj();
