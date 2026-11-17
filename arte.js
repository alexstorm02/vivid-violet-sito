// =====================================================================
// "La moda incontra l'arte": l'opera viene ritagliata e diventa il capo.
// Fasi (attributo data-fase della tavola):
//   opera    → si vede tutta l'opera
//   taglio   → la linea tratteggiata da sarta disegna la sagoma del capo
//   ritaglio → resta solo la parte d'opera dentro la sagoma
//   capo     → compare il capo finito (la foto)
// Senza JavaScript, o con "riduci animazioni", si vede subito il capo;
// le pillole Opera/Capo funzionano comunque (senza movimento).
// =====================================================================
(() => {
  const tavole = [...document.querySelectorAll(".taglio")];
  const galleria = document.querySelector(".galleria");
  const calma = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!calma) document.documentElement.classList.add("anima-arte");

  const attese = new Map();
  function fase(t, f) {
    t.dataset.fase = f;
    const [opera, capo] = t.querySelectorAll(".scegli button");
    opera.setAttribute("aria-pressed", String(f === "opera"));
    capo.setAttribute("aria-pressed", String(f !== "opera"));
  }
  function ferma(t) {
    for (const id of attese.get(t) || []) clearTimeout(id);
    attese.set(t, []);
  }
  function dopo(t, ms, f) {
    attese.get(t).push(setTimeout(f, ms));
  }
  // La sequenza completa, dall'opera al capo.
  function taglia(t) {
    ferma(t);
    if (calma) return fase(t, "capo");
    fase(t, "opera");
    void t.offsetWidth; // riparte da capo anche se era già a metà
    dopo(t, 60, () => fase(t, "taglio"));
    dopo(t, 1900, () => fase(t, "ritaglio"));
    dopo(t, 3300, () => fase(t, "capo"));
  }

  for (const t of tavole) {
    attese.set(t, []);
    const scelta = t.querySelector(".scegli");
    scelta.hidden = false;
    const [opera, capo] = scelta.querySelectorAll("button");
    opera.addEventListener("click", () => { ferma(t); t.dataset.visto = "1"; fase(t, "opera"); });
    capo.addEventListener("click", () => { t.dataset.visto = "1"; taglia(t); });
    if (!calma) fase(t, "opera");
  }

  // Si parte quando la tavola (o la galleria) arriva sullo schermo.
  const quandoVisibile = (el, f, soglia) => {
    if (!("IntersectionObserver" in window)) return f();
    const oss = new IntersectionObserver((voci) => {
      if (voci.some((v) => v.isIntersecting)) { oss.disconnect(); f(); }
    }, { threshold: soglia });
    oss.observe(el);
  };
  if (!calma) {
    for (const t of tavole) quandoVisibile(t, () => { if (!t.dataset.visto) taglia(t); }, 0.5);
    if (galleria) quandoVisibile(galleria, () => galleria.classList.add("appesa"), 0.25);
  }
})();
