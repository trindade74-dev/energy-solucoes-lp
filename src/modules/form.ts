/**
 * Formulário de simulação.
 *
 * Dois modos de envio, escolhidos no CONFIG do main.ts:
 *  - 'whatsapp': abre o WhatsApp da Energy com os dados já escritos na mensagem.
 *  - 'webhook' : faz POST em JSON para uma URL (n8n, RD Station etc.).
 *
 * Também cuida de: validação dos campos obrigatórios, máscara simples de
 * telefone e honeypot anti-spam (campo invisível que só bots preenchem).
 */

export interface FormConfig {
  mode: 'whatsapp' | 'webhook';
  whatsappNumber: string;
  webhookUrl: string;
}

export function initForm(config: FormConfig): void {
  const form = document.getElementById('form-simulacao') as HTMLFormElement | null;
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  // --- Máscara de telefone: (61) 99999-9999 ---
  const phone = form.querySelector<HTMLInputElement>('#f-telefone');
  phone?.addEventListener('input', () => {
    const digits = phone.value.replace(/\D/g, '').slice(0, 11);
    let masked = digits;
    if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length > 7) {
      masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    phone.value = masked;
  });

  // --- Validação: marca os campos obrigatórios vazios ---
  function validate(): boolean {
    let ok = true;

    form!.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[required]').forEach((field) => {
      const wrapper = field.closest('.form__field');
      const empty = field.value.trim() === '';
      // telefone precisa ter pelo menos DDD + 8 dígitos
      const badPhone = field.id === 'f-telefone' && field.value.replace(/\D/g, '').length < 10;
      const invalid = empty || badPhone;

      wrapper?.classList.toggle('has-error', invalid);

      // mensagem de erro abaixo do campo (criada uma vez só)
      let msg = wrapper?.querySelector<HTMLElement>('.form__error') ?? null;
      if (invalid) {
        if (!msg && wrapper) {
          msg = document.createElement('small');
          msg.className = 'form__error';
          wrapper.appendChild(msg);
        }
        if (msg) msg.textContent = badPhone && !empty ? 'Telefone incompleto' : 'Campo obrigatório';
        ok = false;
      } else {
        msg?.remove();
      }
    });

    return ok;
  }

  // Limpa o erro do campo assim que a pessoa começa a corrigir
  form.addEventListener('input', (e) => {
    const field = e.target as HTMLElement;
    const wrapper = field.closest('.form__field');
    if (wrapper?.classList.contains('has-error')) {
      wrapper.classList.remove('has-error');
      wrapper.querySelector('.form__error')?.remove();
    }
  });

  function showStatus(text: string, kind: 'success' | 'error'): void {
    status!.textContent = text;
    status!.classList.toggle('is-success', kind === 'success');
    status!.classList.toggle('is-error', kind === 'error');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: se o campo invisível veio preenchido, é bot — finge sucesso e sai
    const honeypot = form.querySelector<HTMLInputElement>('#f-website');
    if (honeypot && honeypot.value !== '') {
      showStatus('Recebemos seus dados. Obrigado!', 'success');
      form.reset();
      return;
    }

    if (!validate()) {
      showStatus('Confira os campos destacados acima.', 'error');
      return;
    }

    const data = {
      nome: (form.querySelector('#f-nome') as HTMLInputElement).value.trim(),
      telefone: (form.querySelector('#f-telefone') as HTMLInputElement).value.trim(),
      email: (form.querySelector('#f-email') as HTMLInputElement).value.trim(),
      cidade: (form.querySelector('#f-cidade') as HTMLInputElement).value.trim(),
      tipo: (form.querySelector('#f-tipo') as HTMLSelectElement).value,
      conta: (form.querySelector('#f-conta') as HTMLInputElement).value.trim(),
    };

    if (config.mode === 'whatsapp') {
      // Monta a mensagem e abre a conversa no WhatsApp da Energy
      const linhas = [
        'Olá! Quero uma simulação gratuita de energia solar. ☀️',
        '',
        `*Nome:* ${data.nome}`,
        `*Telefone:* ${data.telefone}`,
        data.email ? `*Email:* ${data.email}` : '',
        `*Cidade:* ${data.cidade}`,
        `*Tipo de imóvel:* ${data.tipo}`,
        `*Conta de luz média:* R$ ${data.conta}`,
      ].filter((l) => l !== '');

      const url = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(linhas.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
      showStatus('Abrimos o WhatsApp com seus dados — é só enviar a mensagem!', 'success');
      form.reset();
      return;
    }

    // Modo webhook: POST em JSON com feedback de carregando/sucesso/erro
    const submitBtn = form.querySelector<HTMLButtonElement>('.form__submit');
    const original = submitBtn?.textContent ?? '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }

    try {
      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, origem: 'landing-page' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showStatus('Recebemos seus dados! Em breve entraremos em contato.', 'success');
      form.reset();
    } catch {
      showStatus('Não foi possível enviar agora. Tente de novo ou chame no WhatsApp.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      }
    }
  });
}
