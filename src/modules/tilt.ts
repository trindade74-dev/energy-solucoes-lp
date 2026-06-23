/**
 * Tilt 3D nos cards de perfil (Residencial / Comercial / Rural).
 *
 * O card inclina seguindo o mouse, como um produto numa vitrine.
 * O ângulo máximo é pequeno (6°) de propósito — o efeito deve ser sentido,
 * não notado. Só em desktop com mouse; nada em touch ou reduced motion.
 */

const MAX_DEG = 6;

export function initTilt(): void {
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasMouse || reduceMotion) return;

  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      // posição do mouse dentro do card, de -0.5 a 0.5
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `rotateX(${(-py * MAX_DEG).toFixed(2)}deg) rotateY(${(px * MAX_DEG).toFixed(2)}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
