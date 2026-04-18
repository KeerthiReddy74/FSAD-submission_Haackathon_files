import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DonorRegister from './pages/DonorRegister';
import EligibilityCheck from './pages/EligibilityCheck';
import DonationHistory from './pages/DonationHistory';
import RecordDonation from './pages/RecordDonation';
import HospitalRegister from './pages/HospitalRegister';
import RequestBlood from './pages/RequestBlood';
import AdminRequests from './pages/AdminRequests';
import AdminInventory from './pages/AdminInventory';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/donor/register" element={<DonorRegister />} />
          <Route path="/donor/eligibility" element={<EligibilityCheck />} />
          <Route path="/donor/history" element={<DonationHistory />} />
          <Route path="/donor/donate" element={<RecordDonation />} />
          <Route path="/hospital/register" element={<HospitalRegister />} />
          <Route path="/hospital/request" element={<RequestBlood />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
        </Routes>
      </Layout>
    </Router>
  );
}
