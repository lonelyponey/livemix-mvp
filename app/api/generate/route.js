import { NextResponse } from "next/server";

console.log("[backend] route.js module loaded at", new Date().toISOString());

export async function POST(request) {
  console.log(
    "[backend] /api/generate POST called at",
    new Date().toISOString()
  );

  const body = await request.json().catch(() => ({}));
  const description = (body?.description || "").trim();

  if (!description) {
    console.log("[backend] missing description");
    return NextResponse.json(
      { ok: false, error: "Description is required" },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    console.log("[backend] OPENAI_API_KEY is missing");
    return NextResponse.json(
      { ok: false, error: "Server is misconfigured: missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    console.log("[backend] calling OpenAI via fetch...");

    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-5.1",
          response_format: { type: "json_object" }, // 🔐 force JSON
          messages: [
            {
              role: "system",
              content:
                "You are a playlist generator. Given a description of desired music, you return a JSON object with a 'tracks' array. Each track must have 'title','content','artist','link','genre','artistBackground','mood','reason','comparisonsBetweenSongs','lyrics' and 'avatar' fields. The 'link' field is the Spotify link of each song. The 'lyrics' field must be a short excerpt (no more than 1–2 lines, max ~80 characters), NOT the full lyrics of the song. For the 'avatar' field, return a URL that is publicly accessible (do NOT use http://i.scdn.co/). Return a maximum of 5 tracks. Respond with JSON ONLY, no extra text.",
            },
            {
              role: "user",
              content: `Generate a playlist for: "${description}"`,
            },
          ],
        }),
      }
    );

    console.log("[backend] OpenAI HTTP status:", openaiRes.status);

    const raw = await openaiRes.text();

    if (!openaiRes.ok) {
      return NextResponse.json(
        { ok: false, error: "OpenAI error", details: raw },
        { status: 500 }
      );
    }

    // raw is the full OpenAI response JSON
    const data = JSON.parse(raw);

    // With response_format: "json_object", content is guaranteed to be valid JSON
    let content = data.choices[0]?.message?.content;

    if (!content) {
      console.error("[backend] Missing content in OpenAI response:", data);
      return NextResponse.json(
        { ok: false, error: "No content from OpenAI" },
        { status: 500 }
      );
    }

    let suggestion;
    try {
      suggestion = JSON.parse(content); // should be { tracks: [...] }
    } catch (err) {
      console.error(
        "[backend] Failed to parse OpenAI JSON content:",
        err,
        content
      );
      return NextResponse.json(
        { ok: false, error: "OpenAI returned invalid JSON", raw: content },
        { status: 500 }
      );
    }

    console.log("[backend] parsed suggestion:", suggestion);
    return NextResponse.json(suggestion, { status: 200 });
  } catch (err) {
    console.error("[backend] error while calling OpenAI:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to reach OpenAI: " + String(err) },
      { status: 502 }
    );
  }
}
