// ==============================================================================
// UTBELAJAR - ASISTEN BELAJAR AI CHATBOT LOGIC (FILE:// & HTTP:// READY)
// ==============================================================================

(function () {
  const DEFAULT_SYSTEM_PROMPT =
    "Anda adalah UTBelajar AI, asisten belajar digital independen untuk mahasiswa. Berikan penjelasan materi kuliah, rangkuman modul, dan contoh soal latihan dengan bahasa Indonesia yang terstruktur, ramah, dan mudah dipahami.";

  let currentUser = null;
  let activeConversationId = null;
  let isSending = false;
  let chatHistory = [];

  function getAiConfig() {
    try {
      const raw = localStorage.getItem("utb_ai_config");
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          provider: parsed.provider || "gemini",
          model: parsed.model || "gemini-2.0-flash",
          apiKey: (parsed.apiKey || "").trim(),
          customEndpoint: (parsed.customEndpoint || "").trim(),
          systemPrompt: parsed.systemPrompt || DEFAULT_SYSTEM_PROMPT,
          updatedAt: parsed.updatedAt || null,
        };
      }
    } catch (_) {}
    return {
      provider: "gemini",
      model: "gemini-2.0-flash",
      apiKey: "",
      customEndpoint: "",
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      updatedAt: null,
    };
  }

  document.addEventListener("DOMContentLoaded", async () => {
    // Pasang event listener input & tombol Enter seketika agar tidak pernah tertunda
    setupChatInput();
    setupPromptChips();

    // 1. Sinkronkan konfigurasi AI dari Supabase terlebih dahulu agar siswa & seluruh perangkat langsung terhubung ke OpenRouter
    if (typeof window.dbGetAiConfig === "function") {
      try {
        await window.dbGetAiConfig();
      } catch (_) {}
    }

    updateAiHeaderStatus();

    currentUser = await window.requireAuth();
    if (!currentUser) return;

    try {
      const isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
      if (isAdmin) {
        initAdminAiConfigPanel();
      }
    } catch (err) {
      console.warn("Info panel admin AI:", err.message);
    }

    updateAiHeaderStatus();
  });

  function updateAiHeaderStatus() {
    const cfg = getAiConfig();
    const statusEl = document.querySelector(".chat-agent-status");
    const badgeEl = document.getElementById("admin-ai-status-badge");

    if (cfg.apiKey || (cfg.provider === "custom" && cfg.customEndpoint)) {
      const providerLabel =
        cfg.provider === "gemini"
          ? "Google Gemini"
          : cfg.provider === "openrouter"
          ? "OpenRouter"
          : cfg.provider === "openai"
          ? "OpenAI"
          : cfg.provider === "groq"
          ? "Groq Cloud"
          : cfg.provider === "custom"
          ? "Custom AI"
          : "Supabase Edge";
      if (statusEl) statusEl.textContent = `● Terhubung (${providerLabel} — ${cfg.model})`;
      if (badgeEl) {
        badgeEl.className = "badge badge-success";
        badgeEl.textContent = `API Key Aktif (${providerLabel})`;
      }
    } else {
      if (statusEl) statusEl.textContent = "● Asisten Belajar Aktif";
      if (badgeEl) {
        badgeEl.className = "badge badge-warning";
        badgeEl.textContent = "Mode Asisten Bawaan (API Key Belum Diisi)";
      }
    }
  }

  function initAdminAiConfigPanel() {
    const panel = document.getElementById("admin-ai-config-panel");
    if (!panel) return;
    panel.style.display = "block";

    const pageTitle = document.querySelector(".page-title");
    if (pageTitle) pageTitle.textContent = "UTBelajar AI — Konfigurasi API Key & Chatbot (Admin)";

    const cfg = getAiConfig();
    const provEl = document.getElementById("ai-cfg-provider");
    const modelEl = document.getElementById("ai-cfg-model");
    const keyEl = document.getElementById("ai-cfg-apikey");
    const endpointGroupEl = document.getElementById("ai-cfg-endpoint-group");
    const endpointEl = document.getElementById("ai-cfg-endpoint");
    const sysEl = document.getElementById("ai-cfg-system-prompt");
    const savedInfoEl = document.getElementById("ai-cfg-last-saved");

    const toggleEndpointVisibility = (prov) => {
      if (!endpointGroupEl) return;
      endpointGroupEl.style.display = prov === "custom" || prov === "openrouter" ? "block" : "none";
    };

    if (provEl) provEl.value = cfg.provider;
    if (modelEl) modelEl.value = cfg.model;
    if (keyEl) keyEl.value = cfg.apiKey;
    if (endpointEl) {
      endpointEl.value =
        cfg.customEndpoint ||
        (cfg.provider === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : "");
    }
    if (sysEl) sysEl.value = cfg.systemPrompt;
    toggleEndpointVisibility(cfg.provider);

    if (savedInfoEl && cfg.updatedAt) {
      savedInfoEl.textContent = `Terakhir diperbarui: ${window.formatDateTime(cfg.updatedAt)}`;
    }

    provEl?.addEventListener("change", () => {
      const p = provEl.value;
      toggleEndpointVisibility(p);
      if (!modelEl) return;
      if (p === "gemini") modelEl.value = "gemini-2.0-flash";
      else if (p === "openrouter") {
        modelEl.value = "openrouter/auto";
        if (endpointEl && !endpointEl.value) {
          endpointEl.value = "https://openrouter.ai/api/v1/chat/completions";
        }
      } else if (p === "openai") modelEl.value = "gpt-4o-mini";
      else if (p === "groq") modelEl.value = "llama-3.3-70b-versatile";
      else if (p === "custom") {
        modelEl.value = "gpt-4o-mini";
        if (endpointEl && endpointEl.value === "https://openrouter.ai/api/v1/chat/completions") {
          endpointEl.value = "";
        }
      } else modelEl.value = "ai-chat";
    });

    document.getElementById("btn-toggle-ai-key-vis")?.addEventListener("click", () => {
      if (!keyEl) return;
      keyEl.type = keyEl.type === "password" ? "text" : "password";
    });

    document.getElementById("btn-toggle-ai-config-body")?.addEventListener("click", () => {
      const formEl = document.getElementById("admin-ai-config-form");
      if (formEl) {
        formEl.style.display = formEl.style.display === "none" ? "block" : "none";
      }
    });

    document.getElementById("admin-ai-config-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = e.target.querySelector("button[type='submit']");
      window.setButtonLoading(submitBtn, true, "Menyimpan ke Cloud...");

      const newCfg = {
        provider: provEl?.value || "gemini",
        model: modelEl?.value.trim() || "gemini-2.0-flash",
        apiKey: keyEl?.value.trim() || "",
        customEndpoint: endpointEl?.value.trim() || "",
        systemPrompt: sysEl?.value.trim() || DEFAULT_SYSTEM_PROMPT,
        updatedAt: new Date().toISOString(),
      };

      if (typeof window.dbSaveAiConfig === "function") {
        await window.dbSaveAiConfig(newCfg);
      } else {
        localStorage.setItem("utb_ai_config", JSON.stringify(newCfg));
      }

      window.setButtonLoading(submitBtn, false);
      if (savedInfoEl) {
        savedInfoEl.textContent = `Tersimpan & tersinkronisasi ke seluruh siswa: ${window.formatDateTime(newCfg.updatedAt)}`;
      }
      updateAiHeaderStatus();
      window.showToast("Konfigurasi OpenRouter AI berhasil disimpan & langsung aktif untuk seluruh siswa!", "success");
    });

    document.getElementById("btn-reset-ai-config")?.addEventListener("click", async () => {
      localStorage.removeItem("utb_ai_config");
      if (typeof window.dbSaveAiConfig === "function") {
        await window.dbSaveAiConfig({
          provider: "gemini",
          model: "gemini-2.0-flash",
          apiKey: "",
          customEndpoint: "",
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          updatedAt: new Date().toISOString(),
        });
      }
      if (keyEl) keyEl.value = "";
      if (endpointEl) endpointEl.value = "";
      updateAiHeaderStatus();
      window.showToast("API Key AI telah direset.", "info");
    });

    document.getElementById("btn-test-ai-config")?.addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      const tempCfg = {
        provider: provEl?.value || "gemini",
        model: modelEl?.value.trim() || "gemini-2.0-flash",
        apiKey: keyEl?.value.trim() || "",
        customEndpoint: endpointEl?.value.trim() || "",
        systemPrompt: sysEl?.value.trim() || DEFAULT_SYSTEM_PROMPT,
      };
      if (!tempCfg.apiKey && tempCfg.provider !== "supabase" && tempCfg.provider !== "custom") {
        window.showToast("Masukkan API Key terlebih dahulu untuk menguji koneksi AI.", "warning");
        return;
      }
      if (tempCfg.provider === "custom" && !tempCfg.customEndpoint) {
        window.showToast("Masukkan Endpoint URL untuk Custom Layanan AI.", "warning");
        return;
      }
      window.setButtonLoading(btn, true, "Menguji...");
      try {
        const reply = await requestAiReply("Halo, balas singkat dengan kalimat: Koneksi UTBelajar AI berhasil!", tempCfg);
        window.showToast("Koneksi berhasil! " + reply.slice(0, 60), "success");
      } catch (err) {
        window.showToast("Gagal menguji API Key: " + (err.message || "Periksa kembali konfigurasi Anda"), "error");
      } finally {
        window.setButtonLoading(btn, false);
      }
    });
  }

  async function requestAiReply(userMessage, customCfg) {
    let cfg = customCfg || getAiConfig();

    // Jika API Key belum tersedia di local (misal siswa di perangkat/HP lain), coba sinkronkan dari Supabase
    if (!cfg.apiKey && typeof window.dbGetAiConfig === "function") {
      try {
        const remoteCfg = await window.dbGetAiConfig();
        if (remoteCfg && remoteCfg.apiKey) {
          cfg = remoteCfg;
          updateAiHeaderStatus();
        }
      } catch (_) {}
    }

    // 1. Google Gemini REST API
    if (cfg.provider === "gemini" && cfg.apiKey) {
      const modelName = cfg.model || "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        modelName
      )}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: cfg.systemPrompt || DEFAULT_SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message || `Error Gemini HTTP ${res.status}`);
      }
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada respons teks dari Gemini.";
    }

    // 2. OpenRouter, Custom Layanan AI, OpenAI, atau Groq API
    if (
      (cfg.provider === "openrouter" && cfg.apiKey) ||
      (cfg.provider === "custom" && (cfg.customEndpoint || cfg.apiKey)) ||
      ((cfg.provider === "openai" || cfg.provider === "groq") && cfg.apiKey)
    ) {
      const endpoint =
        cfg.provider === "openrouter"
          ? cfg.customEndpoint || "https://openrouter.ai/api/v1/chat/completions"
          : cfg.provider === "custom"
          ? cfg.customEndpoint
          : cfg.provider === "groq"
          ? "https://api.groq.com/openai/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";

      if (!endpoint) {
        throw new Error("Endpoint URL untuk Layanan AI belum diisi.");
      }

      const defaultModel =
        cfg.provider === "openrouter"
          ? "openrouter/auto"
          : cfg.provider === "groq"
          ? "llama-3.3-70b-versatile"
          : "gpt-4o-mini";

      const headers = {
        "Content-Type": "application/json",
      };
      if (cfg.apiKey) {
        headers.Authorization = `Bearer ${cfg.apiKey.trim()}`;
      }
      if (cfg.provider === "openrouter") {
        headers["HTTP-Referer"] = "https://utbelajar.local";
        headers["X-Title"] = "UTBelajar AI";
      }

      // Susun riwayat percakapan (system prompt + konteks obrolan sebelumnya + pertanyaan pengguna saat ini)
      const messages = [];
      if (cfg.systemPrompt && cfg.systemPrompt.trim()) {
        messages.push({ role: "system", content: cfg.systemPrompt.trim() });
      }

      const prev = chatHistory.slice(-6);
      for (const m of prev) {
        messages.push({ role: m.role, content: m.content });
      }
      if (messages.length === 0 || messages[messages.length - 1].content !== userMessage) {
        messages.push({ role: "user", content: userMessage });
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: cfg.model || defaultModel,
          messages: messages,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const errMsg =
          data?.error?.message ||
          (typeof data?.error === "string" ? data.error : `Error HTTP ${res.status}`);
        throw new Error(errMsg);
      }
      if (data?.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }

      let rawReply =
        data?.choices?.[0]?.message?.content ??
        data?.reply ??
        data?.response ??
        data?.output ??
        "";

      if (Array.isArray(rawReply)) {
        rawReply = rawReply
          .map((item) => (typeof item === "string" ? item : item?.text || ""))
          .join("\n");
      } else if (typeof rawReply === "object") {
        rawReply = JSON.stringify(rawReply, null, 2);
      }

      return rawReply || "Tidak ada respons teks dari agen AI OpenRouter.";
    }

    // 3. Supabase Edge Function
    if (cfg.provider === "supabase" && window.supabaseClient) {
      const { data, error } = await window.supabaseClient.functions.invoke(window.APP_CONFIG.AI_FUNCTION_NAME, {
        body: { message: userMessage, conversation_id: activeConversationId },
      });
      if (!error && data?.reply) return data.reply;
    }

    // 4. Fallback Asisten Akademik Pintar Bawaan
    return buildBuiltInAcademicResponse(userMessage);
  }

  function buildBuiltInAcademicResponse(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes("normalisasi") || lower.includes("basis data") || lower.includes("sql")) {
      return (
        "### Konsep Basis Data & Normalisasi (1NF – 3NF)\n\n" +
        "1. **Bentuk Normal Pertama (1NF)**: Setiap atribut bernilai atomik (tunggal) dan tidak ada grup berulang (*repeating group*).\n" +
        "2. **Bentuk Normal Kedua (2NF)**: Memenuhi 1NF dan seluruh atribut non-kunci bergantung penuh pada **Primary Key** (menghilangkan ketergantungan parsial).\n" +
        "3. **Bentuk Normal Ketiga (3NF)**: Memenuhi 2NF dan tidak memiliki ketergantungan transitif antar atribut non-kunci.\n\n" +
        "> 💡 *Tips Ujian*: Ingat rumusnya — **1NF (Atomik)**, **2NF (Bergantung Penuh pada PK)**, **3NF (Tanpa Ketergantungan Transitif)**."
      );
    }
    if (lower.includes("agile") || lower.includes("scrum") || lower.includes("waterfall") || lower.includes("sdlc")) {
      return (
        "### Perbandingan Metodologi Waterfall vs Agile Scrum\n\n" +
        "- **Waterfall**: Bersifat sekuensial/bertahap (Analisis → Desain → Coding → Testing → Maintenance). Cocok untuk proyek dengan kebutuhan yang sudah pasti sejak awal.\n" +
        "- **Agile Scrum**: Bersifat iteratif dan inkremental menggunakan *Sprint* (1–4 minggu). Sangat fleksibel terhadap perubahan kebutuhan pengguna.\n\n" +
        "Silakan tanyakan jika ingin dibuatkan contoh soal latihan tentang SDLC!"
      );
    }
    if (lower.includes("soal") || lower.includes("contoh")) {
      return (
        "### Contoh Latihan Soal Pilihan Ganda\n\n" +
        "**Soal 1:** Diagram UML yang menggambarkan interaksi antara *aktor* dengan sistem berdasarkan fungsi bisnis disebut...\n" +
        "- A. Class Diagram\n- B. Use Case Diagram\n- C. Sequence Diagram\n- D. Activity Diagram\n\n" +
        "**Jawaban Benar:** **B (Use Case Diagram)**\n" +
        "**Pembahasan:** Use Case Diagram memetakan kebutuhan fungsional sistem dari sudut pandang pengguna (*actor*)."
      );
    }
    return (
      `### Penjelasan Materi: "${msg}"\n\n` +
      "Untuk memahami topik ini secara efektif dalam belajar mandiri:\n" +
      "1. **Pahami Definisi Inti**: Identifikasi kata kunci dan konsep utama pada modul.\n" +
      "2. **Buat Peta Konsep**: Hubungkan teori dengan studi kasus praktis.\n" +
      "3. **Uji Pemahaman**: Kerjakan paket soal pada menu **Latihan Soal** untuk mengukur kesiapan ujian.\n\n" +
      "*(Catatan Admin: Anda dapat memasukkan API Key Google Gemini / OpenAI / Groq pada panel Konfigurasi AI di atas untuk mengaktifkan jawaban generatif penuh).* "
    );
  }

  function setupChatInput() {
    const textarea = document.getElementById("chat-input-textarea");
    const sendBtn = document.getElementById("chat-send-btn");
    const newChatBtn = document.getElementById("btn-new-chat");
    const container = document.getElementById("chat-messages-container");
    const scrollBottomBtn = document.getElementById("btn-chat-scroll-bottom");
    const headerScrollBtn = document.getElementById("btn-header-scroll-bottom");

    if (!textarea || !sendBtn) return;

    const scrollToBottom = () => {
      if (!container) return;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    };

    const updateScrollButtonVisibility = () => {
      if (!container || !scrollBottomBtn) return;
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceFromBottom > 60) {
        scrollBottomBtn.classList.add("visible");
      } else {
        scrollBottomBtn.classList.remove("visible");
      }
    };

    container?.addEventListener("scroll", updateScrollButtonVisibility);
    scrollBottomBtn?.addEventListener("click", scrollToBottom);
    headerScrollBtn?.addEventListener("click", scrollToBottom);

    const resizeTextarea = () => {
      textarea.style.height = "auto";
      textarea.style.height = Math.max(32, Math.min(textarea.scrollHeight, 150)) + "px";
    };

    textarea.addEventListener("input", resizeTextarea);

    textarea.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.keyCode === 13) && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleSendMessage();
      }
    });

    sendBtn.addEventListener("click", handleSendMessage);

    newChatBtn?.addEventListener("click", () => {
      activeConversationId = null;
      chatHistory = [];
      if (container) container.innerHTML = "";
      updateScrollButtonVisibility();
    });
  }

  function setupPromptChips() {
    document.addEventListener("click", (e) => {
      const chip = e.target.closest(".prompt-chip");
      if (chip) {
        const prompt = chip.dataset.prompt || chip.textContent.trim();
        const textarea = document.getElementById("chat-input-textarea");
        if (textarea) {
          textarea.value = prompt;
          handleSendMessage();
        }
      }
    });
  }

  async function handleSendMessage() {
    if (isSending) return;
    const textarea = document.getElementById("chat-input-textarea");
    const message = textarea?.value.trim();
    if (!message) return;

    const welcomeBox = document.querySelector(".chat-welcome-box");
    if (welcomeBox) welcomeBox.remove();

    textarea.value = "";
    textarea.style.height = "32px";
    isSending = true;

    appendMessageBubble("user", message);

    try {
      const reply = await requestAiReply(message);
      chatHistory.push({ role: "user", content: message });
      chatHistory.push({ role: "assistant", content: reply });
      appendMessageBubble("assistant", reply);
    } catch (err) {
      const currentProv = (getAiConfig().provider || "AI").toUpperCase();
      appendMessageBubble(
        "assistant",
        `**Gagal Menghubungi Agen AI (${currentProv})**\n\nDetail: \`${err.message || "Error tidak diketahui"}\`\n\nSilakan periksa API Key, kuota token, atau model agent pada panel Administrator.`
      );
    } finally {
      isSending = false;
    }
  }

  function appendMessageBubble(role, content) {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    const row = document.createElement("div");
    row.className = `message-row ${role}`;
    const isUser = role === "user";
    const formatted = isUser ? window.escapeHtml(content) : window.renderMarkdown(content);

    row.innerHTML = `
      <div class="message-avatar">${isUser ? "Anda" : "AI"}</div>
      <div class="message-bubble">${formatted}</div>
    `;
    container.appendChild(row);
    setTimeout(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }, 30);
  }
})();
