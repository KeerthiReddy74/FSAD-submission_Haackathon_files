import React, { useEffect, useState } from 'react';
import { inventoryAPI, donorAPI, requestAPI, donationAPI } from '../utils/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [inv, don, req, donat] = await Promise.all([
          inventoryAPI.getAll(),
          donorAPI.getAll(),
          requestAPI.getAll(),
          donationAPI.getAll(),
        ]);
        setInventory(inv.data.inventory || []);
        setDonors(don.data.donors || []);
        setRequests(req.data.requests || []);
        setDonations(donat.data.donations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getStockStatus = (units, threshold) => {
    if (units <= 2) return 'critical';
    if (units <= threshold) return 'low';
    return 'normal';
  };

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const criticalGroups = inventory.filter(i => i.units_available <= 2).length;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <div className="topbar-sub">Blood Bank Overview — {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
        </div>
      </div>
      <div className="page-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>Loading dashboard...</div>
        ) : (
          <>
            {/* Alerts */}
            {criticalGroups > 0 && (
              <div className="alert alert-error" style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 18 }}>🚨</span>
                <span><strong>{criticalGroups} blood group(s) critically low!</strong> Immediate donor outreach required.</span>
              </div>
            )}
            {pendingRequests > 0 && (
              <div className="alert alert-warning" style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span><strong>{pendingRequests} hospital request(s)</strong> awaiting admin approval.</span>
              </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon red">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div className="stat-value">{donors.length}</div>
                  <div className="stat-label">Registered Donors</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
                <div>
                  <div className="stat-value">{donations.length}</div>
                  <div className="stat-label">Total Donations</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon amber">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </div>
                <div>
                  <div className="stat-value">{pendingRequests}</div>
                  <div className="stat-label">Pending Requests</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <div className="stat-value">{criticalGroups}</div>
                  <div className="stat-label">Critical Groups</div>
                </div>
              </div>
            </div>

            {/* Blood Inventory */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <h3>🩸 Blood Group Inventory</h3>
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Live Stock Levels</span>
              </div>
              <div className="card-body">
                <div className="blood-grid">
                  {BLOOD_GROUPS.map(bg => {
                    const item = inventory.find(i => i.blood_group === bg);
                    const units = item?.units_available || 0;
                    const threshold = item?.low_stock_threshold || 5;
                    const status = getStockStatus(units, threshold);
                    return (
                      <div key={bg} className={`blood-card ${status}`}>
                        <div className="blood-type" style={{ color: status === 'critical' ? 'var(--red)' : status === 'low' ? '#856404' : 'var(--gray-800)' }}>
                          {bg}
                        </div>
                        <div className="blood-units" style={{ color: status === 'critical' ? 'var(--red)' : 'var(--gray-800)' }}>
                          {units}
                        </div>
                        <div className="blood-label">units</div>
                        <div className={`blood-badge badge-${status}`}>
                          {status === 'critical' ? '🚨 Critical' : status === 'low' ? '⚠️ Low' : '✓ Good'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Requests */}
            <div className="card">
              <div className="card-header">
                <h3>Recent Hospital Requests</h3>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Hospital</th>
                      <th>Blood Group</th>
                      <th>Units</th>
                      <th>Urgency</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.slice(0, 10).map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.hospital_name}</strong></td>
                        <td><span style={{ fontWeight: 700, color: 'var(--red)' }}>{r.blood_group}</span></td>
                        <td>{r.units_requested}</td>
                        <td><span className={`badge badge-${r.urgency}`}>{r.urgency}</span></td>
                        <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                        <td>{new Date(r.requested_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 32 }}>No requests yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
