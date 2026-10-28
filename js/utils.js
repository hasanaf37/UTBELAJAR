// ==============================================================================
// UTBELAJAR - UTILITIES & HELPER FUNCTIONS
// ==============================================================================

window.showToast = function (message, type = "info", duration = 4000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconMap = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4169F5" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  toast.innerHTML = `
    <span>${iconMap[type] || iconMap.info}</span>
    <div style="flex: 1;">${window.escapeHtml(message)}</div>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

window.escapeHtml = function (str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

window.formatDate = function (dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

window.formatDateTime = function (dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

window.formatRelativeTime = function (dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 0) return "Baru saja";
  if (diffSec < 45) return "Baru saja";
  if (diffSec < 120) return "1 menit lalu";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  return window.formatDateTime(dateString);
};

window.formatDuration = function (seconds) {
  if (!seconds || seconds <= 0) return "0 Menit";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins || 1} Menit`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours} Jam ${remainingMins} Menit` : `${hours} Jam`;
};

window.renderMarkdown = function (markdownText) {
  if (!markdownText) return "";

  let text = window.escapeHtml(markdownText);

  text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>");

  text = text.replace(/^### (.*$)/gim, '<h4 style="font-size: 1rem; font-weight:700; margin: 0.6rem 0 0.3rem;">$1</h4>');
  text = text.replace(/^## (.*$)/gim, '<h3 style="font-size: 1.15rem; font-weight:800; margin: 0.8rem 0 0.4rem;">$1</h3>');

  text = text.replace(/^\s*[-*]\s+(.*)$/gim, "<li>$1</li>");
  text = text.replace(/(<li>.*<\/li>)/gms, '<ul style="padding-left: 1.25rem; margin: 0.5rem 0;">$1</ul>');
  text = text.replace(/^\s*\d+\.\s+(.*)$/gim, "<li>$1</li>");

  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .map((p) => {
      p = p.trim();
      if (!p) return "";
      if (p.startsWith("<pre>") || p.startsWith("<ul") || p.startsWith("<h3") || p.startsWith("<h4")) {
        return p;
      }
      return `<p>${p.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
};

window.openModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("open");
};

window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("open");
};

window.setButtonLoading = function (button, isLoading, text = "Memproses...") {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span>${window.escapeHtml(text)}</span>`;
  } else {
    button.disabled = false;
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
    }
  }
};
