  const boite = document.getElementById("boite");
  const eIn = document.getElementById("e"), fIn = document.getElementById("f");
  const ev = document.getElementById("ev"), fv = document.getElementById("fv");
  const css = document.getElementById("css"), eq = document.getElementById("eq");

  function signe(n) { return n < 0 ? "− " + Math.abs(n) : "+ " + n; }

  function maj() {
    const e = Number(eIn.value), f = Number(fIn.value);
    boite.style.transform = `matrix(1, 0, 0, 1, ${e}, ${f})`;
    ev.textContent = e; fv.textContent = f;
    css.textContent = `transform: matrix(1, 0, 0, 1, ${e}, ${f});`;
    eq.textContent = `x′ = x ${signe(e)}\ny′ = y ${signe(f)}`;
  }

  eIn.addEventListener("input", maj);
  fIn.addEventListener("input", maj);
  document.getElementById("identite").addEventListener("click", () => { eIn.value = 0; fIn.value = 0; maj(); });
  document.getElementById("exemple").addEventListener("click", () => { eIn.value = 80; fIn.value = 30; maj(); });
  maj();
