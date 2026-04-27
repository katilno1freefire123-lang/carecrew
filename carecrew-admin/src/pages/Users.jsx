import { useEffect, useState } from "react";
import { getUsers } from "../services/api.js";

const getAddressText = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (typeof address === "object") return address.fullAddress || "";
  return "";
};

const getNameText = (name) => (typeof name === "string" ? name : "");

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getUsers()
      .then(({ data }) => setUsers(data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const name = getNameText(u.name).toLowerCase();
    const phone = String(u.phone || "");
    const address = getAddressText(u.address).toLowerCase();
    return name.includes(s) || phone.includes(s) || address.includes(s);
  });

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-NP", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>{users.length} registered customers</p>
        </div>
        <input
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "7px 12px",
            color: "var(--text)",
            fontSize: 13,
            outline: "none",
            width: 220,
          }}
          placeholder="Search by name, phone or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <span className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No users found.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Profile</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const nameText = getNameText(u.name);
                const addressText = getAddressText(u.address);

                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "var(--surface2)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--accent)",
                          }}
                        >
                          {nameText?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span style={{ fontWeight: 600, color: "var(--text)" }}>
                          {nameText || <span style={{ color: "var(--text-dim)" }}>No name</span>}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{u.phone}</td>
                    <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {addressText || <span style={{ color: "var(--text-dim)" }}>-</span>}
                    </td>
                    <td>
                      <span className={`badge ${u.profileComplete ? "badge-green" : "badge-yellow"}`}>
                        {u.profileComplete ? "Complete" : "Incomplete"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmt(u.createdAt)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(u)}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{getNameText(selected.name) || "User"}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>
                X
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--accent-dim)",
                    border: "2px solid var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "var(--accent)",
                    fontFamily: "var(--font-head)",
                  }}
                >
                  {getNameText(selected.name)?.[0]?.toUpperCase() || "?"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Phone", selected.phone],
                  ["Profile", selected.profileComplete ? "Complete" : "Incomplete"],
                  ["Joined", fmt(selected.createdAt)],
                  ["Role", selected.role || "user"],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 14px" }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-dim)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 3,
                      }}
                    >
                      {k}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div>
                  </div>
                ))}
              </div>

              {getAddressText(selected.address) && (
                <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 14px" }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 3,
                    }}
                  >
                    Address
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{getAddressText(selected.address)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
