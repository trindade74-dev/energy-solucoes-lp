/**
 * Tema dia/noite — o easter egg principal da página.
 *
 * De dia (claro): céu quente, sol no hero e painéis "carregando".
 * De noite (escuro): céu estrelado, lua e os painéis PARAM de carregar —
 * quem pausa as animações é o CSS, via variável --charge-play.
 *
 * A preferência fica salva no localStorage; um script inline no <head>
 * reaplica o tema escuro antes da primeira pintura para não piscar.
 */

const STORAGE_KEY = 'energy-theme';

export function initTheme(): void {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function apply(dark: boolean, save: boolean): void {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    toggle!.setAttribute('aria-pressed', String(dark));
    toggle!.setAttribute('aria-label', dark ? 'Ativar modo dia' : 'Ativar modo noite');

    if (save) {
      try {
        localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
      } catch {
        // localStorage indisponível (ex.: modo anônimo restrito) — sem problema
      }
    }
  }

  // Sincroniza o botão com o tema que o script do <head> já aplicou
  apply(document.documentElement.dataset.theme === 'dark', false);

  toggle.addEventListener('click', () => {
    apply(document.documentElement.dataset.theme !== 'dark', true);
  });
}
