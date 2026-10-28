// ==============================================================================
// UTBELAJAR - UTILITIES & HELPER FUNCTIONS
// ==============================================================================

/**
 * Menampilkan pesan Toast notifikasi yang elegan
 * @param {string} message Pesan yang ingin ditampilkan
 * @param {'success'|'error'|'info'} type Jenis notifikasi
 * @param {number} duration Durasi tampil dalam milidetik
 */
export function showToast(message, type = "info", duration = 4000) {
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
    <div style="flex: 1;">${escapeHtml(message)}</div>
  `;

  container.appendChild(toast);

  // Animasi masuk
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Hapus setelah durasi habis
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Escape string HTML untuk mencegah XSS
 */
export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format tanggal Indonesia ramah pengguna (contoh: 28 Okt 2026, 14:30)
 */
export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format durasi detik menjadi menit dan jam (contoh: 45 Menit, 1 Jam 15 Menit)
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0 Menit";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} Menit`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours} Jam ${remainingMins} Menit` : `${hours} Jam`;
}

/**
 * Pengubah format Markdown sederhana dan aman untuk asisten AI
 */
export function renderMarkdown(markdownText) {
  if (!markdownText) return "";

  // 1. Amankan teks mentah terlebih dahulu
  let text = escapeHtml(markdownText);

  // 2. Blok kode multi-line: ```lang\ncode\n```
  text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // 3. Inline code: `code`
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  // 4. Bold: **text** atau __text__
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // 5. Italic: *text* atau _text_
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>");

  // 6. Header: ### Heading
  text = text.replace(/^### (.*$)/gim, '<h4 style="font-size: 1rem; font-weight:700; margin: 0.6rem 0 0.3rem;">$1</h4>');
  text = text.replace(/^## (.*$)/gim, '<h3 style="font-size: 1.15rem; font-weight:800; margin: 0.8rem 0 0.4rem;">$1</h3>');

  // 7. Bullet lists: - item atau * item
  text = text.replace(/^\s*[-*]\s+(.*)$/gim, "<li>$1</li>");
  text = text.replace(/(<li>.*<\/li>)/gms, '<ul style="padding-left: 1.25rem; margin: 0.5rem 0;">$1</ul>');

  // 8. Numbered lists: 1. item
  text = text.replace(/^\s*\d+\.\s+(.*)$/gim, "<li>$1</li>");

  // 9. Paragraf baru untuk baris ganda
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
}

/**
 * Membuka Modal Dialog berdasarkan ID
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("open");
}

/**
 * Menutup Modal Dialog berdasarkan ID
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("open");
}

/**
 * Efek tombol loading state
 */
export function setButtonLoading(button, isLoading, text = "Memproses...") {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
      <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
      </svg>
      <span>${escapeHtml(text)}</span>
    `;
  } else {
    button.disabled = false;
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
    }
  }
}
