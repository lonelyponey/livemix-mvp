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
          messages: [
            {
              role: "system",
              content:
                "You are a playlist generator. Given a description of desired music, you return a JSON object with a 'tracks' array. Each track must have 'title','content','artist', 'link', 'genre', 'artistBackground', 'mood','reason', 'comparisonsBetweenSongs','lyrics' and 'avatar' fields.The 'link' field is the spotify link of each music.'lyrics' is must full lyrics from start to end.And about the 'avatar' field, I don't have the permission to access 'http://i.scdn.co/'. So you must give me the 'avatar' field with a link that it's possilbe to connect this link anywhere  .And the  Maximum 5 music. Respond with JSON ONLY, no extra text.",
            },
            {
              role: "user",
              content: `Generate a short playlist description for: "${description}"`,
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

    const data = JSON.parse(raw);
    const suggestion = data.choices[0].message.content;

    console.log("[backend] final suggestion:", suggestion);
    return NextResponse.json(suggestion, { status: 200 });
  } catch (err) {
    console.error("[backend] error while calling OpenAI:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to reach OpenAI: " + String(err) },
      { status: 502 }
    );
  }
}
