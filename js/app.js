/**
 * Célula Raízes • Projeto Casa 91 • Jejum 21 Dias
 * Configuração e funções comuns
 */

// =====================================================
// CONFIGURAÇÃO - ALTERE AQUI
// =====================================================
const CONFIG = {
  // Cole a URL do seu Google Apps Script (Web App)
  API_URL: 'https://script.google.com/macros/s/AKfycbwCnatU2DH5t4DEU-uikoOY9vFdJU_uj4eueKEnj4GoLPY840MOJwWqs_PTbeAnVeue/exec',

  // Senha da área administrativa
  ADMIN_PASSWORD: 'casa91admin',

  // Semanas do jejum (2026)
  SEMANAS: {
    1: {
      label: '1ª Semana (14/09 a 20/09)',
      dias: [
        { data: '2026-09-14', diaSemana: 'Segunda' },
        { data: '2026-09-15', diaSemana: 'Terça' },
        { data: '2026-09-16', diaSemana: 'Quarta' },
        { data: '2026-09-17', diaSemana: 'Quinta' },
        { data: '2026-09-18', diaSemana: 'Sexta' },
        { data: '2026-09-19', diaSemana: 'Sábado' },
        { data: '2026-09-20', diaSemana: 'Domingo' }
      ]
    },
    2: {
      label: '2ª Semana (21/09 a 27/09)',
      dias: [
        { data: '2026-09-21', diaSemana: 'Segunda' },
        { data: '2026-09-22', diaSemana: 'Terça' },
        { data: '2026-09-23', diaSemana: 'Quarta' },
        { data: '2026-09-24', diaSemana: 'Quinta' },
        { data: '2026-09-25', diaSemana: 'Sexta' },
        { data: '2026-09-26', diaSemana: 'Sábado' },
        { data: '2026-09-27', diaSemana: 'Domingo' }
      ]
    },
    3: {
      label: '3ª Semana (28/09 a 04/10)',
      dias: [
        { data: '2026-09-28', diaSemana: 'Segunda' },
        { data: '2026-09-29', diaSemana: 'Terça' },
        { data: '2026-09-30', diaSemana: 'Quarta' },
        { data: '2026-10-01', diaSemana: 'Quinta' },
        { data: '2026-10-02', diaSemana: 'Sexta' },
        { data: '2026-10-03', diaSemana: 'Sábado' },
        { data: '2026-10-04', diaSemana: 'Domingo' }
      ]
    }
  }
};

// =====================================================
// Tema Dark / Light
// =====================================================
function initTheme() {
  const saved = localStorage.getItem('casa91_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('casa91_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Modo claro' : 'Modo escuro';
  }
}

// =====================================================
// Funções de API
// =====================================================
async function apiGet(action) {
  try {
    const url = `${CONFIG.API_URL}?action=${action}&t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro na requisição');
    return await res.json();
  } catch (err) {
    console.error('apiGet error:', err);
    throw err;
  }
}

async function apiPost(data) {
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Erro na requisição');
    return await res.json();
  } catch (err) {
    console.error('apiPost error:', err);
    throw err;
  }
}

// =====================================================
// Utilitários
// =====================================================
function showAlert(elId, message, type = 'success') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
  setTimeout(() => {
    el.classList.remove('show');
  }, 5000);
}

function formatDateBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (path.endsWith(href) || (path.endsWith('/') && href === 'index.html') || 
        (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// Inicialização comum
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setActiveNav();
});
