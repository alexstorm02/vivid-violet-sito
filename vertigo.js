// =====================================================================
// "Ricevi Vertigo": salva l'email nella lista di Vertigo (Supabase).
// È una lista SEPARATA dalla lista d'attesa dell'app.
// La chiave qui sotto è quella PUBBLICA: il database permette solo di
// aggiungere un'email con il consenso, mai di leggere la lista.
// =====================================================================
(() => {
  const SUPABASE_URL = "https://uuwzkvhpurxhmwomjzbr.supabase.co";
  const CHIAVE_PUBBLICA = "sb_publishable_FWbB47LH8eO00zMdE0wxpw_2_ETG-Ar";

  const modulo = document.getElementById("modulo");
  if (!modulo) return;
  const esito = document.getElementById("esito");
  const invia = document.getElementById("invia");
  const mostra = (testo, tipo) => { esito.textContent = testo; esito.className = "esito " + tipo; };
  // Un errore su un campo: il messaggio compare sotto e il cursore torna nel campo da correggere.
  const sbagliato = (campo, testo) => {
    mostra(testo, "errore");
    campo.setAttribute("aria-invalid", "true");
    campo.focus();
  };
  for (const campo of [modulo.email, modulo.consenso]) {
    campo.setAttribute("aria-describedby", "esito");
    campo.addEventListener("input", () => campo.removeAttribute("aria-invalid"));
  }
  const FATTO = "Fatto! Ti mandiamo Vertigo appena esce il primo numero.";

  modulo.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const email = modulo.email.value.trim();
    if (modulo.sito_web.value) return mostra(FATTO, "ok"); // probabilmente un programma automatico
    if (email.length > 254) return sbagliato(modulo.email, "Questa email è troppo lunga: controlla di averla scritta bene.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return sbagliato(modulo.email, "Controlla l'indirizzo email.");
    if (!modulo.consenso.checked) return sbagliato(modulo.consenso, "Per mandarti Vertigo ci serve il tuo consenso.");

    invia.disabled = true; invia.textContent = "Invio…";
    try {
      const r = await fetch(SUPABASE_URL + "/rest/v1/vertigo_iscritti", {
        method: "POST",
        headers: { apikey: CHIAVE_PUBBLICA, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ email, consenso: true, fonte: "sito" }),
      });
      if (r.ok || r.status === 409) {
        // 409 = email già iscritta: rispondiamo allo stesso modo, senza rivelarlo
        mostra(FATTO, "ok");
        modulo.reset();
      } else if (r.status === 429) {
        mostra("Troppi tentativi in poco tempo. Riprova tra un'ora.", "errore");
      } else if (r.status === 400) {
        sbagliato(modulo.email, "Controlla l'indirizzo email: sembra non valido.");
      } else {
        mostra("Qualcosa non ha funzionato. Riprova tra poco o scrivici a info@vividviolet.it.", "errore");
      }
    } catch {
      mostra("Sembra che tu sia offline. Riprova tra poco.", "errore");
    } finally {
      invia.disabled = false; invia.textContent = "Iscrivimi";
    }
  });
})();
