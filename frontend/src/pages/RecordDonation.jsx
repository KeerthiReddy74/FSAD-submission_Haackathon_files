import React, { useState, useEffect } from 'react';
import { donorAPI, donationAPI } from '../utils/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RecordDonation() {
  const [donors, setDonors] = useState([]);
  const [form, setForm] = useState({
    donor_id: '', blood_group: '', units: '1.0',
    donation_date: new Date().toISOString().split('T')[0],
    test_result: 'passed', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    donorAPI.getAll().then(r => setDonors(r.data.donors || [])).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'donor_id') {
      const donor = donors.find(d => d.id === parseInt(value));
      setForm(f => ({ ...f, donor_id: value, blood_group: donor?.blood_group || '' }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await donationAPI.record(form);
      setResult({ type: 'success', message: res.data.message });
      setForm(f => ({ ...f, donor_id: '', notes: '', blood_group: '' }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Error recording donation.';
      setResult({ type: err.response?.data?.eligible === false ? 'warning' : 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Record Donation</h1>
          <div className="topbar-sub">Log a blood donation and update inventory</div>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header"><h3>Donation Details</h3></div>
          <div className="card-body">
            {result && (
              <div className={`alert alert-${result.type}`} style={{ marginBottom: 20 }}>
                {result.type === 'success' ? '✅' : result.type === 'warning' ? '⚠️' : '❌'} {result.message}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Donor *</label>
                  <select name="donor_id" value={form.donor_id} onChange={handleChange} required>
                    <option value="">Select donor</option>
                    {donors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.blood_group} ({d.email})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Group *</label>
                  <select name="blood_group" value={form.blood_group} onChange={handleChange} required>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Units (default 1.0)</label>
                  <input name="units" type="number" step="0.1" min="0.5" max="2" value={form.units} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Donation Date *</label>
                  <input name="donation_date" type="date" value={form.donation_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Test Result</label>
                  <select name="test_result" value={form.test_result} onChange={handleChange}>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes..." />
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Recording...' : '💉 Record Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
