import React, { useState, useEffect } from 'react';
import { hospitalAPI, requestAPI, inventoryAPI } from '../utils/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RequestBlood() {
  const [hospitals, setHospitals] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ hospital_id: '', blood_group: '', units_requested: '', urgency: 'normal' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    hospitalAPI.getAll().then(r => setHospitals(r.data.hospitals || [])).catch(console.error);
    inventoryAPI.getAll().then(r => setInventory(r.data.inventory || [])).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getAvailable = (bg) => {
    const item = inventory.find(i => i.blood_group === bg);
    return item ? item.units_available : '—';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await requestAPI.create(form);
      setResult({ type: 'success', message: res.data.message + ` Request ID: #${res.data.request_id}` });
      setForm(f => ({ ...f, blood_group: '', units_requested: '', urgency: 'normal' }));
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Request failed.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedInv = form.blood_group ? inventory.find(i => i.blood_group === form.blood_group) : null;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Request Blood</h1>
          <div className="topbar-sub">Hospitals can request blood units from the blood bank</div>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          <div className="card">
            <div className="card-header"><h3>Blood Request Form</h3></div>
            <div className="card-body">
              {result && (
                <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 20 }}>
                  {result.type === 'success' ? '✅' : '❌'} {result.message}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Hospital *</label>
                    <select name="hospital_id" value={form.hospital_id} onChange={handleChange} required>
                      <option value="">Select hospital</option>
                      {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Blood Group *</label>
                    <select name="blood_group" value={form.blood_group} onChange={handleChange} required>
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg} (Available: {getAvailable(bg)} units)</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Units Requested *</label>
                    <input name="units_requested" type="number" step="0.5" min="0.5" value={form.units_requested} onChange={handleChange} placeholder="e.g. 2" required />
                  </div>
                  <div className="form-group">
                    <label>Urgency</label>
                    <select name="urgency" value={form.urgency} onChange={handleChange}>
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {selectedInv && (
                  <div className={`alert ${selectedInv.units_available <= 2 ? 'alert-error' : selectedInv.units_available <= selectedInv.low_stock_threshold ? 'alert-warning' : 'alert-info'}`} style={{ marginTop: 16 }}>
                    {form.blood_group} current stock: <strong>{selectedInv.units_available} units</strong>
                    {selectedInv.units_available <= 2 && ' — ⚠️ Critically low!'}
                  </div>
                )}

                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : '🩸 Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Inventory sidebar */}
          <div className="card">
            <div className="card-header"><h3>Current Stock</h3></div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              {BLOOD_GROUPS.map(bg => {
                const item = inventory.find(i => i.blood_group === bg);
                const units = item?.units_available || 0;
                const threshold = item?.low_stock_threshold || 5;
                const status = units <= 2 ? 'critical' : units <= threshold ? 'low' : 'normal';
                return (
                  <div key={bg} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid var(--gray-100)'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: status === 'critical' ? 'var(--red)' : 'var(--gray-800)' }}>{bg}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>{units} units</span>
                      <span className={`blood-badge badge-${status}`} style={{ fontSize: 10 }}>
                        {status === 'critical' ? '🚨' : status === 'low' ? '⚠️' : '✓'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
