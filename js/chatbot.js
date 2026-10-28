// ==============================================================================
// UTBELAJAR - ASISTEN BELAJAR AI CHATBOT LOGIC
// ==============================================================================

import { supabase } from "./supabase.js";
import { requireAuth } from "./auth.js";
import { showToast, renderMarkdown, escapeHtml, openModal, closeModal } from "./utils.js";
import { APP_CONFIG } from "./config.js";

let currentUser = null;
let activeConversationId = null;
let conversations = [];
let isSending = false;

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;

  setupChatInput();
  setupPromptChips();
  await loadConversations();
});

/**
 * Memuat daftar percakapan sebelumnya milik user
 */
async function loadConversations() {
  const listEl = document.getElementById("chat-history-list");
  if (!listEl) return;

  try {
    const { data: convs, error } = await supabase
      .from("ai_conversations")
      .select("id, title, updated_at")
      .eq("user_id", currentUser.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    conversations = convs || [];

    renderConversationsList();
  } catch (err) {
    console.warn("Gagal memuat riwayat percakapan:", err.message);
  }
}

function renderConversationsList() {
  const listEl = document.getElementById("chat-history-list");
  if (!listEl) return;

  if (conversations.length === 0) {
    listEl.innerHTML = `
      <div style="padding: 1rem; font-size: 0.8rem; color: #94A3B8; text-align: center;">
        Belum ada riwayat percakapan.
      </div>
    `;
    return;
  }

  listEl.innerHTML = conversations
    .map(
      (c) => `
    <div class="history-item ${c.id === activeConversationId ? "active" : ""}" data-id="${c.id}">
      <span class="history-title">${escapeHtml(c.title)}</span>
      <button class="history-delete-btn" data-delete-id="${c.id}" title="Hapus Percakapan">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  `
    )
    .join("");

  listEl.querySelectorAll(".history-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      if (e.target.closest(".history-delete-btn")) return;
      selectConversation(item.dataset.id);
    });
  });

  listEl.querySelectorAll(".history-delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      confirmDeleteConversation(btn.dataset.deleteId);
    });
  });
}

/**
 * Memilih percakapan dan memuat pesan-pesan di dalamnya
 */
async function selectConversation(convId) {
  activeConversationId = convId;
  renderConversationsList();

  const messagesContainer = document.getElementById("chat-messages-container");
  if (!messagesContainer) return;

  messagesContainer.innerHTML = `<div class="skeleton" style="height: 60px; margin-bottom: 1rem;"></div>`;

  try {
    const { data: messages, error } = await supabase
      .from("ai_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    messagesContainer.innerHTML = "";

    if (!messages || messages.length === 0) {
      showWelcomeBox();
      return;
    }

    messages.forEach((m) => {
      appendMessageBubble(m.role, m.content, false);
    });

    scrollToBottom();
  } catch (err) {
    showToast("Gagal memuat pesan: " + err.message, "error");
  }
}

/**
 * Pengaturan input textarea & tombol kirim
 */
function setupChatInput() {
  const textarea = document.getElementById("chat-input-textarea");
  const sendBtn = document.getElementById("chat-send-btn");
  const newChatBtn = document.getElementById("btn-new-chat");

  if (!textarea || !sendBtn) return;

  // Auto resize tinggi textarea
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  });

  // Kirim dengan Enter (Shift + Enter untuk baris baru)
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  sendBtn.addEventListener("click", handleSendMessage);

  // Tombol percakapan baru
  newChatBtn?.addEventListener("click", () => {
    activeConversationId = null;
    renderConversationsList();
    showWelcomeBox();
  });
}

/**
 * Chip Saran Prompt Cepat
 */
function setupPromptChips() {
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".prompt-chip");
    if (chip) {
      const prompt = chip.dataset.prompt || chip.textContent.trim();
      const textarea = document.getElementById("chat-input-textarea");
      if (textarea) {
        textarea.value = prompt;
        textarea.focus();
        handleSendMessage();
      }
    }
  });
}

function showWelcomeBox() {
  const messagesContainer = document.getElementById("chat-messages-container");
  if (!messagesContainer) return;

  messagesContainer.innerHTML = `
    <div class="chat-welcome-box">
      <div class="welcome-ai-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/><path d="M12 8v4l3 3"/></svg>
      </div>
      <h3>Halo! Saya UTBelajar AI</h3>
      <p>Asisten belajar digital independenmu. Tanyakan konsep mata kuliah, strategi belajar, rangkuman materi, atau latihan soal.</p>
      
      <div class="prompt-chips-grid">
        <div class="prompt-chip" data-prompt="Jelaskan konsep basis data relasional dan bentuk normalisasi (1NF sampai 3NF) dengan sederhana.">
          💡 Jelaskan konsep basis data & normalisasi
        </div>
        <div class="prompt-chip" data-prompt="Bantu saya memahami perbedaan metodologi Agile Scrum dan Waterfall dalam Rekayasa Perangkat Lunak.">
          📚 Perbedaan Agile Scrum vs Waterfall
        </div>
        <div class="prompt-chip" data-prompt="Buatkan 3 contoh latihan soal pilihan ganda tentang Analisis dan Perancangan Sistem beserta jawabannya.">
          📝 Buatkan latihan soal pilihan ganda
        </div>
        <div class="prompt-chip" data-prompt="Bagaimana strategi belajar mandiri yang efektif agar nilai ujian maksimal?">
          🎯 Strategi belajar mandiri efektif
        </div>
      </div>
    </div>
  `;
}

/**
 * Mengirim pesan ke Supabase Edge Function ai-chat
 */
async function handleSendMessage() {
  if (isSending) return;

  const textarea = document.getElementById("chat-input-textarea");
  const message = textarea.value.trim();
  if (!message) return;

  // Hapus welcome box jika masih ada
  const welcomeBox = document.querySelector(".chat-welcome-box");
  if (welcomeBox) welcomeBox.remove();

  // Reset textarea
  textarea.value = "";
  textarea.style.height = "auto";
  isSending = true;

  // Tampilkan pesan user di UI
  appendMessageBubble("user", message);
  scrollToBottom();

  // Tampilkan typing indicator
  showTypingIndicator();

  try {
    // Panggil Supabase Edge Function ai-chat
    const { data, error } = await supabase.functions.invoke(APP_CONFIG.AI_FUNCTION_NAME, {
      body: {
        message,
        conversation_id: activeConversationId,
      },
    });

    hideTypingIndicator();

    if (error) {
      // Periksa apakah layanan AI belum disetel (503)
      if (error.message?.includes("503") || error.context?.status === 503) {
        appendMessageBubble(
          "assistant",
          "⚠️ **Layanan AI Belum Dikonfigurasi**\n\nFungsi backend siap, namun API Key (`GEMINI_API_KEY` atau `OPENAI_API_KEY`) belum dimasukkan pada Supabase Secrets. Silakan hubungi pengelola sistem untuk mengaktifkannya."
        );
      } else {
        throw error;
      }
    } else if (data) {
      if (data.conversation_id && !activeConversationId) {
        activeConversationId = data.conversation_id;
        await loadConversations();
      }
      appendMessageBubble("assistant", data.reply || "Maaf, tidak ada respons yang dihasilkan.");
    }
  } catch (err) {
    hideTypingIndicator();
    appendMessageBubble(
      "assistant",
      `⚠️ **Koneksi Asisten AI Gagal:** ${escapeHtml(err.message || "Layanan AI sedang tidak dapat diakses saat ini.")}`
    );
  } finally {
    isSending = false;
    scrollToBottom();
  }
}

/**
 * Menambahkan bubble pesan ke dalam chat
 */
function appendMessageBubble(role, content, animate = true) {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;

  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const isUser = role === "user";
  const avatarText = isUser ? "Anda" : "AI";

  const formattedHtml = isUser ? escapeHtml(content).replace(/\n/g, "<br>") : renderMarkdown(content);

  row.innerHTML = `
    <div class="message-avatar">${avatarText}</div>
    <div class="message-bubble">
      ${!isUser ? '<button class="copy-btn">Salin</button>' : ""}
      ${formattedHtml}
    </div>
  `;

  // Listener tombol salin teks
  if (!isUser) {
    const copyBtn = row.querySelector(".copy-btn");
    copyBtn?.addEventListener("click", () => {
      navigator.clipboard.writeText(content);
      copyBtn.textContent = "Tersalin!";
      setTimeout(() => (copyBtn.textContent = "Salin"), 2000);
    });
  }

  container.appendChild(row);
}

function showTypingIndicator() {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;

  const indicator = document.createElement("div");
  indicator.id = "chat-typing-indicator";
  indicator.className = "message-row assistant";
  indicator.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="message-bubble">
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  container.appendChild(indicator);
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById("chat-typing-indicator");
  if (indicator) indicator.remove();
}

function scrollToBottom() {
  const container = document.getElementById("chat-messages-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

/**
 * Hapus sesi percakapan
 */
let conversationToDelete = null;

function confirmDeleteConversation(convId) {
  conversationToDelete = convId;
  openModal("modal-delete-chat");
}

document.getElementById("btn-cancel-delete-chat")?.addEventListener("click", () => {
  closeModal("modal-delete-chat");
});

document.getElementById("btn-proceed-delete-chat")?.addEventListener("click", async () => {
  if (!conversationToDelete) return;

  try {
    const { error } = await supabase.from("ai_conversations").delete().eq("id", conversationToDelete);
    if (error) throw error;

    showToast("Percakapan berhasil dihapus.", "success");
    if (activeConversationId === conversationToDelete) {
      activeConversationId = null;
      showWelcomeBox();
    }
    await loadConversations();
  } catch (err) {
    showToast("Gagal menghapus: " + err.message, "error");
  } finally {
    closeModal("modal-delete-chat");
    conversationToDelete = null;
  }
});
