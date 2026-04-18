import React, { useState, useEffect } from 'react';
import { requestAPI } from '../utils/api';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRequests = async () => {
    try {
      const res = await requestAPI.getAll();
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + '-approve');
    try {
      await requestAPI.approve(id);
      showToast('Request approved and stock deducted!');
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.message || 'Approval failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '-reject');
    try {
      await requestAPI.reject(id);
      showToast('Request rejected.', 'warning');
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.message || 'Rejection failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Manage Requests</h1>
          <div className="topbar-sub">Admin: Approve or reject hospital blood requests</div>
        </div>
      </div>
      <div className="page-body">
        {toast && (
          <div className={`alert alert-${toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'success'}`}
            style={{ marginBottom: 20 }}>
            {toast.msg}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>

        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>Loading requests...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Hospital</th>
                    <th>Blood Group</th>
                    <th>Units</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--gray-400)' }}>{r.id}</td>
                      <td>
                        <strong>{r.hospital_name}</strong><br/>
                        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{r.hospital_email}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 18 }}>{r.blood_group}</span>
                      </td>
                      <td><strong>{r.units_requested}</strong></td>
                      <td><span className={`badge badge-${r.urgency}`}>{r.urgency}</span></td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td style={{ fontSize: 13 }}>{new Date(r.requested_at).toLocaleDateString('en-IN')}</td>
                      <td>
                        {r.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(r.id)}
                              disabled={actionLoading === r.id + '-approve'}
                            >
                              {actionLoading === r.id + '-approve' ? '...' : '✓ Approve'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(r.id)}
                              disabled={actionLoading === r.id + '-reject'}
                            >
                              {actionLoading === r.id + '-reject' ? '...' : '✕ Reject'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 40 }}>
                        No {filter !== 'all' ? filter : ''} requests found
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
