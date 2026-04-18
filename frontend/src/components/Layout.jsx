import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  donor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  drop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  hospital: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  request: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🩸 Blood<span>Bank</span></h2>
          <div className="logo-sub">Management System</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Overview</div>
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {icons.dashboard} Dashboard
          </NavLink>

          <div className="nav-section-label">Donors</div>
          <NavLink to="/donor/register" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {icons.donor} Register Donor
          </NavLink>
          <NavLink to="/donor/eligibility" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {icons.check} Eligibility Check
          </NavLink>
          <NavLink to="/donor/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {icons.history} Donation History
          </NavLink>
          <NavLink to="/donor/donate" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {icons.drop} Record Donation
          </NavLink>

          <div className="nav-section-label">Hospitals</div>
          <NavLink to="/hospital/register" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {icons.hospital} Register Hospital
          </NavLink>
          <NavLink to="/hospital/request" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {icons.request} Request Blood
          </NavLink>

          <div className="nav-section-label">Admin</div>
          <NavLink to="/admin/requests" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {icons.admin} Manage Requests
          </NavLink>
          <NavLink to="/admin/inventory" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {icons.drop} Manage Inventory
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
