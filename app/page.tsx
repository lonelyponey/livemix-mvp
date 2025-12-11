"use client";

import { useState } from "react";

export default function Home() {
  const [description, setDescription] = useState("");
  const [playlist, setPlaylist] = useState<any[]>([]);
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
      setPlaylist(data.tracks || []);
    } catch (err) {
      console.error("[frontend] fetch threw error:", err);
      setError("Something went wrong while generating the playlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/40 px-6 py-6 sm:px-8 sm:py-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            LiveMix V1
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
            Describe the music you want and I&apos;ll generate a Spotify-ready
            playlist using AI — complete with context, mood, and lyrics.
          </p>
        </header>

        {/* Input area */}
        <section className="space-y-3">
          <label className="block text-sm font-medium text-slate-200">
            Your description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="True Love / Deep Connection"
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/70 transition"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-pink-500 px-6 py-2.5 text-sm font-semibold tracking-tight shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition hover:shadow-emerald-400/40"
            >
              {loading ? "Generating playlist..." : "Generate Playlist"}
            </button>

            {error && <p className="text-sm text-rose-400 max-w-md">{error}</p>}
          </div>
        </section>

        {/* Playlist */}
        {playlist.length > 0 && (
          <section className="mt-8 border-t border-slate-800 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                  Your playlist
                </h2>
                <p className="text-sm text-slate-400">
                  Click a track to open it in Spotify. Expand lyrics to see the
                  full text.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                {playlist.length} track{playlist.length === 1 ? "" : "s"}
              </span>
            </div>

            <ul className="mt-3 grid gap-4 md:gap-5">
              {playlist.map((track: any, index) => (
                <TrackCard key={index} track={track} index={index} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

/**
 * Track card with lyrics accordion
 */
const TrackCard = ({ track, index }: { track: any; index: number }) => {
  const [showLyrics, setShowLyrics] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fallbackAvatar =
    "https://ui-avatars.com/api/?name=Track&background=0f172a&color=22c55e&size=128&format=png";

  return (
    <li className="group flex flex-col md:flex-row gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 hover:border-emerald-400/80 hover:bg-slate-900 transition-colors">
      {/* Avatar + basic info */}
      <div className="flex items-start gap-3 md:w-56">
        {!imgError && track.avatar ? (
          <img
            src={track.avatar}
            alt={track.artist || track.title}
            className="h-16 w-16 rounded-full object-cover border border-slate-700 shadow-md"
            onError={(e) => {
              // prevent infinite loop
              setImgError(true);
              (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
            }}
          />
        ) : (
          <img
            src={fallbackAvatar}
            alt="Fallback avatar"
            className="h-16 w-16 rounded-full object-cover border border-slate-700 shadow-md"
          />
        )}
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Track #{index + 1}
          </p>
          <h3 className="text-base sm:text-lg font-semibold leading-snug">
            {track.title}
          </h3>
          <p className="text-sm text-slate-400">{track.artist}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {track.genre && (
              <span className="inline-flex items-center rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                {track.genre}
              </span>
            )}
            {track.mood && (
              <span className="inline-flex items-center rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300">
                {track.mood}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 text-sm text-slate-200">
        {track.content && <p className="text-slate-200">{track.content}</p>}

        {track.reason && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1">
              Why it fits
            </p>
            <p className="text-slate-300">{track.reason}</p>
          </div>
        )}

        {track.comparisonsBetweenSongs && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1">
              Compared to other songs
            </p>
            <p className="text-slate-300">{track.comparisonsBetweenSongs}</p>
          </div>
        )}

        {track.artistBackground && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1">
              Artist background
            </p>
            <p className="text-slate-400">{track.artistBackground}</p>
          </div>
        )}

        {/* Lyrics accordion */}
        {track.lyrics && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowLyrics((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200 transition"
            >
              <span>{showLyrics ? "Hide lyrics" : "Show lyrics"}</span>
              <span
                className={`inline-block transform transition-transform duration-200 ${
                  showLyrics ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>

            {showLyrics && (
              <div className="mt-2 border-l-2 border-emerald-400/60 pl-3 text-slate-200 text-sm bg-slate-900/60 py-2 rounded-r-xl">
                {track.lyrics}
              </div>
            )}
          </div>
        )}

        {track.link && (
          <div className="pt-1">
            <a
              href={track.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-emerald-400/70 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-400/10 transition"
            >
              Open in Spotify
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        )}
      </div>
    </li>
  );
};
