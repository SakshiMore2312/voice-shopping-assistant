import React, { useState, useEffect, useRef } from "react";

const CommandConsole = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (isOpen && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="console-section" style={{ backgroundColor: "var(--color-surface-base)", border: "1px solid var(--color-border)" }}>
      <button
        onClick={toggleOpen}
        className="console-summary-bar"
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
        aria-expanded={isOpen}
        aria-controls="dev-console-logs"
      >
        <span>
          {isOpen ? "▼" : "▶"} Developer Mode Console
        </span>
        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
          {logs.length} logs
        </span>
      </button>

      {isOpen && (
        <div id="dev-console-logs" className="console-logs" role="log" aria-live="polite">
          {logs.length === 0 ? (
            <div className="log-entry" style={{ color: "var(--color-text-muted)" }}>
              &gt; Ready. Awaiting voice command signals...
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">[{log.time}]</span>
                <span style={{ color: log.error ? "var(--color-danger)" : "var(--color-success)", fontWeight: "600" }}>
                  {log.error ? "⚠️ [ERR]" : "✓ [OK]"}
                </span>{" "}
                <span className="log-action">{log.action}</span>:{" "}
                <span className="log-details">
                  {log.error
                    ? log.error
                    : `Qty: ${log.quantity} | Item: "${log.item}"${
                        log.maxPrice ? ` | PriceLimit: $${log.maxPrice}` : ""
                      }${log.isOrganic ? " | Organic" : ""}`}
                </span>
                <div style={{ color: "var(--color-text-secondary)", fontSize: "0.7rem", fontStyle: "italic", marginLeft: "1rem" }}>
                  Raw Speech: "{log.raw}"
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
};

export default React.memo(CommandConsole);
