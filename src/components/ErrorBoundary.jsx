import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem("shopping_list");
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#090616",
          color: "#f3f1f6",
          fontFamily: "sans-serif",
          padding: "2rem",
          textAlign: "center"
        }}>
          <div style={{
            background: "rgba(25, 20, 50, 0.5)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 74, 90, 0.3)",
            borderRadius: "20px",
            padding: "3rem 2rem",
            maxWidth: "500px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
            <h1 style={{ fontSize: "2rem", color: "#ff4a5a", marginBottom: "1rem" }}>⚠️ Application Error</h1>
            <p style={{ color: "#a9a3bd", marginBottom: "1.5rem", lineHeight: "1.6" }}>
              VoiceCart encountered an unexpected error. This might be due to incompatible state or system configuration.
            </p>
            <div style={{
              background: "rgba(0, 0, 0, 0.3)",
              padding: "1rem",
              borderRadius: "10px",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              textAlign: "left",
              overflowX: "auto",
              marginBottom: "2rem",
              border: "1px solid rgba(255,255,255,0.05)",
              color: "#ff8892"
            }}>
              {this.state.error?.toString()}
            </div>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: "linear-gradient(135deg, #7b2cbf 0%, #9d4ede 100%)",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  background: "transparent",
                  color: "#a9a3bd",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Reset App Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
