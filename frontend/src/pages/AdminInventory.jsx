import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../utils/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInventory = async () => {
    try {
      const res = await inventoryAPI.getAll();
      setInventory(res.data.inventory || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const startEdit = (item) => {
    setEditing(item.blood_group);
    setEditValues({ units_available: item.units_available, low_stock_threshold: item.low_stock_threshold });
  };

  const saveEdit = async (bg) => {
    setSaving(bg);
    try {
      await inventoryAPI.update(bg, editValues);
      showToast(`${bg} inventory updated successfully.`);
      setEditing(null);
      fetchInventory();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setSaving(null);
    }
  };

  const getStatus = (units, threshold) => {
    if (units <= 2) return { label: '🚨 Critical', cls: 'critical' };
    if (units <= threshold) return { label: '⚠️ Low', cls: 'low' };
    return { label: '✓ Good', cls: 'normal' };
  };

  const totalUnits = inventory.reduce((sum, i) => sum + parseFloat(i.units_available || 0), 0);
  const criticalCount = inventory.filter(i => i.units_available <= 2).length;
  const lowCount = inventory.filter(i => i.units_available > 2 && i.units_available <= i.low_stock_threshold).length;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Inventory Management</h1>
          <div className="topbar-sub">Admin: Update blood stock levels and thresholds</div>
        </div>
      </div>
      <div className="page-body">
        {toast && (
          <div className={`alert alert-${toast.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: 20 }}>
            {toast.msg}
          </div>
        )}

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon red">🩸</div>
            <div>
              <div className="stat-value">{totalUnits.toFixed(1)}</div>
              <div className="stat-label">Total Units in Stock</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">🚨</div>
            <div>
              <div className="stat-value">{criticalCount}</div>
              <div className="stat-label">Critical Groups</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber">⚠️</div>
            <div>
              <div className="stat-value">{lowCount}</div>
              <div className="stat-label">Low Stock Groups</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div>
              <div className="stat-value">{inventory.length - criticalCount - lowCount}</div>
              <div className="stat-label">Well-Stocked Groups</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Blood Group Stock Levels</h3></div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>Loading...</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Blood Group</th>
                    <th>Units Available</th>
                    <th>Low Stock Threshold</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {BLOOD_GROUPS.map(bg => {
                    const item = inventory.find(i => i.blood_group === bg) || { blood_group: bg, units_available: 0, low_stock_threshold: 5 };
                    const status = getStatus(item.units_available, item.low_stock_threshold);
                    const isEditing = editing === bg;
                    return (
                      <tr key={bg}>
                        <td>
                          <span style={{ fontWeight: 800, fontSize: 20, color: status.cls === 'critical' ? 'var(--red)' : 'var(--gray-800)' }}>
                            {bg}
                          </span>
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number" step="0.5" min="0"
                              value={editValues.units_available}
                              onChange={e => setEditValues(v => ({ ...v, units_available: e.target.value }))}
                              style={{ width: 90, padding: '6px 10px' }}
                            />
                          ) : (
                            <strong style={{ fontSize: 18 }}>{item.units_available}</strong>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number" min="1"
                              value={editValues.low_stock_threshold}
                              onChange={e => setEditValues(v => ({ ...v, low_stock_threshold: e.target.value }))}
                              style={{ width: 80, padding: '6px 10px' }}
                            />
                          ) : (
                            item.low_stock_threshold
                          )}
                        </td>
                        <td>
                          <span className={`blood-badge badge-${status.cls}`}>{status.label}</span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                          {item.last_updated ? new Date(item.last_updated).toLocaleString('en-IN') : '—'}
                        </td>
                        <td>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-success btn-sm" onClick={() => saveEdit(bg)} disabled={saving === bg}>
                                {saving === bg ? '...' : '💾 Save'}
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                            </div>
                          ) : (
                            <button className="btn btn-outline btn-sm" onClick={() => startEdit(item)}>✏️ Edit</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
