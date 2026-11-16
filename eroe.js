// =====================================================================
// Apertura del sito: il figurino che si disegna e si veste col meteo.
// La tavola (SVG) è già tutta nella pagina: questo file la anima e basta.
// Senza JavaScript, o con "riduci animazioni", resta ferma e già vestita.
//
// 1. la matita disegna il corpo, tratto dopo tratto;
// 2. arrivano i capi del primo meteo (contorno, poi colore e tratteggio);
// 3. le note a margine ("trench", "stivaletti"...) si scrivono per ultime;
// 4. ogni 7 secondi cambia meteo e il figurino si riveste.
// Le pillole sotto la tavola scelgono il meteo e fermano il giro automatico.
// =====================================================================
(() => {
  const tavola = document.querySelector(".tavola-eroe");
  if (!tavola) return;
  const figura = tavola.querySelector(".figura");
  const looks = [...tavola.querySelectorAll(".look")];
  const pillole = [...tavola.querySelectorAll(".scegli button")];
  const dove = tavola.querySelector(".cartellino .dove");
  const frase = tavola.querySelector(".cartellino .frase");
  const icone = [...tavola.querySelectorAll(".cartellino .icona")];
  const titolo = tavola.querySelector(".tavola title");
  const ferma = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let attuale = 0;
  let giro = null;

  // I tempi di ogni tratto: il corpo si disegna veloce, i capi con calma.
  figura.querySelectorAll(".corpo .disegna").forEach((p, i) => {
    p.style.setProperty("--r", (i * 0.07).toFixed(2) + "s");
    p.style.setProperty("--d", "0.9s");
  });
  for (const look of looks) {
    look.querySelectorAll(".disegna").forEach((p, i) => {
      p.style.setProperty("--r", (0.15 + i * 0.06).toFixed(2) + "s");
      p.style.setProperty("--d", "1.1s");
    });
    look.querySelectorAll(".nota").forEach((n, i) => n.style.setProperty("--r", (1.5 + i * 0.25).toFixed(2) + "s"));
  }

  function mostraTesti(i) {
    const l = looks[i].dataset;
    dove.textContent = l.dove;
    frase.textContent = l.frase;
    titolo.textContent = l.titolo;
    icone.forEach((ic, j) => ic.toggleAttribute("hidden", j !== i)); // le icone sono SVG: niente .hidden
    pillole.forEach((p, j) => p.setAttribute("aria-pressed", String(j === i)));
  }

  function vesti(i) {
    if (i === attuale && looks[i].classList.contains("fatto")) return;
    const prima = looks[attuale];
    prima.classList.add("spento");
    prima.classList.remove("fatto");
    attuale = i;
    const dopo = looks[i];
    mostraTesti(i);
    // un attimo per far sparire il look di prima, poi la matita riparte
    setTimeout(() => {
      dopo.classList.remove("spento");
      void dopo.getBoundingClientRect(); // parte dallo stato cancellato
      dopo.classList.add("fatto");
    }, ferma ? 0 : 420);
  }

  function avviaGiro() {
    if (ferma || giro) return;
    giro = setInterval(() => {
      if (!document.hidden) vesti((attuale + 1) % looks.length);
    }, 7000);
  }
  function fermaGiro() {
    clearInterval(giro);
    giro = null;
  }

  pillole.forEach((p, i) =>
    p.addEventListener("click", () => {
      fermaGiro(); // chi sceglie, decide lui: niente più cambi automatici
      vesti(i);
    }),
  );

  if (ferma) {
    // tutto già disegnato, si cambia solo con le pillole
    figura.classList.add("fatto");
    looks[0].classList.add("fatto");
    return;
  }

  // Nella pagina la tavola è già disegnata (per chi non ha JavaScript):
  // la "cancelliamo" e la matita riparte da zero.
  // La cancellatura deve essere istantanea (classe "fermo" = niente transizioni),
  // altrimenti la matita "cancella" e "ridisegna" insieme e non si vede nulla.
  const radice = document.documentElement;
  radice.classList.add("anima-eroe", "fermo");
  figura.classList.remove("fatto");
  looks[0].classList.remove("fatto");
  void figura.getBoundingClientRect(); // applica subito lo stato "cancellato"
  radice.classList.remove("fermo");
  // La matita parte quando la tavola arriva sullo schermo: sul computer
  // subito, sul telefono (dove sta sotto il titolo) quando ci si scorre.
  // (setTimeout e non requestAnimationFrame: parte anche se la scheda non sta ancora disegnando)
  const parti = () =>
    setTimeout(() => {
      figura.classList.add("fatto");
      tavola.querySelector(".griglia")?.classList.add("fatto");
      setTimeout(() => looks[0].classList.add("fatto"), 1100);
      setTimeout(avviaGiro, 1100);
    }, 30);
  if ("IntersectionObserver" in window) {
    const osserva = new IntersectionObserver(
      (voci) => {
        if (voci.some((v) => v.isIntersecting)) {
          osserva.disconnect();
          parti();
        }
      },
      { threshold: 0.3 },
    );
    osserva.observe(tavola.querySelector(".foglio"));
  } else {
    parti();
  }

  // Sul computer il foglio si inclina appena seguendo il mouse.
  const foglio = tavola.querySelector(".foglio");
  const zona = document.querySelector(".eroe") || tavola;
  if (matchMedia("(hover: hover)").matches) {
    zona.addEventListener("pointermove", (e) => {
      const r = zona.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      foglio.style.setProperty("--gira", (x * 10).toFixed(1) + "deg");
      foglio.style.setProperty("--inclina", (-y * 8).toFixed(1) + "deg");
    });
    zona.addEventListener("pointerleave", () => {
      foglio.style.removeProperty("--gira");
      foglio.style.removeProperty("--inclina");
    });
  }
})();
