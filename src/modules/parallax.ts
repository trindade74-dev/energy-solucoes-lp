/**
 * Parallax sem bibliotecas.
 *
 * - Camadas do hero ([data-parallax="0.25"]): cada uma desce numa velocidade
 *   diferente conforme o scroll, criando profundidade (céu lento, chão rápido).
 * - Elementos [data-parallax-soft]: deslocamento sutil (±18px) conforme a
 *   posição deles na tela — usado na "foto" do Quem Somos.
 *
 * Tudo via transform com requestAnimationFrame (sem travar o scroll).
 * Desativado em telas pequenas (<768px) e com prefers-reduced-motion.
 */

export function initParallax(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  const soft = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax-soft]'));
  if (layers.length === 0 && soft.length === 0) return;

  const desktop = window.matchMedia('(min-width: 768px)');
  let ticking = false;

  function update(): void {
    ticking = false;

    // No mobile o parallax sai de cena (limpa qualquer transform que ficou)
    if (!desktop.matches) {
      layers.forEach((el) => (el.style.transform = ''));
      soft.forEach((el) => (el.style.transform = ''));
      return;
    }

    const y = window.scrollY;

    for (const el of layers) {
      const factor = Number(el.dataset.parallax) || 0;
      el.style.transform = `translate3d(0, ${(y * factor).toFixed(1)}px, 0)`;
    }

    for (const el of soft) {
      // distância do centro do elemento até o centro da tela
      const rect = el.getBoundingClientRect();
      const offCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      const shift = Math.max(-18, Math.min(18, -offCenter * 0.045));
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    }
  }

  function request(): void {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  update();
}
