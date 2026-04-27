import { useEffect, useState } from "react";
import { getBookings } from "../services/api.js";

const STATUS_BADGE = {
  pending:   "badge-yellow",
  confirmed: "badge-blue",
  completed: "badge-green",
  cancelled: "badge-red",
};

const PAY_BADGE = {
  paid:    "badge-green",
  pending: "badge-yellow",
  failed:  "badge-red",
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [filter, setFilter]    = useState("all");
  const [selected, setSelected]= useState(null);
  const [search, setSearch]    = useState("");

  useEffect(() => {
    getBookings()
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter((b) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        b.customerId?.name?.toLowerCase().includes(s) ||
        b.serviceId?.name?.toLowerCase().includes(s) ||
        b._id?.toLowerCase().includes(s)
      );
    });

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-NP", { day:"2-digit", month:"short", year:"numeric" }) : "—";

  return (
    <div>
      <div className="page-header">
        <div><h1>Bookings</h1><p>All platform bookings</p></div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <input
          style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8, padding:"7px 12px", color:"var(--text)", fontSize:13, outline:"none", width:220 }}
          placeholder="Search by customer, service…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display:"flex", gap:6 }}>
          {["all","pending","confirmed","completed","cancelled"].map((f) => (
            <button key={f} className={`btn btn-sm ${filter===f ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:40 }}><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p>No bookings found.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id}>
                  <td style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-dim)" }}>
                    #{b._id.slice(-6).toUpperCase()}
                  </td>
                  <td style={{ fontWeight:600, color:"var(--text)" }}>
                    {b.customerId?.name || "—"}
                    <div style={{ fontSize:11, color:"var(--text-dim)" }}>{b.customerId?.phone}</div>
                  </td>
                  <td>{b.serviceId?.name || "—"}</td>
                  <td style={{ fontSize:12 }}>
                    {fmt(b.date)}
                    {b.timeSlot && <div style={{ fontSize:11, color:"var(--text-dim)" }}>{b.timeSlot}</div>}
                  </td>
                  <td style={{ fontFamily:"var(--font-mono)", color:"var(--text)" }}>Rs {b.amount}</td>
                  <td>
                    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                      <span className={`badge ${PAY_BADGE[b.payment?.status] || "badge-gray"}`}>{b.payment?.status || "—"}</span>
                      <span style={{ fontSize:10, color:"var(--text-dim)" }}>{b.payment?.method || ""}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${STATUS_BADGE[b.status] || "badge-gray"}`}>{b.status}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(b)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth:520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking #{selected._id.slice(-6).toUpperCase()}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  ["Status",      selected.status],
                  ["Amount",      `Rs ${selected.amount}`],
                  ["Service",     selected.serviceId?.name || "—"],
                  ["Date",        fmt(selected.date)],
                  ["Time Slot",   selected.timeSlot || "—"],
                  ["Payment",     `${selected.payment?.method || "—"} · ${selected.payment?.status || "—"}`],
                  ["Customer",    selected.customerId?.name || "—"],
                  ["Cust. Phone", selected.customerId?.phone || "—"],
                  ["Professional",selected.professionalId?.name || "Not assigned"],
                  ["Pro. Phone",  selected.professionalId?.phone || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ background:"var(--surface2)", borderRadius:8, padding:"10px 14px" }}>
                    <div style={{ fontSize:10, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{k}</div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{v}</div>
                  </div>
                ))}
              </div>

              {selected.address?.fullAddress && (
                <div style={{ background:"var(--surface2)", borderRadius:8, padding:"10px 14px" }}>
                  <div style={{ fontSize:10, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Address</div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{selected.address.fullAddress}</div>
                </div>
              )}

              {selected.payment?.transactionId && (
                <div style={{ background:"var(--surface2)", borderRadius:8, padding:"10px 14px" }}>
                  <div style={{ fontSize:10, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Transaction ID</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>{selected.payment.transactionId}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
