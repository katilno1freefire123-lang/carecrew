import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/api.js";
import { Link } from "react-router-dom";

const StatCard = ({ label, value, sub, color }) => (
  <div className="card" style={{ padding: "20px 22px" }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{label}</div>
    <div style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 800, color: color || "var(--text)", lineHeight: 1 }}>{value ?? "—"}</div>
    {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:"flex", justifyContent:"center", padding: 60 }}><span className="spinner" /></div>;
  if (error)   return <div style={{ color: "var(--red)", padding: 20 }}>{error}</div>;

  const s = stats?.stats || stats || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Platform overview</p>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
          {new Date().toLocaleDateString("en-NP", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Users"         value={s.totalUsers}         sub="Registered customers" />
        <StatCard label="Professionals"        value={s.totalProfessionals} sub="All registered" />
        <StatCard label="Pending Approval"     value={s.pendingKyc}         color="var(--yellow)" sub="KYC review needed" />
        <StatCard label="Total Bookings"       value={s.totalBookings}      sub="All time" />
        <StatCard label="Active Services"      value={s.totalServices}      sub="Listed services" />
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Pending KYC Reviews</div>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
            {s.pendingKyc > 0
              ? `${s.pendingKyc} professional${s.pendingKyc !== 1 ? "s" : ""} waiting for approval.`
              : "No pending approvals right now."}
          </p>
          <Link to="/professionals">
            <button className="btn btn-primary btn-sm">Review →</button>
          </Link>
        </div>
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Manage Services</div>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
            Add, edit or remove services from the platform.
          </p>
          <Link to="/services">
            <button className="btn btn-ghost btn-sm">Go to Services →</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
