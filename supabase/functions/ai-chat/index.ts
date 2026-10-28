// Supabase Edge Function: ai-chat
// Penanganan Chatbot Asisten Belajar UTBelajar dengan AI Provider (Gemini / OpenAI)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Tangani preflight request CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Sesi autentikasi tidak ditemukan." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Inisialisasi Supabase Client dengan token user
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verifikasi user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Pengguna tidak terautentikasi." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, conversation_id } = await req.json();

    if (!message || typeof message !== "string" || message.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Pesan tidak boleh kosong." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Periksa API Key AI (Gemini atau OpenAI)
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!geminiApiKey && !openaiApiKey) {
      return new Response(
        JSON.stringify({
          error: "Layanan AI belum dikonfigurasi.",
          details: "API Key (GEMINI_API_KEY atau OPENAI_API_KEY) belum disetel pada Supabase Secrets."
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Siapkan atau perbarui sesi percakapan
    let activeConvId = conversation_id;
    if (!activeConvId) {
      const title = message.slice(0, 40) + (message.length > 40 ? "..." : "");
      const { data: newConv, error: convError } = await supabase
        .from("ai_conversations")
        .insert([{ user_id: user.id, title }])
        .select()
        .single();

      if (convError) throw convError;
      activeConvId = newConv.id;
    }

    // Simpan pesan user ke database
    await supabase.from("ai_messages").insert([
      { conversation_id: activeConvId, role: "user", content: message.trim() },
    ]);

    let aiReplyText = "";

    // Panggil Gemini jika tersedia
    if (geminiApiKey) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const systemInstruction = 
        "Anda adalah UTBelajar AI, asisten belajar digital independen yang ramah, cerdas, dan suportif. " +
        "Bantu pengguna memahami konsep akademik, strategi belajar, materi mata kuliah, serta latihan soal. " +
        "Gunakan bahasa Indonesia yang jelas, sopan, dan terstruktur. Gunakan format Markdown untuk kemudahan membaca.";

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${systemInstruction}\n\nPengguna: ${message}` }] },
          ],
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Gemini API Error: ${errorDetail}`);
      }

      const data = await response.json();
      aiReplyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak dapat merespons saat ini.";
    } 
    // Fallback ke OpenAI jika hanya OPENAI_API_KEY yang tersedia
    else if (openaiApiKey) {
      const openaiUrl = "https://api.openai.com/v1/chat/completions";
      const response = await fetch(openaiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Anda adalah UTBelajar AI, asisten belajar digital independen. Bantu pengguna belajar dengan penjelasan terstruktur, ramah, dan mendidik.",
            },
            { role: "user", content: message },
          ],
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`OpenAI API Error: ${errorDetail}`);
      }

      const data = await response.json();
      aiReplyText = data.choices?.[0]?.message?.content || "Maaf, saya tidak dapat merespons saat ini.";
    }

    // Simpan respons AI ke database
    await supabase.from("ai_messages").insert([
      { conversation_id: activeConvId, role: "assistant", content: aiReplyText },
    ]);

    // Perbarui waktu percakapan
    await supabase
      .from("ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeConvId);

    return new Response(
      JSON.stringify({
        conversation_id: activeConvId,
        reply: aiReplyText,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan internal server." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
