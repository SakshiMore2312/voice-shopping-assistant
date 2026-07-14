import React, { useState, useRef } from "react";

const VoiceController = ({
  isListening,
  interimTranscript,
  transcript,
  startListening,
  stopListening,
  language,
  setLanguage,
  speechSupported,
  systemStatus,
  lastCommandText
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const lastClickRef = useRef(0);
  
  const toggleListen = () => {
    const now = Date.now();
    if (now - lastClickRef.current < 400) return; // Ignore rapid double-clicks
    lastClickRef.current = now;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getHelpContent = () => {
    switch (language) {
      case "hi-IN":
        return (
          <div className="help-grid">
            <div className="help-col">
              <h4>जोड़ना / हटाना</h4>
              <ul>
                <li>"दूध जोड़ें"</li>
                <li>"तीन सेब डालो"</li>
                <li>"सेब हटाओ"</li>
                <li>"पूरी सूची हटाओ"</li>
              </ul>
            </div>
            <div className="help-col">
              <h4>खोजना / छानना</h4>
              <ul>
                <li>"चॉकलेट खोजें"</li>
                <li>"पानी ढूंढो"</li>
                <li>"चिप्स पांच रुपये से कम"</li>
              </ul>
            </div>
          </div>
        );
      case "es-ES":
        return (
          <div className="help-grid">
            <div className="help-col">
              <h4>Agregar / Quitar</h4>
              <ul>
                <li>"Añadir leche"</li>
                <li>"Agrega tres manzanas"</li>
                <li>"Quitar manzanas"</li>
                <li>"Limpiar lista"</li>
              </ul>
            </div>
            <div className="help-col">
              <h4>Buscar / Filtrar</h4>
              <ul>
                <li>"Buscar galletas"</li>
                <li>"Encontrar agua"</li>
                <li>"Refresco menos de 5 dólares"</li>
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div className="help-grid">
            <div className="help-col">
              <h4>Add / Remove</h4>
              <ul>
                <li>"Add two bottles of water"</li>
                <li>"I need 3 organic apples"</li>
                <li>"Delete chocolate cookies"</li>
                <li>"Clear my list"</li>
              </ul>
            </div>
            <div className="help-col">
              <h4>Search & Filter</h4>
              <ul>
                <li>"Find potato chips"</li>
                <li>"Search for coffee beans"</li>
                <li>"Find toothpaste under 5 dollars"</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  // Get status class for style mapping
  const getStatusIndicatorClass = () => {
    switch (systemStatus) {
      case "Listening": return "listening";
      case "Processing": return "processing";
      case "Speaking": return "speaking";
      default: return "ready";
    }
  };

  return (
    <section className="voice-section card-panel" aria-label="Voice Command Panel">
      <div className="voice-panel-header">
        <h3 className="voice-title">🎙️ Speech Assistant</h3>
        <select
          id="mic-lang-select"
          className="lang-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select speech language"
        >
          <option value="en-US">🇬🇧 English (US)</option>
          <option value="hi-IN">🇮🇳 Hindi (हिन्दी)</option>
          <option value="es-ES">🇪🇸 Spanish (Español)</option>
        </select>
      </div>

      {/* Pulsing microphone */}
      <div className="mic-button-container">
        <button
          className={`mic-button ${isListening ? "listening" : ""}`}
          onClick={toggleListen}
          disabled={!speechSupported}
          aria-label={isListening ? "Stop listening voice command" : "Start listening voice command"}
          aria-pressed={isListening}
        >
          <span aria-hidden="true" style={{ fontSize: "1.25rem" }}>{isListening ? "⏹️" : "🎙️"}</span>
        </button>
      </div>

      {/* Visual Speech Waveform */}
      <div 
        className={`waveform-container ${isListening ? "active" : ""}`} 
        aria-hidden="true"
      >
        <div className="wave-bar" />
        <div className="wave-bar" />
        <div className="wave-bar" />
        <div className="wave-bar" />
        <div className="wave-bar" />
        <div className="wave-bar" />
        <div className="wave-bar" />
      </div>

      {/* Live transcript feedback */}
      <div className="transcript-panel" aria-live="polite">
        {isListening ? (
          <div>
            {interimTranscript || transcript ? (
              <span className={interimTranscript ? "interim-text" : "final-text"}>
                {interimTranscript || transcript}
              </span>
            ) : (
              <span className="placeholder-text">Listening... Speak now</span>
            )}
          </div>
        ) : (
          <span className="placeholder-text">
            {transcript ? `"${transcript}"` : "Click the button and speak a command..."}
          </span>
        )}
      </div>

      {/* Dynamic Status Banner */}
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.65rem 0.75rem",
          borderRadius: "6px",
          fontSize: "0.8rem",
          fontWeight: "500",
          marginTop: "0.75rem",
          width: "100%",
          boxSizing: "border-box",
          transition: "all 0.2s ease",
          ...(systemStatus === "Listening" ? {
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            color: "var(--color-primary)"
          } : systemStatus === "Processing" ? {
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            color: "var(--color-warning)"
          } : systemStatus === "Speaking" ? {
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            color: "var(--color-success)"
          } : lastCommandText === "Command not recognized" || (lastCommandText && lastCommandText.includes("not found")) || (lastCommandText && lastCommandText.includes("not recognized")) ? {
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--color-danger)"
          } : lastCommandText && lastCommandText !== "None" ? {
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            color: "var(--color-success)"
          } : {
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)"
          })
        }}
      >
        <span style={{ fontSize: "1rem" }}>
          {systemStatus === "Listening" ? "🎙️" : 
           systemStatus === "Processing" ? "⚙️" : 
           systemStatus === "Speaking" ? "🔊" : 
           (lastCommandText === "Command not recognized" || (lastCommandText && lastCommandText.includes("not found")) || (lastCommandText && lastCommandText.includes("not recognized"))) ? "❌" : 
           (lastCommandText && lastCommandText !== "None") ? "✅" : "💤"}
        </span>
        <span>
          {systemStatus === "Listening" ? "Listening... Speak now" :
           systemStatus === "Processing" ? "Processing command..." :
           systemStatus === "Speaking" ? `Speaking: "${lastCommandText}"` :
           (lastCommandText === "Command not recognized" || (lastCommandText && lastCommandText.includes("not found")) || (lastCommandText && lastCommandText.includes("not recognized"))) ? "Sorry, I didn't understand. Please try again." :
           (lastCommandText && lastCommandText !== "None") ? `${lastCommandText}` :
           "Assistant Ready. Click the microphone to speak."}
        </span>
      </div>

      {/* System Status Indicators Dashboard */}
      <div className="system-status-grid">
        <div className="status-widget">
          <span className="status-label">System Status</span>
          <span className="status-value" style={{ display: "flex", alignItems: "center" }}>
            <span className={`status-indicator ${getStatusIndicatorClass()}`} />
            {systemStatus}
          </span>
        </div>
        <div className="status-widget">
          <span className="status-label">Last Action</span>
          <span className="status-value" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={lastCommandText}>
            {lastCommandText || "None"}
          </span>
        </div>
      </div>

      {!speechSupported && (
        <div style={{ color: "var(--color-danger)", fontSize: "0.75rem", marginTop: "0.25rem" }} role="alert">
          ⚠️ Web Speech API is not supported in this browser. Use Chrome/Edge.
        </div>
      )}

      {/* Help Overlay Toggle */}
      <button
        style={{
          background: "transparent",
          border: "none",
          color: "var(--color-primary)",
          fontSize: "0.8rem",
          fontWeight: "600",
          cursor: "pointer",
          textDecoration: "none"
        }}
        onClick={() => setShowHelp(!showHelp)}
        aria-expanded={showHelp}
        aria-controls="voice-cheatsheet"
      >
        {showHelp ? "Hide Commands Guide" : "Show Commands Guide"}
      </button>

      {showHelp && (
        <div id="voice-cheatsheet" className="help-card" style={{ width: "100%", textAlign: "left" }}>
          <h4 style={{ fontSize: "0.8rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>
            💡 Try Saying:
          </h4>
          {getHelpContent()}
        </div>
      )}
    </section>
  );
};

export default React.memo(VoiceController);
