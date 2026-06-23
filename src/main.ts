/**
 * Energy Soluções — ponto de entrada da landing page.
 *
 * Este arquivo só faz duas coisas:
 *  1. Guarda o CONFIG (tudo que o cliente precisa trocar está aqui em cima).
 *  2. Inicializa os módulos de src/modules/ — cada comportamento vive
 *     no seu próprio arquivo pequeno e comentado.
 */

import './style.css';
import { initTheme } from './modules/theme';
import { initScroll } from './modules/scroll';
import { initForm } from './modules/form';
import { initCalculator } from './modules/calculator';
import { initParallax } from './modules/parallax';
import { initSun } from './modules/sun';
import { initTilt } from './modules/tilt';

/* ============================================================================
   CONFIG — valores que o cliente/dev troca sem mexer no resto do código
   ========================================================================== */
const CONFIG = {
  /** 'whatsapp' abre conversa com os dados | 'webhook' envia POST em JSON */
  SUBMIT_MODE: 'whatsapp' as 'whatsapp' | 'webhook',

  /** PLACEHOLDER — número real da Energy com DDI+DDD, só dígitos */
  WHATSAPP_NUMBER: '5561900000000',

  /** PLACEHOLDER — URL do n8n / RD Station quando o cliente integrar */
  WEBHOOK_URL: 'https://exemplo.com/webhook',

  /** PLACEHOLDER — % da conta que vira economia na calculadora (0.9 = 90%) */
  ECONOMIA_PERCENTUAL: 0.9,

  /** Mensagem do botão flutuante de WhatsApp */
  WHATSAPP_MENSAGEM: 'Olá! Vi o site da Energy Soluções e quero saber mais sobre energia solar. ☀️',
};

/* ============================================================================
   Inicialização
   ========================================================================== */

// Sinaliza que o JS carregou — o CSS só esconde o conteúdo do reveal
// quando esta classe existe (se o script falhar, a página aparece inteira)
document.documentElement.classList.add('js');

initTheme();
initScroll();
initParallax();
initSun();
initTilt();
initCalculator(CONFIG.ECONOMIA_PERCENTUAL);
initForm({
  mode: CONFIG.SUBMIT_MODE,
  whatsappNumber: CONFIG.WHATSAPP_NUMBER,
  webhookUrl: CONFIG.WEBHOOK_URL,
});

// Botão flutuante de WhatsApp: o link é montado aqui para o número
// ficar num lugar só (o CONFIG acima)
const whatsappFloat = document.getElementById('whatsapp-float') as HTMLAnchorElement | null;
if (whatsappFloat) {
  whatsappFloat.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(
    CONFIG.WHATSAPP_MENSAGEM
  )}`;
}
