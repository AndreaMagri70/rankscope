"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface RankResult {
  keyword: string;
  found: boolean;
  position: number | null;
  url: string | null;
  title: string | null;
  snippet: string;
  displayed_link: string | null;
  loading?: boolean;
  error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function positionColor(pos: number | null): string {
  if (!pos) return "#444";
  if (pos <= 3) return "#00c896";
  if (pos <= 10) return "#f0b429";
  if (pos <= 30) return "#e07b54";
  return "#e05454";
}

function PositionBadge({ pos }: { pos: number | null }) {
  if (!pos)
    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.07)",
          color: "#555",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        —
      </span>
    );
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "20px",
        background: positionColor(pos),
        color: pos <= 10 ? "#000" : "#fff",
        fontSize: "13px",
        fontWeight: "bold",
        fontFamily: "monospace",
        minWidth: "48px",
        textAlign: "center",
      }}
    >
      #{pos}
    </span>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "16px",
        height: "16px",
        border: "2px solid rgba(0,200,150,0.2)",
        borderTopColor: "#00c896",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState<string[]>(Array(10).fill(""));
  const [results, setResults] = useState<RankResult[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const updateKw = (i: number, v: string) => {
    const next = [...keywords];
    next[i] = v;
    setKeywords(next);
  };

  const validKws = keywords.filter((k) => k.trim() !== "");

  const runCheck = useCallback(async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("Inserisci l'URL del sito (es. https://miosito.it)");
      return;
    }
    if (validKws.length === 0) {
      setError("Inserisci almeno una parola chiave.");
      return;
    }

    setError("");
    setRunning(true);
    setProgress(0);

    // Inizializza tutti i risultati in stato "loading"
    const initial: RankResult[] = validKws.map((kw) => ({
      keyword: kw,
      found: false,
      position: null,
      url: null,
      title: null,
      snippet: "",
      displayed_link: null,
      loading: true,
    }));
    setResults(initial);

    const out = [...initial];

    for (let i = 0; i < validKws.length; i++) {
      const kw = validKws[i];
      try {
        const res = await fetch("/api/rank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: kw, targetUrl: trimmedUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          out[i] = { ...out[i], loading: false, error: data.error || "Errore sconosciuto" };
        } else {
          out[i] = { ...data, loading: false };
        }
      } catch (e: any) {
        out[i] = { ...out[i], loading: false, error: e.message };
      }
      setResults([...out]);
      setProgress(Math.round(((i + 1) / validKws.length) * 100));
    }

    setRunning(false);
  }, [url, validKws]);

  const done = results.filter((r) => !r.loading);
  const found = done.filter((r) => r.found);
  const top10 = found.filter((r) => r.position && r.position <= 10);
  const avgPos =
    found.length > 0
      ? (found.reduce((s, r) => s + (r.position || 0), 0) / found.length).toFixed(1)
      : null;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .row-enter { animation: fadeIn 0.3s ease; }
        .run-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(0,200,150,0.25); }
        .run-btn:active:not(:disabled) { transform: none; }
        .kw-input:hover { border-color: rgba(255,255,255,0.15) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", padding: "48px 24px 100px", background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,200,150,0.07), transparent)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* ── Header ── */}
          <header style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "12px" }}>
              <span style={{ fontSize: "38px", color: "#00c896", lineHeight: 1 }}>◈</span>
              <h1 style={{ fontSize: "42px", fontWeight: "bold", letterSpacing: "3px", color: "#fff" }}>
                RankScope
              </h1>
            </div>
            <p style={{ color: "#666", fontSize: "15px" }}>
              Verifica il posizionamento del tuo sito su <strong style={{ color: "#aaa" }}>Google.it</strong>
            </p>
          </header>

          {/* ── Setup Card ── */}
          <div style={card}>
            {/* URL */}
            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>URL del Sito</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="https://miosito.it"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {/* Keywords */}
            <label style={labelStyle}>Parole Chiave (max 10)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
              {keywords.map((kw, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "18px", textAlign: "right", fontSize: "12px", color: "#444", flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <input
                    className="kw-input"
                    style={{ ...inputStyle, marginBottom: 0, fontSize: "13px", padding: "9px 12px" }}
                    type="text"
                    placeholder={`Keyword ${i + 1}…`}
                    value={kw}
                    onChange={(e) => updateKw(i, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !running && runCheck()}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{ background: "rgba(224,84,84,0.1)", border: "1px solid rgba(224,84,84,0.25)", borderRadius: "10px", padding: "12px 16px", color: "#e05454", fontSize: "13px", marginBottom: "14px" }}>
              ⚠ {error}
            </div>
          )}

          {/* ── CTA ── */}
          <button
            className="run-btn"
            disabled={running}
            onClick={runCheck}
            style={{
              width: "100%",
              background: running ? "rgba(0,200,150,0.3)" : "linear-gradient(135deg, #00c896, #00a876)",
              border: "none",
              borderRadius: "12px",
              padding: "17px",
              color: running ? "#00c896" : "#000",
              fontSize: "16px",
              fontWeight: "bold",
              letterSpacing: "1px",
              cursor: running ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            {running ? (
              <>
                <Spinner />
                Analizzando… {progress}%
              </>
            ) : (
              "◈ Avvia Analisi Posizionamento"
            )}
          </button>

          {/* ── Progress bar ── */}
          {running && (
            <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden", marginBottom: "28px" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00c896,#00e6b0)", transition: "width 0.4s ease", borderRadius: "2px" }} />
            </div>
          )}

          {/* ── Results ── */}
          {results.length > 0 && (
            <div style={{ marginTop: "32px" }}>

              {/* Summary */}
              {done.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
                  {[
                    { label: "Trovati", value: found.length },
                    { label: "Non trovati", value: done.length - found.length },
                    { label: "In Top 10", value: top10.length },
                    { label: "Pos. media", value: avgPos ?? "—" },
                  ].map((s) => (
                    <div key={s.label} style={{ ...card, padding: "18px", textAlign: "center" }}>
                      <div style={{ fontSize: "30px", fontWeight: "bold", color: "#00c896", marginBottom: "4px" }}>{s.value}</div>
                      <div style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Table */}
              <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Keyword", "Posizione", "URL posizionato", "Titolo"].map((h) => (
                        <th key={h} style={{ background: "rgba(255,255,255,0.03)", padding: "13px 16px", textAlign: "left", fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr
                        key={i}
                        className="row-enter"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}
                      >
                        <td style={td}>
                          <strong style={{ color: "#e8e6e1" }}>{r.keyword}</strong>
                        </td>
                        <td style={{ ...td, textAlign: "center" }}>
                          {r.loading ? <Spinner /> : <PositionBadge pos={r.position} />}
                        </td>
                        <td style={td}>
                          {r.loading ? (
                            <span style={{ color: "#333", fontSize: "12px" }}>in attesa…</span>
                          ) : r.error ? (
                            <span style={{ color: "#e05454", fontSize: "12px" }}>⚠ {r.error}</span>
                          ) : r.url ? (
                            <a href={r.url} target="_blank" rel="noreferrer" style={{ color: "#00c896", fontSize: "12px" }}>
                              {r.displayed_link || r.url.slice(0, 48) + (r.url.length > 48 ? "…" : "")}
                            </a>
                          ) : (
                            <span style={{ color: "#444", fontSize: "12px" }}>Non trovato nei top 100</span>
                          )}
                        </td>
                        <td style={{ ...td, color: "#666", fontSize: "12px", maxWidth: "240px" }}>
                          {r.loading ? "" : r.title || r.snippet?.slice(0, 80)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <p style={{ textAlign: "center", color: "#333", fontSize: "12px", marginTop: "60px" }}>
            Powered by <a href="https://serpapi.com" target="_blank" rel="noreferrer">SerpAPI</a> · Dati da Google.it
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "14px",
  padding: "28px",
  marginBottom: "16px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  marginBottom: "8px",
  fontFamily: "Georgia, serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  padding: "11px 14px",
  color: "#e8e6e1",
  fontSize: "15px",
  transition: "border-color 0.2s, box-shadow 0.2s",
  marginBottom: "4px",
  fontFamily: "Georgia, serif",
};

const td: React.CSSProperties = {
  padding: "13px 16px",
  verticalAlign: "middle",
  fontSize: "13px",
};
