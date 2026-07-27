"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div style={{
      padding: "40px",
      textAlign: "center",
      fontFamily: "Inter, sans-serif",
      background: "#0f111a",
      color: "#fff",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Erro ao carregar</h2>
        <p style={{ fontSize: "14px", color: "#8b8fa3", marginBottom: "24px" }}>
          Tente novamente em alguns segundos.
        </p>
        <button
          onClick={reset}
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
