import React, { useState } from "react";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState(
    "Mental health web platform: sign-in, dashboard with sidebar (Home, Assessments, Results, AI Coaches). Calm design."
  );
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${BACKEND}/generate-preview`, { prompt });
      setPreviewHtml(resp.data.preview_html);
    } catch (err: any) {
      setError(err?.response?.data?.detail || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="card">
        <h2>Describe your app</h2>
        <textarea
          rows={5}
          className="input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button
            className="button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Preview"}
          </button>
        </div>
        {error && (
          <p className="small" style={{ color: "crimson" }}>
            {error}
          </p>
        )}
      </div>

      <div className="card">
        <h3>Live Preview</h3>
        {previewHtml ? (
          <iframe
            title="preview"
            className="iframe-preview"
            srcDoc={previewHtml}
            sandbox="allow-same-origin allow-scripts"
          />
        ) : (
          <p className="small">
            No preview yet. Click "Generate Preview" to create one.
          </p>
        )}
      </div>

      <div className="card">
        <h3>Generated HTML (preview)</h3>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
          {previewHtml || "// nothing yet"}
        </pre>
      </div>
    </div>
  );
}
