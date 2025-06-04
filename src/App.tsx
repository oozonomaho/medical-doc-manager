import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import DeadlineManagement from './pages/DeadlineManagement';
import PendingClaims from './pages/PendingClaims';
import InsuranceChange from './pages/InsuranceChange';
import AuditLogs from './pages/AuditLogs';
import StopList from './pages/StopList';
import MessageBoard from './pages/MessageBoard';
import LifeInsurance from './pages/LifeInsurance';
import MedicalCertificates from './pages/MedicalCertificates';
import { PatientProvider } from './context/PatientContext';

function App() {
  return (
    <PatientProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<PatientList />} />
            <Route path="/patient/:id" element={<PatientDetail />} />
            <Route path="/deadlines" element={<DeadlineManagement />} />
            <Route path="/life-insurance" element={<LifeInsurance />} />
            <Route path="/pending-claims" element={<PendingClaims />} />
            <Route path="/insurance-change" element={<InsuranceChange />} />
            <Route path="/stop-list" element={<StopList />} />
            <Route path="/message-board" element={<MessageBoard />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/medical-certificates" element={<MedicalCertificates />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </PatientProvider>
  );
}

export default App;