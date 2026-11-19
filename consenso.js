// =====================================================================
// Statistiche (Google Analytics 4), solo con il consenso.
// Prima della scelta: nessuno script di Google e nessun cookie.
// La scelta resta nel browser (localStorage: non è un cookie) e si
// cambia quando vuoi dal link "Preferenze cookie" in fondo alla pagina.
// "Rifiuta" e "Accetta" hanno lo stesso peso, come chiede il Garante.
// =====================================================================
(() => {
  const ID = "G-9LYQ5MGRXB";
  const CHIAVE = "vv-statistiche"; // "si" oppure "no"
  const leggi = () => { try { return localStorage.getItem(CHIAVE); } catch { return null; } };
  const salva = (v) => { try { localStorage.setItem(CHIAVE, v); } catch { /* navigazione privata: chiederemo di nuovo */ } };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  let attivo = false;

  // Analytics parte solo da qui, dopo "Accetta": niente pubblicità, niente Google Signals,
  // cookie che durano al massimo 13 mesi.
  function avvia() {
    if (attivo) return;
    attivo = true;
    gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    gtag("js", new Date());
    gtag("config", ID, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 60 * 60 * 24 * 395 });
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
    document.head.appendChild(s);
  }

  // Per gli altri script del sito: un evento (es. iscrizione) si conta solo se le statistiche sono attive.
  window.vvEvento = (nome, dati) => { if (attivo) gtag("event", nome, dati || {}); };

  // Se si passa da "Accetta" a "Rifiuta": via i cookie di Analytics già salvati.
  function cancellaCookie() {
    const domini = ["", "; domain=" + location.hostname, "; domain=." + location.hostname.replace(/^www\./, "")];
    for (const c of document.cookie.split(";")) {
      const nome = c.split("=")[0].trim();
      if (nome === "_ga" || nome.startsWith("_ga_")) {
        for (const d of domini) document.cookie = nome + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
      }
    }
  }

  const STILE = `
.vv-consenso { position: fixed; z-index: 60; left: 16px; right: 16px; bottom: 16px; max-width: 560px; margin: 0 auto; padding: 20px 22px; display: grid; gap: 14px;
  background: #100D17; color: #F6F4FA; border: 1px solid #2E2742; border-top-color: #3A3446; border-radius: 22px;
  box-shadow: 0 6px 0 #0B0910, 0 30px 60px -20px rgba(0,0,0,.9); font: 400 14px/1.55 "Montserrat", system-ui, sans-serif; }
.vv-consenso p { margin: 0; }
.vv-consenso strong { font: 500 19px/1.2 "Cormorant Garamond", Georgia, serif; display: block; margin-bottom: 4px; }
.vv-consenso a { color: #A78BFA; }
.vv-scelte { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.vv-scelte button { min-height: 46px; border-radius: 999px; border: 1.5px solid #C8CAD2; background: transparent; color: #F6F4FA; font: 600 14px "Montserrat", system-ui, sans-serif; cursor: pointer; }
.vv-scelte button:hover, .vv-scelte button:focus-visible { border-color: #A78BFA; color: #fff; }
.vv-consenso button:focus-visible, .vv-preferenze:focus-visible { outline: 2px solid #C8CAD2; outline-offset: 3px; }
.vv-preferenze { background: none; border: 0; padding: 0; font: inherit; color: inherit; text-decoration: underline; cursor: pointer; }
html[data-tema="giorno"] .vv-consenso { background: #FFFFFF; color: #0B0910; border-color: #E4E0EB; box-shadow: 0 6px 0 #ECE9F2, 0 30px 60px -24px rgba(30,20,50,.35); }
html[data-tema="giorno"] .vv-consenso a { color: #6D28D9; }
html[data-tema="giorno"] .vv-scelte button { border-color: #0B0910; color: #0B0910; }
html[data-tema="giorno"] .vv-scelte button:hover, html[data-tema="giorno"] .vv-scelte button:focus-visible { border-color: #6D28D9; color: #6D28D9; }`;

  function banner() {
    if (document.querySelector(".vv-consenso")) return;
    if (!document.getElementById("vv-consenso-stile")) {
      const st = document.createElement("style");
      st.id = "vv-consenso-stile";
      st.textContent = STILE;
      document.head.appendChild(st);
    }
    const b = document.createElement("section");
    b.className = "vv-consenso";
    b.setAttribute("aria-label", "Statistiche e cookie");
    b.innerHTML =
      '<p><strong>Ci aiuti a migliorare il sito?</strong>Se accetti, usiamo Google Analytics per contare le visite e capire quali pagine servono di più. Niente pubblicità. Puoi cambiare idea quando vuoi da “Preferenze cookie”, in fondo alla pagina. <a href="/privacy.html#statistiche">Informativa</a></p>' +
      '<div class="vv-scelte"><button type="button" data-scelta="no">Rifiuta</button><button type="button" data-scelta="si">Accetta</button></div>';
    b.addEventListener("click", (e) => {
      const pulsante = e.target.closest ? e.target.closest("[data-scelta]") : null;
      if (!pulsante) return;
      const scelta = pulsante.getAttribute("data-scelta");
      salva(scelta);
      b.remove();
      if (scelta === "si") avvia();
      else if (attivo) { cancellaCookie(); location.reload(); } // Analytics era già partito: si ricarica senza
      else cancellaCookie();
    });
    document.body.appendChild(b);
  }

  // Il link "Preferenze cookie" in fondo alla pagina (nell'ultimo <footer>).
  function linkPreferenze() {
    const piedi = document.querySelectorAll("footer");
    const piede = piedi[piedi.length - 1];
    if (!piede) return;
    const dove = piede.querySelector("span:last-child") || piede;
    const l = document.createElement("button");
    l.type = "button";
    l.className = "vv-preferenze";
    l.textContent = "Preferenze cookie";
    l.addEventListener("click", banner);
    dove.append(" · ", l);
  }

  const scelta = leggi();
  if (scelta === "si") avvia();
  const pronto = () => {
    linkPreferenze();
    if (scelta !== "si" && scelta !== "no") banner();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pronto);
  else pronto();
})();
