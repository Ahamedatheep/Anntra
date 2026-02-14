import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import DonorDashboard from './pages/DonorDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import NGODashboard from './pages/NGODashboard';
import BeneficiaryDashboard from './pages/BeneficiaryDashboard';

// New Detailed Pages
import AdminDeliveries from './pages/AdminDeliveries';
import AdminAnalytics from './pages/AdminAnalytics';
import DonorNewDonation from './pages/DonorNewDonation';
import DonorImpact from './pages/DonorImpact';
import VolunteerHistory from './pages/VolunteerHistory';
import VolunteerStats from './pages/VolunteerStats';
import NGOVolunteers from './pages/NGOVolunteers';
import NGOManagement from './pages/NGOManagement';
import NGOBeneficiaries from './pages/NGOBeneficiaries';
import BeneficiaryRequests from './pages/BeneficiaryRequests';

import { Package } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>Authenticating Secure Connection...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

const RoleRedirect = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'admin': return <Navigate to="/admin" />;
    case 'donor': return <Navigate to="/donor" />;
    case 'volunteer': return <Navigate to="/volunteer" />;
    case 'ngo': return <Navigate to="/ngo" />;
    case 'beneficiary': return <Navigate to="/beneficiary" />;
    default: return <Navigate to="/login" />;
  }
};

const Placeholder = ({ title }) => (
  <div className="card fade-in" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
    <div style={{ background: 'var(--gray-100)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--gray-300)', border: '1px solid var(--gray-200)' }}>
      <Package size={40} />
    </div>
    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '1rem', letterSpacing: '-0.025em' }}>{title}</h3>
    <p style={{ color: 'var(--gray-600)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>Our engineers are currently refining this module for peak efficiency. Performance analytics and historical data will be live shortly.</p>
    <button className="btn-primary" style={{ width: 'auto', marginTop: '2.5rem', padding: '0.75rem 2rem' }} onClick={() => window.history.back()}>Return to Base</button>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout title="Command Core" />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="deliveries" element={<AdminDeliveries />} />
            <Route path="ngos" element={<NGOManagement />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Donor Routes */}
          <Route path="/donor" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <Layout title="Donor Console" />
            </ProtectedRoute>
          }>
            <Route index element={<DonorDashboard />} />
            <Route path="new" element={<DonorNewDonation />} />
            <Route path="impact" element={<DonorImpact />} />
          </Route>

          {/* Volunteer Routes */}
          <Route path="/volunteer" element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <Layout title="Mission Control" />
            </ProtectedRoute>
          }>
            <Route index element={<VolunteerDashboard />} />
            <Route path="history" element={<VolunteerHistory />} />
            <Route path="stats" element={<VolunteerStats />} />
          </Route>

          {/* NGO Routes */}
          <Route path="/ngo" element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <Layout title="NGO Operations Hub" />
            </ProtectedRoute>
          }>
            <Route index element={<NGODashboard />} />
            <Route path="volunteers" element={<NGOVolunteers />} />
            <Route path="beneficiaries" element={<NGOBeneficiaries />} />
          </Route>

          {/* Beneficiary Routes */}
          <Route path="/beneficiary" element={
            <ProtectedRoute allowedRoles={['beneficiary']}>
              <Layout title="Relief Portal" />
            </ProtectedRoute>
          }>
            <Route index element={<BeneficiaryDashboard />} />
            <Route path="requests" element={<BeneficiaryRequests />} />
          </Route>

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
