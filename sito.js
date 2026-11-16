// =====================================================================
// Script della home di vividviolet.it. Sta in un file a parte (e non
// dentro la pagina) perché la politica di sicurezza (CSP) del sito
// permette solo script che vengono dal sito stesso.
// =====================================================================
// Telefoni in 3D. Chi ha chiesto al telefono di ridurre le animazioni
// vede i telefoni fermi (già inclinati, ma senza movimento).
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Scorrendo la pagina i telefoni "si alzano" mentre entrano nello
  // schermo; nel carosello del telefono, quelli ai lati girano verso il centro.
  const riga = document.querySelector(".telefoni");
  const cornici = [...riga.querySelectorAll(".cornice")];
  const carosello = matchMedia("(max-width: 640px)");
  let inAttesa = false;
  function aggiorna() {
    inAttesa = false;
    const r = riga.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.75)));
    const inclina = ((1 - p) * 30).toFixed(1) + "deg";
    const centro = r.left + r.width / 2;
    for (const c of cornici) {
      c.style.setProperty("--inclina", inclina);
      if (carosello.matches) {
        const rc = c.getBoundingClientRect();
        const d = (rc.left + rc.width / 2 - centro) / r.width;
        c.style.setProperty("--gira", Math.max(-35, Math.min(35, -d * 60)).toFixed(1) + "deg");
        c.style.setProperty("--gx", (35 - d * 80).toFixed(0) + "%");
      } else {
        c.style.removeProperty("--gira");
        c.style.removeProperty("--gx");
      }
    }
  }
  const pianifica = () => { if (!inAttesa) { inAttesa = true; requestAnimationFrame(aggiorna); } };
  addEventListener("scroll", pianifica, { passive: true });
  addEventListener("resize", pianifica);
  riga.addEventListener("scroll", pianifica, { passive: true });
  aggiorna();
})();

// "Come funziona" si cuce quando arriva sullo schermo (vedi lo stile .cucita).
(() => {
  const mattina = document.querySelector(".mattina");
  if (!mattina) return;
  if (!("IntersectionObserver" in window)) return mattina.classList.add("cucita");
  const oss = new IntersectionObserver((voci) => {
    if (voci.some((v) => v.isIntersecting)) { mattina.classList.add("cucita"); oss.disconnect(); }
  }, { threshold: 0.35 });
  oss.observe(mattina);
})();

// Menu "Guide": si chiude toccando fuori o con il tasto Esc.
(() => {
  const menu = document.querySelector(".menu-guide");
  if (!menu) return;
  document.addEventListener("click", (e) => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
  });
})();

// Finché le schermate vere non ci sono, al loro posto compare il monogramma VV.
function mettiSegnaposto(img) {
  img.outerHTML = '<svg viewBox="0 0 264 290" aria-hidden="true"><use href="#logo"/></svg>';
}
// Le immagini già fallite prima che questo file arrivasse, e quelle che
// falliranno dopo (il carosello le carica solo quando servono).
for (const img of document.querySelectorAll("img[data-segnaposto]")) {
  if (img.complete && img.naturalWidth === 0) mettiSegnaposto(img);
  else img.addEventListener("error", () => mettiSegnaposto(img), { once: true });
}

// "Avvisami al lancio": salva l'email nella lista d'attesa (Supabase).
// La chiave qui sotto è quella PUBBLICA: il database permette solo di
// aggiungere un'email con il consenso, mai di leggere la lista.
const SUPABASE_URL = "https://uuwzkvhpurxhmwomjzbr.supabase.co";
const CHIAVE_PUBBLICA = "sb_publishable_FWbB47LH8eO00zMdE0wxpw_2_ETG-Ar";

const modulo = document.getElementById("modulo");
const esito = document.getElementById("esito");
const invia = document.getElementById("invia");
const mostra = (testo, tipo) => { esito.textContent = testo; esito.className = "esito " + tipo; };
// Un errore su un campo: il messaggio compare sotto e il cursore torna
// nel campo da correggere (anche il lettore di schermo lo segnala).
const sbagliato = (campo, testo) => {
  mostra(testo, "errore");
  campo.setAttribute("aria-invalid", "true");
  campo.focus();
};
for (const campo of [modulo.email, modulo.consenso]) {
  campo.setAttribute("aria-describedby", "esito");
  campo.addEventListener("input", () => campo.removeAttribute("aria-invalid"));
}

modulo.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const email = modulo.email.value.trim();
  if (modulo.sito_web.value) return mostra("Grazie! Ti avviseremo al lancio.", "ok"); // probabilmente un programma automatico
  if (email.length > 254) return sbagliato(modulo.email, "Questa email è troppo lunga: controlla di averla scritta bene.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return sbagliato(modulo.email, "Controlla l'indirizzo email.");
  if (!modulo.consenso.checked) return sbagliato(modulo.consenso, "Per avvisarti ci serve il tuo consenso.");

  invia.disabled = true; invia.textContent = "Invio…";
  try {
    const r = await fetch(SUPABASE_URL + "/rest/v1/lista_attesa", {
      method: "POST",
      headers: { apikey: CHIAVE_PUBBLICA, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ email, consenso: true, fonte: "sito" }),
    });
    if (r.ok || r.status === 409) {
      // 409 = email già in lista: rispondiamo allo stesso modo, senza rivelarlo
      mostra("Grazie! Ti avviseremo al lancio.", "ok");
      modulo.reset();
    } else if (r.status === 429) {
      // il database ha fermato troppe iscrizioni ravvicinate (anti-spam)
      mostra("Troppi tentativi in poco tempo. Riprova tra un'ora.", "errore");
    } else if (r.status === 400) {
      // il database ha rifiutato l'indirizzo (formato o lunghezza)
      sbagliato(modulo.email, "Controlla l'indirizzo email: sembra non valido.");
    } else {
      mostra("Qualcosa non ha funzionato. Riprova tra poco o scrivici a info@vividviolet.it.", "errore");
    }
  } catch {
    mostra("Sembra che tu sia offline. Riprova tra poco.", "errore");
  } finally {
    invia.disabled = false; invia.textContent = "Avvisami";
  }
});
