import React, { useState } from 'react';
import { donorAPI } from '../utils/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorRegister() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', blood_group: '', date_of_birth: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await donorAPI.register(form);
      setResult({ type: 'success', message: res.data.message + ` Donor ID: #${res.data.donor_id}` });
      setForm({ name: '', email: '', phone: '', blood_group: '', date_of_birth: '' });
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
          <h1>Donor Registration</h1>
          <div className="topbar-sub">Register a new blood donor</div>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header">
            <h3>New Donor Details</h3>
          </div>
          <div className="card-body">
            {result && (
              <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 20 }}>
                {result.type === 'success' ? '✅' : '❌'} {result.message}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label>Blood Group *</label>
                  <select name="blood_group" value={form.blood_group} onChange={handleChange} required>
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Registering...' : '🩸 Register Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
