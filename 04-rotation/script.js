  const $ = id => document.getElementById(id);
  const boite = $("boite"), temoin = $("temoin"), stage = $("stage");
  const angleIn = $("angle"), kIn = $("k");
  const boutons = document.querySelectorAll("#presets button");

  const fmt = (n, p = 3) => { const r = Math.round(n * 10 ** p) / 10 ** p; return Object.is(r, -0) ? "0" : r.toString(); };
  const pad = s => s.padStart(6, " ");

  function maj() {
    const t = Number(angleIn.value), k = Number(kIn.value);
    const r = t * Math.PI / 180;
    const a = k * Math.cos(r), b = k * Math.sin(r), c = -k * Math.sin(r), d = k * Math.cos(r);
    const mx = `matrix(${fmt(a)}, ${fmt(b)}, ${fmt(c)}, ${fmt(d)}, 0, 0)`;

    boite.style.transform = mx;
    temoin.style.transform = `rotate(${t}deg) scale(${k})`;
    $("mesure").style.transform = `rotate(${t}deg) scale(${k})`;
    $("anglev").textContent = t + "°";
    $("kv").textContent = fmt(k, 2);
    $("css").textContent = `transform: ${mx};`;
    $("mat").innerHTML =
      `| <span class="col-a">${pad(fmt(a))}</span>  <span class="col-c">${pad(fmt(c))}</span>  ${pad("0")} |\n` +
      `| <span class="col-a">${pad(fmt(b))}</span>  <span class="col-c">${pad(fmt(d))}</span>  ${pad("0")} |\n` +
      `| ${pad("0")}  ${pad("0")}  ${pad("1")} |`;
    const kTxt = k === 1 ? "" : `${fmt(k, 2)} · `;
    $("eq").textContent =
      `a = ${kTxt}cos ${t}°   b = ${kTxt}sin ${t}°\nc = −${kTxt}sin ${t}°  d = ${kTxt}cos ${t}°\n\ndét = ${fmt(a * d - b * c)}`;
    $("etat").textContent = k === 1
      ? "Rotation pure : le déterminant vaut cos² + sin² = 1, l’aire est conservée."
      : `Rotation et agrandissement : les quatre valeurs sont multipliées par ${fmt(k, 2)}, l’aire par ${fmt(k * k)} (k²).`;

    const s = 60;
    $("lx").setAttribute("x2", s * a); $("lx").setAttribute("y2", s * b);
    $("ly").setAttribute("x2", s * c); $("ly").setAttribute("y2", s * d);
    $("px").setAttribute("cx", s * a); $("px").setAttribute("cy", s * b);
    $("py").setAttribute("cx", s * c); $("py").setAttribute("cy", s * d);
    $("projA").setAttribute("x1", s * a); $("projA").setAttribute("y1", s * b);
    $("projA").setAttribute("x2", s * a); $("projA").setAttribute("y2", 0);
    $("projB").setAttribute("x1", s * a); $("projB").setAttribute("y1", s * b);
    $("projB").setAttribute("x2", 0); $("projB").setAttribute("y2", s * b);

    boutons.forEach(btn => btn.setAttribute("aria-pressed", Number(btn.dataset.t) === t ? "true" : "false"));

    {
      try {
        const lu = getComputedStyle($("mesure")).transform;
        const v = lu.match(/matrix\(([^)]+)\)/);
        let txt = `Écrit :  transform: rotate(${t}deg) scale(${k});\nLu :     ${lu}`;
        if (v) {
          const [la, lb] = v[1].split(",").map(Number);
          txt += `\nAngle :  atan2(b, a) = ${fmt(Math.atan2(lb, la) * 180 / Math.PI, 1)}°`;
          txt += `\nÉchelle : √(a² + b²) = ${fmt(Math.hypot(la, lb), 2)}`;
        }
        $("lu").textContent = txt;
      } catch (e) { $("lu").textContent = "Lecture impossible dans ce navigateur."; }
    }
  }

  angleIn.addEventListener("input", maj);
  kIn.addEventListener("input", maj);
  $("comparer").addEventListener("change", e => { stage.classList.toggle("comparer", e.target.checked); maj(); });
  boutons.forEach(btn => btn.addEventListener("click", () => { angleIn.value = btn.dataset.t; maj(); }));
  maj();
