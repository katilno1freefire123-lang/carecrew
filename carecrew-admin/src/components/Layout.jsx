import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV = [
  { to: "/",             icon: "⊞",  label: "Dashboard" },
  { to: "/services",     icon: "◈",  label: "Services" },
  { to: "/professionals",icon: "◎",  label: "Professionals" },
  { to: "/bookings",     icon: "◷",  label: "Bookings" },
  { to: "/users",        icon: "◉",  label: "Users" },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{
        width: "var(--sidebar-w)", flexShrink: 0,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: "#fff",
              fontFamily: "var(--font-head)",
            }}>C</div>
            <div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>CareCrew</div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8,
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                background: isActive ? "var(--accent-dim)" : "transparent",
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                transition: "all 0.15s",
                textDecoration: "none",
              })}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: "14px 12px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "var(--accent-dim)", border: "1px solid var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: "var(--accent)", fontWeight: 700,
            }}>
              {admin?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {admin?.email || "Admin"}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-dim)" }}>Super Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12 }}>
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
        <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

