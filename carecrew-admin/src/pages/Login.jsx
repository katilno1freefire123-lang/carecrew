import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await adminLogin(email, password);
      login(data.token, data.admin);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute",
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,98,10,0.06) 0%, transparent 70%)",
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 380, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 800, color: "#fff",
            fontFamily: "var(--font-head)",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(232,98,10,0.3)",
          }}>C</div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            CareCrew Admin
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Sign in to manage your platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@carecrew.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "var(--red)",
              fontSize: 13,
            }}>{error}</div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "11px 16px", fontSize: 14, marginTop: 4 }}>
            {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Signing in…</> : "Sign in →"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 12, marginTop: 20 }}>
          Admin credentials are set via seed script only.
        </p>
      </div>
    </div>
  );
}
