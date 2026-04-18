import React, { useState, useEffect } from 'react';
import { donorAPI, donationAPI } from '../utils/api';

export default function DonationHistory() {
  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState('');
  const [history, setHistory] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('all'); // 'all' | 'donor'

  useEffect(() => {
    donorAPI.getAll().then(r => setDonors(r.data.donors || [])).catch(console.error);
    donationAPI.getAll().then(r => setAllDonations(r.data.donations || [])).catch(console.error);
  }, []);

  const fetchDonorHistory = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await donorAPI.getHistory(id);
      setHistory(res.data.donations || []);
      setView('donor');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const displayDonations = view === 'donor' ? history : allDonations;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Donation History</h1>
          <div className="topbar-sub">View all donation records</div>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body" style={{ paddingBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedDonor}
                onChange={e => { setSelectedDonor(e.target.value); fetchDonorHistory(e.target.value); }}
                style={{ minWidth: 260 }}
              >
                <option value="">— Filter by donor —</option>
                {donors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.blood_group})</option>
                ))}
              </select>
              {view === 'donor' && (
                <button className="btn btn-outline btn-sm" onClick={() => { setView('all'); setSelectedDonor(''); }}>
                  Show All
                </button>
              )}
              <span style={{ fontSize: 13, color: 'var(--gray-400)', marginLeft: 'auto' }}>
                {displayDonations.length} records
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Loading...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Donor</th>
                    <th>Blood Group</th>
                    <th>Units</th>
                    <th>Date</th>
                    <th>Test Result</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {displayDonations.map((d, i) => (
                    <tr key={d.id}>
                      <td style={{ color: 'var(--gray-400)' }}>{d.id}</td>
                      <td><strong>{d.donor_name || d.name}</strong><br/>
                        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{d.donor_email}</span>
                      </td>
                      <td><span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 16 }}>{d.blood_group}</span></td>
                      <td>{d.units}</td>
                      <td>{new Date(d.donation_date).toLocaleDateString('en-IN')}</td>
                      <td><span className={`badge badge-${d.test_result}`}>{d.test_result}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--gray-600)', maxWidth: 180 }}>{d.notes || '—'}</td>
                    </tr>
                  ))}
                  {displayDonations.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 40 }}>
                        No donation records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
