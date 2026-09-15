const CONFIG = {
  ADMIN_PASSWORD: "casa91admin",

  SEMANAS: {
    1: {
      label: "1ª Semana (14/09 a 20/09)",
      dias: [
        { data: "2026-09-14", diaSemana: "Segunda" },
        { data: "2026-09-15", diaSemana: "Terça" },
        { data: "2026-09-16", diaSemana: "Quarta" },
        { data: "2026-09-17", diaSemana: "Quinta" },
        { data: "2026-09-18", diaSemana: "Sexta" },
        { data: "2026-09-19", diaSemana: "Sábado" },
        { data: "2026-09-20", diaSemana: "Domingo" }
      ]
    },
    2: {
      label: "2ª Semana (21/09 a 27/09)",
      dias: [
        { data: "2026-09-21", diaSemana: "Segunda" },
        { data: "2026-09-22", diaSemana: "Terça" },
        { data: "2026-09-23", diaSemana: "Quarta" },
        { data: "2026-09-24", diaSemana: "Quinta" },
        { data: "2026-09-25", diaSemana: "Sexta" },
        { data: "2026-09-26", diaSemana: "Sábado" },
        { data: "2026-09-27", diaSemana: "Domingo" }
      ]
    },
    3: {
      label: "3ª Semana (28/09 a 04/10)",
      dias: [
        { data: "2026-09-28", diaSemana: "Segunda" },
        { data: "2026-09-29", diaSemana: "Terça" },
        { data: "2026-09-30", diaSemana: "Quarta" },
        { data: "2026-10-01", diaSemana: "Quinta" },
        { data: "2026-10-02", diaSemana: "Sexta" },
        { data: "2026-10-03", diaSemana: "Sábado" },
        { data: "2026-10-04", diaSemana: "Domingo" }
      ]
    }
  }
};

function initTheme() {
  const saved = localStorage.getItem("casa91_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("casa91_theme", next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.querySelector(".theme-toggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.title = theme === "dark" ? "Modo claro" : "Modo escuro";
  }
}

// Modal de aviso (substitui o antigo showAlert)
function showAlert(elId, message, type = "success") {
  const old = document.querySelector(".modal-overlay");
  if (old) old.remove();

  const icons = { success: "✅", error: "❌", info: "ℹ️" };

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-box ${type}">
      <div class="modal-icon">${icons[type] || "ℹ️"}</div>
      <div class="modal-message">${message}</div>
    </div>
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add("show"));

  setTimeout(() => {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 300);
  }, 3000);
}

function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll(".nav a").forEach(a => {
    const href = a.getAttribute("href");
    if (path.endsWith(href) || (path.endsWith("/") && href === "index.html")) {
      a.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setActiveNav();
});
