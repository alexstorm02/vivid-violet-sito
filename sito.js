// =====================================================================
// Script della home di vividviolet.it. Sta in un file a parte (e non
// dentro la pagina) perché la politica di sicurezza (CSP) del sito
// permette solo script che vengono dal sito stesso.
// =====================================================================
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

// L'app, schermata per schermata: sul computer il telefono resta fermo e
// mostra la schermata del passo che stai leggendo (gli altri passi si spengono).
// Senza questo script il telefono mostra il Look e i passi restano tutti accesi.
(() => {
  const corpo = document.querySelector(".corpo-app");
  if (!corpo || !("IntersectionObserver" in window)) return;
  const passi = [...corpo.querySelectorAll(".passo-app")];
  const schermi = [...corpo.querySelectorAll(".fisso img")];
  const accendi = (i) => {
    passi.forEach((p, k) => p.classList.toggle("attivo", k === i));
    schermi.forEach((img, k) => img.classList.toggle("attiva", k === i));
  };
  // un passo è "quello che stai leggendo" quando attraversa la fascia centrale dello schermo
  const oss = new IntersectionObserver((voci) => {
    for (const v of voci) if (v.isIntersecting) accendi(passi.indexOf(v.target));
  }, { rootMargin: "-45% 0px -45% 0px" });
  passi.forEach((p) => oss.observe(p));
  accendi(0);
  corpo.classList.add("vivo");
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
// falliranno dopo.
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
      // statistiche: l'iscrizione conta come obiettivo, solo se hai accettato (vedi consenso.js)
      if (typeof window !== "undefined" && window.vvEvento) window.vvEvento("generate_lead", { modulo: "lista_attesa" });
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
