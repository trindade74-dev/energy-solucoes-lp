/**
 * Calculadora de economia (estilo Tesla).
 *
 * O visitante arrasta o slider até o valor médio da conta de luz e vê,
 * em tempo real, a economia estimada em 1, 5 e 25 anos — com os números
 * "contando" até o valor (count-up).
 *
 * A taxa de economia vem do CONFIG no main.ts (ECONOMIA_PERCENTUAL).
 * O botão "Quero essa economia" pré-preenche o valor da conta no
 * formulário e rola até ele.
 */

const formatBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export function initCalculator(savingsRate: number): void {
  const slider = document.getElementById('calc-slider') as HTMLInputElement | null;
  const bill = document.getElementById('calc-bill');
  const outputs = document.querySelectorAll<HTMLElement>('[data-calc-out]');
  const cta = document.getElementById('calc-cta');
  if (!slider || !bill || outputs.length === 0) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Anima um número de "from" até "to" em ~500ms (ou direto, se reduced motion)
  function animateValue(el: HTMLElement, to: number): void {
    const from = Number(el.dataset.current ?? 0);
    el.dataset.current = String(to);

    if (reduceMotion || from === to) {
      el.textContent = formatBRL.format(to);
      return;
    }

    const start = performance.now();
    const duration = 500;

    function tick(now: number): void {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easing "ease-out"
      el.textContent = formatBRL.format(Math.round(from + (to - from) * eased));
      // se outro update começou no meio do caminho, este desiste
      if (t < 1 && el.dataset.current === String(to)) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function update(): void {
    const value = Number(slider!.value);

    // valor da conta no topo do card
    bill!.textContent = formatBRL.format(value);

    // preenchimento visual da trilha do slider (variável usada no CSS)
    const min = Number(slider!.min);
    const max = Number(slider!.max);
    const percent = ((value - min) / (max - min)) * 100;
    slider!.style.setProperty('--fill', `${percent}%`);

    // economia mensal estimada -> projeções de 1, 5 e 25 anos
    const monthly = value * savingsRate;
    outputs.forEach((el) => {
      const years = Number(el.dataset.calcOut);
      animateValue(el, Math.round(monthly * 12 * years));
    });
  }

  slider.addEventListener('input', update);
  update(); // valores iniciais

  // CTA: leva o valor escolhido direto para o formulário
  cta?.addEventListener('click', () => {
    const contaField = document.getElementById('f-conta') as HTMLInputElement | null;
    if (contaField) contaField.value = slider.value;
    document.getElementById('simulacao')?.scrollIntoView({ behavior: 'smooth' });
  });
}
