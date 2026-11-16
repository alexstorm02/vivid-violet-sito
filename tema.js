// =====================================================================
// Modalità giorno (bianco) e notte (nero) del sito.
// Va caricato nella <head>, PRIMA che la pagina si disegni: così si
// apre già nel colore giusto, senza "lampo" nero prima del bianco.
//
// - All'inizio segue il telefono o il computer (tema chiaro o scuro).
// - Il pulsante sole/luna (.tema) cambia al volo; la scelta resta
//   salvata nel browser e vale per tutte le pagine del sito.
// Senza JavaScript il sito resta nella modalità notte di sempre.
// =====================================================================
(() => {
  const radice = document.documentElement;
  const sistemaChiaro = matchMedia("(prefers-color-scheme: light)");
  let scelta = null; // "giorno" o "notte" se la persona ha toccato il pulsante
  try {
    const salvata = localStorage.getItem("tema");
    if (salvata === "giorno" || salvata === "notte") scelta = salvata;
  } catch {
    // browser che non permette di salvare (es. navigazione privata molto restrittiva)
  }

  function applica(tema) {
    radice.dataset.tema = tema;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = tema === "giorno" ? "#FFFFFF" : "#0B0910";
    for (const pulsante of document.querySelectorAll(".tema")) {
      pulsante.setAttribute("aria-label", tema === "giorno" ? "Passa alla modalità notte" : "Passa alla modalità giorno");
    }
  }

  applica(scelta ?? (sistemaChiaro.matches ? "giorno" : "notte"));
  // Se la persona non ha scelto, il sito segue il telefono anche mentre è aperto.
  sistemaChiaro.addEventListener("change", (e) => {
    if (!scelta) applica(e.matches ? "giorno" : "notte");
  });

  document.addEventListener("DOMContentLoaded", () => {
    for (const pulsante of document.querySelectorAll(".tema")) {
      pulsante.hidden = false;
      pulsante.addEventListener("click", () => {
        scelta = radice.dataset.tema === "giorno" ? "notte" : "giorno";
        try {
          localStorage.setItem("tema", scelta);
        } catch {
          // la scelta vale solo per questa pagina
        }
        applica(scelta);
      });
    }
    applica(radice.dataset.tema);
  });
})();
