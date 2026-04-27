import { useEffect, useState } from "react";
import { getProfessionals, approveProfessional, rejectProfessional } from "../services/api.js";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api","") || "http://localhost:5000";
const docUrl = (p) => p ? (p.startsWith("http") ? p : `${BASE_URL}${p}`) : null;

const STATUS_BADGE = { pending:"badge-yellow", approved:"badge-green", rejected:"badge-red" };

export default function Professionals() {
  const [professionals, setPros] = useState([]);
  const [loading, setLoading]    = useState(true);
  const [filter, setFilter]      = useState("all");
  const [selected, setSelected]  = useState(null);
  const [acting, setActing]      = useState("");

  const load = () => {
    setLoading(true);
    getProfessionals()
      .then(({ data }) => setPros(data.professionals || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter === "all" ? professionals : professionals.filter((p) => p.status === filter || p.kycStatus === filter);

  const handleApprove = async (id) => {
    setActing(id + "approve");
    await approveProfessional(id).catch(console.error);
    setActing(""); setSelected(null); load();
  };
  const handleReject = async (id) => {
    setActing(id + "reject");
    await rejectProfessional(id).catch(console.error);
    setActing(""); setSelected(null); load();
  };

  const statusOf = (p) => p.kycStatus || p.status || "pending";

  return (
    <div>
      <div className="page-header">
        <div><h1>Professionals</h1><p>KYC review and management</p></div>
        <div style={{ display:"flex", gap:6 }}>
          {["all","pending","approved","rejected"].map((f) => (
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
          <div className="empty-state"><p>No professionals found.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Skills</th>
                <th>Rating</th>
                <th>Jobs</th>
                <th>KYC Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight:600, color:"var(--text)" }}>{p.name || "—"}</td>
                  <td style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>{p.phone}</td>
                  <td>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {(p.skills || [p.skill]).filter(Boolean).map((s,i) => (
                        <span key={i} className="badge badge-blue">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td>{p.rating?.toFixed(1) ?? "—"}</td>
                  <td>{p.completedJobs ?? p.totalJobs ?? 0}</td>
                  <td><span className={`badge ${STATUS_BADGE[statusOf(p)] || "badge-gray"}`}>{statusOf(p)}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(p)}>View</button>
                      {statusOf(p) === "pending" && (
                        <>
                          <button className="btn btn-sm" style={{ background:"rgba(34,197,94,0.12)", color:"var(--green)", border:"1px solid rgba(34,197,94,0.2)" }}
                            onClick={() => handleApprove(p._id)} disabled={!!acting}>
                            {acting===p._id+"approve" ? "…" : "✓"}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(p._id)} disabled={!!acting}>
                            {acting===p._id+"reject" ? "…" : "✕"}
                          </button>
                        </>
                      )}
                    </div>
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
          <div className="modal" style={{ maxWidth:560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.name || "Professional"}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  ["Phone",    selected.phone],
                  ["Status",   statusOf(selected)],
                  ["Rating",   selected.rating?.toFixed(1) ?? "No ratings"],
                  ["Jobs done",selected.completedJobs ?? 0],
                  ["Experience",selected.experience ? `${selected.experience} yrs` : "—"],
                  ["Online",   selected.isOnline ? "Yes" : "No"],
                ].map(([k, v]) => (
                  <div key={k} style={{ background:"var(--surface2)", borderRadius:8, padding:"10px 14px" }}>
                    <div style={{ fontSize:10, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{k}</div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* KYC docs */}
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>KYC Documents</div>
                <div style={{ display:"flex", gap:10 }}>
                  {selected.documents?.aadharUrl ? (
                    <a href={docUrl(selected.documents.aadharUrl)} target="_blank" rel="noreferrer">
                      <button className="btn btn-ghost btn-sm">↗ Aadhaar</button>
                    </a>
                  ) : <span style={{ color:"var(--text-dim)", fontSize:12 }}>No Aadhaar uploaded</span>}

                  {selected.documents?.panUrl ? (
                    <a href={docUrl(selected.documents.panUrl)} target="_blank" rel="noreferrer">
                      <button className="btn btn-ghost btn-sm">↗ PAN</button>
                    </a>
                  ) : <span style={{ color:"var(--text-dim)", fontSize:12 }}>No PAN uploaded</span>}
                </div>
              </div>

              {statusOf(selected) === "pending" && (
                <div style={{ display:"flex", gap:10 }}>
                  <button className="btn btn-sm" style={{ flex:1, justifyContent:"center", background:"rgba(34,197,94,0.12)", color:"var(--green)", border:"1px solid rgba(34,197,94,0.2)" }}
                    onClick={() => handleApprove(selected._id)} disabled={!!acting}>
                    {acting===selected._id+"approve" ? <span className="spinner" style={{ width:12, height:12, borderWidth:2 }} /> : "✓ Approve"}
                  </button>
                  <button className="btn btn-danger btn-sm" style={{ flex:1, justifyContent:"center" }}
                    onClick={() => handleReject(selected._id)} disabled={!!acting}>
                    {acting===selected._id+"reject" ? <span className="spinner" style={{ width:12, height:12, borderWidth:2 }} /> : "✕ Reject"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
