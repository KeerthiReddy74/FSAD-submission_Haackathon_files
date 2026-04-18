import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../utils/api';

export default function HospitalRegister() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    hospitalAPI.getAll().then(r => setHospitals(r.data.hospitals || [])).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await hospitalAPI.register(form);
      setResult({ type: 'success', message: res.data.message + ` Hospital ID: #${res.data.hospital_id}` });
      setForm({ name: '', email: '', phone: '', address: '' });
      const updated = await hospitalAPI.getAll();
      setHospitals(updated.data.hospitals || []);
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Hospital Registration</h1>
          <div className="topbar-sub">Register hospitals that can request blood units</div>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          <div className="card">
            <div className="card-header"><h3>Register New Hospital</h3></div>
            <div className="card-body">
              {result && (
                <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 20 }}>
                  {result.type === 'success' ? '✅' : '❌'} {result.message}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-grid single">
                  <div className="form-group">
                    <label>Hospital Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="City General Hospital" required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@hospital.com" required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 40 1234 5678" />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea name="address" value={form.address} onChange={handleChange} placeholder="Full address..." rows={3} />
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Registering...' : '🏥 Register Hospital'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Registered Hospitals ({hospitals.length})</h3></div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th></tr>
                </thead>
                <tbody>
                  {hospitals.map(h => (
                    <tr key={h.id}>
                      <td><strong>{h.name}</strong></td>
                      <td style={{ fontSize: 13 }}>{h.email}</td>
                      <td style={{ fontSize: 13 }}>{h.phone || '—'}</td>
                    </tr>
                  ))}
                  {hospitals.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 24 }}>No hospitals registered</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
