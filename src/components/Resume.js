import React, { useState, useMemo } from "react";
import "./Resume.css";

function Resume() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", "Analyze this document and extract all important information.");

    setLoading(true);
    setRecipe("");

    try {
      const url = `https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText || "Unknown error"}`);
      }

      const data = await response.json();
      setRecipe(JSON.stringify(data));
    } catch (error) {
      setRecipe(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const parsedData = useMemo(() => {
    if (!recipe || recipe.startsWith("Analysis failed")) return null;
    try {
      return JSON.parse(recipe);
    } catch {
      return null;
    }
  }, [recipe]);

  const downloadCSV = () => {
    if (!parsedData?.table_headers) return;
    const csvContent = [
      parsedData.table_headers.join(","),
      ...(parsedData.table_rows || []).map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DocuWizard_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") setFile(dropped);
  };

  const reset = () => {
    setRecipe("");
    setFile(null);
  };

  const isError = recipe && recipe.startsWith("Analysis failed");

  return (
    <div className="dw-root">
      {/* Header */}
      <div className="dw-header">
        <div className="dw-header-glyph">⬡</div>
        <div>
          <div className="dw-eyebrow">AI DOCUMENT INTELLIGENCE</div>
          <h1 className="dw-title">DocuWizard</h1>
          <p className="dw-subtitle">Upload any PDF — extract structure, insights & data in seconds</p>
        </div>
      </div>

      {/* Upload zone */}
      {!parsedData && !isError && (
        <div
          className={`dw-dropzone ${dragOver ? "dw-dropzone--over" : ""} ${file ? "dw-dropzone--ready" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !file && document.getElementById("dw-file-input").click()}
        >
          <input
            id="dw-file-input"
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file ? (
            <div className="dw-file-ready">
              <div className="dw-file-icon">📄</div>
              <div className="dw-file-name">{file.name}</div>
              <div className="dw-file-size">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</div>
              <button className="dw-remove-btn" onClick={(e) => { e.stopPropagation(); setFile(null); }}>✕ Remove</button>
            </div>
          ) : (
            <div className="dw-upload-prompt">
              <div className="dw-upload-icon">⊕</div>
              <div className="dw-upload-text">Drop your PDF here</div>
              <div className="dw-upload-sub">or click to browse</div>
            </div>
          )}
        </div>
      )}

      {/* Action bar */}
      {!parsedData && !isError && (
        <div className="dw-actions">
          <button
            className={`dw-btn dw-btn--primary ${!file || loading ? "dw-btn--disabled" : ""}`}
            onClick={handleProcess}
            disabled={!file || loading}
          >
            {loading ? (
              <span className="dw-loading-row">
                <span className="dw-spinner" />
                Analyzing document…
              </span>
            ) : (
              "▶ Run Analysis"
            )}
          </button>
        </div>
      )}

      {/* Loading agent steps */}
      {loading && (
        <div className="dw-loading-steps">
          {["Parsing PDF structure", "Extracting text content", "Running AI analysis", "Structuring output"].map((step, i) => (
            <div key={i} className="dw-step" style={{ animationDelay: `${i * 0.4}s` }}>
              <span className="dw-step-dot" style={{ animationDelay: `${i * 0.4}s` }} />
              {step}
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="dw-error-panel">
          <div className="dw-error-icon">⚠</div>
          <div className="dw-error-text">{recipe.replace("Analysis failed: ", "")}</div>
          <button className="dw-btn dw-btn--ghost" onClick={reset}>Try Again</button>
        </div>
      )}

      {/* Results dashboard */}
      {parsedData && (
        <div className="dw-dashboard">

          {/* Result toolbar */}
          <div className="dw-result-bar">
            <div className="dw-result-label">
              <span className="dw-result-dot" />
              Analysis Complete — {file?.name}
            </div>
            <div className="dw-result-actions">
              <button className="dw-btn dw-btn--export" onClick={downloadCSV}>
                ↓ Export CSV
              </button>
              <button className="dw-btn dw-btn--ghost" onClick={reset}>
                ← New Document
              </button>
            </div>
          </div>

          {/* Summary card */}
          <div className="dw-card dw-summary-card">
            <div className="dw-card-label">DOCUMENT SUMMARY</div>
            <p className="dw-summary-text">{parsedData.summary || "No summary available."}</p>
          </div>

          {/* Insights */}
          {parsedData.insights?.length > 0 && (
            <div className="dw-card dw-insights-card">
              <div className="dw-card-label">KEY INSIGHTS</div>
              <div className="dw-insights-grid">
                {parsedData.insights.map((insight, i) => (
                  <div key={i} className="dw-insight-item" style={{ animationDelay: `${i * 0.08}s` }}>
                    <span className="dw-insight-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="dw-insight-text">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data table */}
          {parsedData.table_headers?.length > 0 && (
            <div className="dw-card dw-table-card">
              <div className="dw-card-label">
                EXTRACTED DATA
                <span className="dw-table-count">
                  {parsedData.table_rows?.length || 0} rows · {parsedData.table_headers.length} columns
                </span>
              </div>
              <div className="dw-table-wrap">
                <table className="dw-table">
                  <thead>
                    <tr>
                      {parsedData.table_headers.map((h, i) => (
                        <th key={i} className="dw-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.table_rows?.map((row, i) => (
                      <tr key={i} className="dw-tr">
                        {row.map((cell, j) => (
                          <td key={j} className="dw-td">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Resume ;
