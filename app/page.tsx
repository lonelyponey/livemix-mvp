"use client";

// pages/index.js
import { useState } from "react";

export default function Home() {
  const [description, setDescription] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setPlaylist([]);
    if (!description.trim()) {
      setError("Please describe the music you want.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      const data = await res.json();
      // console.log("[frontend] data from backend:", data["tracks"]);
      console.log("[frontend] data from backend:", JSON.parse(data));
      // setPlaylist(data.receivedDescription || []);

      setPlaylist(JSON.parse(data).tracks);
    } catch (err) {
      console.error("[frontend] fetch threw error:", err);
      setError("Something went wrong while generating the playlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#050816",
        color: "#f9fafb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          background: "rgba(15,23,42,0.9)",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          border: "1px solid rgba(148,163,184,0.3)",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
          LiveMix V1
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#9ca3af" }}>
          Describe the music you want, and I&apos;ll generate a Spotify-ready
          playlist using AI.
        </p>

        <label
          style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}
        >
          Your description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="True Love / Deep Connection"
          rows={4}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid #374151",
            background: "#020617",
            color: "#e5e7eb",
            resize: "vertical",
            marginBottom: "1rem",
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "999px",
            border: "none",
            cursor: loading ? "default" : "pointer",
            fontWeight: 600,
            fontSize: "0.95rem",
            background:
              "linear-gradient(135deg, #6366f1 0%, #22c55e 50%, #ec4899 100%)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Generating playlist..." : "Generate Playlist"}
        </button>

        {error && (
          <p style={{ color: "#f97373", marginTop: "1rem" }}>{error}</p>
        )}

        {playlist.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
              Your playlist
            </h2>
            <p style={{ color: "#9ca3af", marginBottom: "0.75rem" }}>
              Click a track to open it in Spotify.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {playlist.map((track: any, index) => (
                <li
                  key={index}
                  style={{
                    padding: "0.75rem 0",
                    borderBottom: "1px solid rgba(55,65,81,0.7)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{track.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                      {track.artist}
                    </div>
                  </div>
                  {track.link && (
                    <a
                      href={track.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "0.85rem",
                        textDecoration: "none",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "999px",
                        border: "1px solid #22c55e",
                      }}
                    >
                      Open in Spotify
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
