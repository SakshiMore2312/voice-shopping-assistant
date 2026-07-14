import React, { useEffect } from "react";

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000); // Auto-dismiss after 4s
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getStyle = () => {
    switch (toast.type) {
      case "error":
        return { borderLeft: "4px solid var(--color-danger)", background: "rgba(255, 74, 90, 0.15)" };
      case "warning":
        return { borderLeft: "4px solid var(--color-warning)", background: "rgba(255, 189, 89, 0.15)" };
      default:
        return { borderLeft: "4px solid var(--color-success)", background: "rgba(0, 245, 160, 0.15)" };
    }
  };

  return (
    <div
      style={{
        ...getStyle(),
        color: "var(--color-text-primary)",
        padding: "0.85rem 1.25rem",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1.5rem",
        minWidth: "280px",
        maxWidth: "400px",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.05)",
        animation: "toast-slide-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}
    >
      <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{toast.message}</div>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          cursor: "pointer",
          fontSize: "1rem"
        }}
      >
        ✕
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 9999,
        pointerEvents: "auto"
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default React.memo(ToastContainer);
