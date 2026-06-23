// Script de verificação visual: abre a LP no Chromium headless,
// tira screenshots nos 2 temas + mobile e reporta erros de console.
// Uso: node scripts/screenshot.mjs
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const exePath = join(
  process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'),
  'ms-playwright',
  'chromium-1223',
  'chrome-win64',
  'chrome.exe'
);

mkdirSync('screenshots', { recursive: true });

const browser = await chromium.launch({ executablePath: exePath });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200); // fontes + reveal do hero

// 1. Dia (tema claro) — topo
await page.screenshot({ path: 'screenshots/01-hero-dia.png' });

// 2. Noite (tema escuro) — clica no toggle
await page.click('#theme-toggle');
await page.waitForTimeout(900); // transição de tema
await page.screenshot({ path: 'screenshots/02-hero-noite.png' });

// 3. Volta para o dia e rola até a calculadora
await page.click('#theme-toggle');
await page.click('#calc-slider'); // foco
await page.fill('#calc-slider', '1200');
await page.locator('#calculadora').scrollIntoViewIfNeeded();
await page.waitForTimeout(1200); // reveal + count-up
await page.screenshot({ path: 'screenshots/03-calculadora.png' });

// 4. Formulário (seção escura)
await page.locator('#simulacao').scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.screenshot({ path: 'screenshots/04-formulario.png' });

// 5. Validação do formulário: envia vazio e fotografa os erros
await page.click('.form__submit');
await page.waitForTimeout(400);
await page.screenshot({ path: 'screenshots/05-form-erros.png' });

// 6. Mobile (375px) — hero dia
const mobile = await browser.newPage({ viewport: { width: 375, height: 760 } });
mobile.on('pageerror', (err) => errors.push('mobile: ' + String(err)));
await mobile.goto('http://localhost:5174', { waitUntil: 'networkidle' });
await mobile.waitForTimeout(1000);
await mobile.screenshot({ path: 'screenshots/06-mobile-hero.png' });

// 7. Mobile — fim da página (CTA + footer)
await mobile.locator('.footer').scrollIntoViewIfNeeded();
await mobile.waitForTimeout(800);
await mobile.screenshot({ path: 'screenshots/07-mobile-footer.png' });

console.log(errors.length ? `ERROS DE CONSOLE:\n${errors.join('\n')}` : 'Sem erros de console.');
await browser.close();
