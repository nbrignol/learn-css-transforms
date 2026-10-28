  const boite = document.getElementById("boite");
  const aIn = document.getElementById("a"), dIn = document.getElementById("d");
  const av = document.getElementById("av"), dv = document.getElementById("dv");
  const css = document.getElementById("css"), mat = document.getElementById("mat");
  const eq = document.getElementById("eq"), etat = document.getElementById("etat");
  const boutons = document.querySelectorAll("#presets button");

  const fmt = n => (Math.round(n * 10) / 10).toString();
  const pad = s => s.padStart(4, " ");

  function description(a, d) {
    if (a === 0 || d === 0) return "Une colonne est nulle : la boîte est aplatie en un segment. Cette matrice n’est pas inversible.";
    if (a === -1 && d === -1) return "Deux miroirs = rotation de 180°. Le F est à l’envers mais pas en miroir.";
    const parts = [];
    if (a < 0) parts.push("retournée horizontalement");
    if (d < 0) parts.push("retournée verticalement");
    if (Math.abs(a) !== 1) parts.push(`largeur × ${fmt(Math.abs(a))}`);
    if (Math.abs(d) !== 1) parts.push(`hauteur × ${fmt(Math.abs(d))}`);
    return parts.length ? "Boîte " + parts.join(", ") + "." : "Matrice identité : rien ne change.";
  }

  function maj() {
    const a = Number(aIn.value), d = Number(dIn.value);
    boite.style.transform = `matrix(${a}, 0, 0, ${d}, 0, 0)`;
    av.textContent = fmt(a); dv.textContent = fmt(d);
    css.textContent = `transform: matrix(${fmt(a)}, 0, 0, ${fmt(d)}, 0, 0);`;
    mat.innerHTML =
      `| <span class="col-a">${pad(fmt(a))}</span>  <span class="col-c">${pad("0")}</span>  ${pad("0")} |\n` +
      `| <span class="col-a">${pad("0")}</span>  <span class="col-c">${pad(fmt(d))}</span>  ${pad("0")} |\n` +
      `| ${pad("0")}  ${pad("0")}  ${pad("1")} |`;
    eq.textContent = `x′ = ${fmt(a)} · x\ny′ = ${fmt(d)} · y`;
    etat.textContent = description(a, d);
    boutons.forEach(b => b.setAttribute("aria-pressed",
      Number(b.dataset.a) === a && Number(b.dataset.d) === d ? "true" : "false"));
  }

  aIn.addEventListener("input", maj);
  dIn.addEventListener("input", maj);
  boutons.forEach(b => b.addEventListener("click", () => {
    aIn.value = b.dataset.a; dIn.value = b.dataset.d; maj();
  }));
  maj();
