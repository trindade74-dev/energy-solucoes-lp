/**
 * Sol interativo do hero (easter egg).
 *
 * - Os raios deslizam sutilmente em direção ao cursor (com suavização/lerp).
 * - Clique de DIA: o sol "explode" em raios + um flash de luz na cena.
 * - Clique de NOITE: as estrelas piscam em conjunto.
 *
 * O CSS anima o giro com a propriedade `rotate` e o burst com `scale`;
 * aqui usamos só `translate` — as três compõem sem brigar entre si.
 * Desativado em touch e com prefers-reduced-motion.
 */

export function initSun(): void {
  const sun = document.getElementById('hero-sun');
  const rays = document.getElementById('hero-sun-rays');
  const hero = document.getElementById('inicio');
  const flash = document.getElementById('hero-flash');
  const stars = document.querySelector<SVGGElement>('.stars');
  if (!sun || !rays || !hero) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Clique: burst de dia / piscar de estrelas à noite ---
  sun.addEventListener('click', () => {
    if (reduceMotion) return;

    const isNight = document.documentElement.dataset.theme === 'dark';

    if (isNight) {
      if (!stars) return;
      stars.classList.remove('is-blink');
      void stars.getBoundingClientRect(); // força reinício da animação
      stars.classList.add('is-blink');
      window.setTimeout(() => stars.classList.remove('is-blink'), 950);
      return;
    }

    sun.classList.remove('is-burst');
    flash?.classList.remove('is-flashing');
    void sun.getBoundingClientRect(); // idem: reinicia a animação a cada clique
    sun.classList.add('is-burst');
    flash?.classList.add('is-flashing');
    window.setTimeout(() => {
      sun.classList.remove('is-burst');
      flash?.classList.remove('is-flashing');
    }, 750);
  });

  // --- Inclinação suave em direção ao cursor (só desktop com mouse) ---
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!hasMouse || reduceMotion) return;

  const MAX_SHIFT = 12; // deslocamento máximo em px
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = 0;

  hero.addEventListener('mousemove', (e) => {
    const rect = sun.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy) || 1;
    const pull = Math.min(MAX_SHIFT, dist * 0.04);

    targetX = (dx / dist) * pull;
    targetY = (dy / dist) * pull;
    if (rafId === 0) rafId = requestAnimationFrame(follow);
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    if (rafId === 0) rafId = requestAnimationFrame(follow);
  });

  function follow(): void {
    // lerp: anda 8% do caminho por frame — movimento com inércia gostosa
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    rays!.style.translate = `${currentX.toFixed(2)}px ${currentY.toFixed(2)}px`;

    const settled = Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1;
    rafId = settled ? 0 : requestAnimationFrame(follow);
  }
}
