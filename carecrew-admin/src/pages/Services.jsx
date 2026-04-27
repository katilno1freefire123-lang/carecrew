import { useEffect, useState } from "react";
import { getServices, createService, updateService, deleteService } from "../services/api.js";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api","") || "http://localhost:5000";
const imgSrc = (img) => img ? (img.startsWith("http") ? img : `${BASE_URL}${img}`) : null;

const EMPTY = { name:"", nameNe:"", description:"", descriptionNe:"", price:"", duration:"", image:null };

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | "create" | service obj
  const [form, setForm]         = useState(EMPTY);
  const [file, setFile]         = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const load = () => {
    setLoading(true);
    getServices()
      .then(({ data }) => setServices(data.services || []))
      .catch(() => setError("Failed to load services."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY); setFile(null); setModal("create"); };
  const openEdit   = (s) => {
    setForm({ name: s.name, nameNe: s.nameNe||"", description: s.description, descriptionNe: s.descriptionNe||"", price: s.price, duration: s.duration, image: s.image });
    setFile(null);
    setModal(s);
  };
  const closeModal = () => { setModal(null); setError(""); };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== "image" && v !== null) fd.append(k, v); });
      if (file) fd.append("image", file);

      if (modal === "create") await createService(fd);
      else await updateService(modal._id, fd);

      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save service.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;
    await deleteService(id).catch(() => {});
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Services</h1><p>Manage all available services</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Service</button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding: 40 }}><span className="spinner" /></div>
        ) : services.length === 0 ? (
          <div className="empty-state"><p>No services yet.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Nepali Name</th>
                <th>Price (NPR)</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
                      {imgSrc(s.image) ? (
                        <img src={imgSrc(s.image)} alt="" style={{ width:34, height:34, borderRadius:6, objectFit:"cover", background:"var(--surface2)" }} />
                      ) : (
                        <div style={{ width:34, height:34, borderRadius:6, background:"var(--surface2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>◈</div>
                      )}
                      <div>
                        <div style={{ fontWeight:600, color:"var(--text)", fontSize:13 }}>{s.name}</div>
                        <div style={{ fontSize:11, color:"var(--text-dim)" }}>{s.description?.substring(0,40)}…</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.nameNe || <span style={{ color:"var(--text-dim)" }}>—</span>}</td>
                  <td style={{ fontFamily:"var(--font-mono)", color:"var(--text)" }}>Rs {s.price}</td>
                  <td>{s.duration} min</td>
                  <td><span className={`badge ${s.isActive ? "badge-green" : "badge-red"}`}>{s.isActive ? "Active" : "Inactive"}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === "create" ? "Add Service" : "Edit Service"}</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="form-group">
                  <label>Name (English)</label>
                  <input value={form.name} onChange={f("name")} placeholder="AC Repair" />
                </div>
                <div className="form-group">
                  <label>Name (Nepali)</label>
                  <input value={form.nameNe} onChange={f("nameNe")} placeholder="एसी मर्मत" />
                </div>
              </div>
              <div className="form-group">
                <label>Description (English)</label>
                <textarea value={form.description} onChange={f("description")} placeholder="Service description…" />
              </div>
              <div className="form-group">
                <label>Description (Nepali)</label>
                <textarea value={form.descriptionNe} onChange={f("descriptionNe")} placeholder="सेवाको विवरण…" />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="form-group">
                  <label>Price (NPR)</label>
                  <input type="number" value={form.price} onChange={f("price")} placeholder="999" min="0" />
                </div>
                <div className="form-group">
                  <label>Duration (min)</label>
                  <input type="number" value={form.duration} onChange={f("duration")} placeholder="60" min="1" />
                </div>
              </div>
              <div className="form-group">
                <label>Service Image</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ padding:"6px 10px" }} />
                {!file && imgSrc(form.image) && (
                  <img src={imgSrc(form.image)} alt="" style={{ width:60, height:60, borderRadius:8, objectFit:"cover", marginTop:6 }} />
                )}
              </div>
              {error && <div style={{ color:"var(--red)", fontSize:13 }}>{error}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner" style={{ width:12, height:12, borderWidth:2 }} /> Saving…</> : "Save Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
