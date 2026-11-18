// =====================================================================
// "La moda incontra l'arte": la copertina di Vertigo segue il mouse
// (3D leggero). Sul telefono, e con "riduci animazioni", resta ferma.
// =====================================================================
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const rivista = document.querySelector(".rivista");
  const copertina = rivista && rivista.querySelector(".copertina");
  if (!copertina) return;
  rivista.addEventListener("mousemove", (e) => {
    const r = rivista.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    copertina.style.setProperty("--gira", (x * 16 - 4).toFixed(1) + "deg");
    copertina.style.setProperty("--inclina", (-y * 10).toFixed(1) + "deg");
  });
  rivista.addEventListener("mouseleave", () => {
    copertina.style.removeProperty("--gira");
    copertina.style.removeProperty("--inclina");
  });
})();
