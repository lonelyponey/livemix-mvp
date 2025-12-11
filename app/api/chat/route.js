// app/api/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(req) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const messages = body?.messages || [];

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { ok: false, error: "messages array is required" },
      { status: 400 }
    );
  }

  try {
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-5.1",
          messages: [
            {
              role: "system",
              content:
                "You are a friendly music assistant embedded in a web app called LiveMix. Help the user with music discovery, playlist ideas and questions about the songs you suggested. Be concise and conversational.",
            },
            // pass through conversation from the client
            ...messages,
          ],
        }),
      }
    );

    const raw = await openaiRes.text();

    if (!openaiRes.ok) {
      console.error("[backend/chat] OpenAI error:", raw);
      return NextResponse.json(
        { ok: false, error: "OpenAI error", details: raw },
        { status: 500 }
      );
    }

    const data = JSON.parse(raw);
    const reply = data.choices[0]?.message?.content || "";

    return NextResponse.json({ ok: true, reply }, { status: 200 });
  } catch (err) {
    console.error("[backend/chat] error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to reach OpenAI" },
      { status: 502 }
    );
  }
}
