import React, { useState } from 'react';
import { donorAPI, donationAPI } from '../utils/api';

export default function EligibilityCheck() {
  const [search, setSearch] = useState('');
  const [donorId, setDonorId] = useState('');
  const [donors, setDonors] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchDonors = async () => {
    try {
      const res = await donorAPI.getAll();
      const all = res.data.donors || [];
      setDonors(all.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase())
      ));
      setSearched(true);
    } catch (err) {
      console.error(err);
    }
  };

  const checkEligibility = async (id) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await donationAPI.checkEligibility(id);
      setResult(res.data);
    } catch (err) {
      setResult({ eligible: false, message: err.response?.data?.message || 'Error checking.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Eligibility Check</h1>
          <div className="topbar-sub">Check if a donor is eligible to donate (90-day rule)</div>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header">
            <h3>Search Donor</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchDonors()}
                placeholder="Search by name or email..."
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={searchDonors}>Search</button>
            </div>

            {searched && donors.length === 0 && (
              <div className="alert alert-warning">No donors found.</div>
            )}

            {donors.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Blood Group</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map(d => (
                      <tr key={d.id}>
                        <td><strong>{d.name}</strong></td>
                        <td>{d.email}</td>
                        <td><span style={{ fontWeight: 700, color: 'var(--red)' }}>{d.blood_group}</span></td>
                        <td>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => checkEligibility(d.id)}
                          >
                            Check
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {loading && <div style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)' }}>Checking eligibility...</div>}

            {result && (
              <div className={`eligibility-box ${result.eligible ? 'eligible' : 'not-eligible'}`}>
                <h3>{result.eligible ? '✅ Eligible to Donate' : '❌ Not Eligible'}</h3>
                <p style={{ margin: '8px 0' }}>{result.message}</p>
                {result.last_donation && (
                  <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                    Last donation: {new Date(result.last_donation).toLocaleDateString('en-IN')}
                    {result.days_since !== undefined && ` (${result.days_since} days ago)`}
                  </p>
                )}
                {result.days_until_eligible > 0 && (
                  <p style={{ marginTop: 8, fontWeight: 700 }}>
                    Eligible in: {result.days_until_eligible} days
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info card */}
        <div className="card" style={{ maxWidth: 640, marginTop: 20 }}>
          <div className="card-body">
            <h3 style={{ marginBottom: 12, fontFamily: 'DM Sans', fontSize: 16 }}>📋 Eligibility Criteria</h3>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.8 }}>
              <li>Minimum 90 days since last whole blood donation</li>
              <li>Age: 18–65 years</li>
              <li>Weight: minimum 50 kg</li>
              <li>Hemoglobin: ≥ 12.5 g/dL</li>
              <li>No recent illness, surgery, or medication</li>
              <li>Blood pressure within normal range</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
