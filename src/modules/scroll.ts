/**
 * Comportamentos ligados ao scroll:
 * 1. Header sticky — ganha fundo/sombra depois de rolar um pouco.
 * 2. Botão flutuante de WhatsApp — aparece depois que o hero sai da tela.
 * 3. Reveal on scroll — elementos [data-reveal] entram suavemente
 *    quando ficam visíveis (Intersection Observer).
 */

export function initScroll(): void {
  const header = document.getElementById('header');
  const hero = document.getElementById('inicio');
  const whatsapp = document.getElementById('whatsapp-float');

  // --- 1 e 2: header e botão de WhatsApp (um único handler com rAF) ---
  let ticking = false;

  function onScroll(): void {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;

      header?.classList.toggle('header--scrolled', y > 32);

      if (hero && whatsapp) {
        // visível só depois que o usuário passou do hero
        whatsapp.classList.toggle('is-visible', y > hero.offsetHeight - 120);
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial correto se a página abrir já rolada

  // --- 3: reveal on scroll ---
  const items = document.querySelectorAll('[data-reveal]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    // sem animação: mostra tudo de uma vez
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // revela uma vez só
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}
