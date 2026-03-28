import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ResetPassword from './components/ResetPassword';
import SEOPublicLayout from './pages/SEOPublicLayout';
import ToolLandingPage from './pages/ToolLandingPage';
import PublicBioPage from './pages/PublicBioPage';

const rootElement = document.getElementById('root');

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <AuthProvider>
        <ResetPassword
          token={token}
          onDone={() => { window.location.href = '/'; }}
        />
      </AuthProvider>
    </div>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/features" element={<SEOPublicLayout />} />
        <Route path="/pricing" element={<SEOPublicLayout />} />
        <Route path="/use-cases" element={<SEOPublicLayout />} />
        <Route path="/docs" element={<SEOPublicLayout />} />
        <Route path="/tools/:slug" element={<ToolLandingPage />} />
        <Route path="/u/:slug" element={<PublicBioPage />} />
        <Route path="/*" element={
          <AuthProvider>
            <App />
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

if (!rootElement) {
  console.error("Root element not found! Make sure id='root' exists in index.html");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}

reportWebVitals();
