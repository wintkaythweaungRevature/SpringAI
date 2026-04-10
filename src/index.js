import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import RefundPolicy from './components/RefundPolicy';
import ChangelogPage from './components/ChangelogPage';
import ResetPassword from './components/ResetPassword';
import SEOPublicLayout from './pages/SEOPublicLayout';
import ToolLandingPage from './pages/ToolLandingPage';
import PublicBioPage from './pages/PublicBioPage';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#6366f1' } },
  breakpoints: { values: { xs: 0, sm: 640, md: 900, lg: 1200, xl: 1536 } },
});

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
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/features" element={<SEOPublicLayout />} />
        <Route path="/pricing" element={<SEOPublicLayout />} />
        <Route path="/use-cases" element={<SEOPublicLayout />} />
        <Route path="/blog" element={<SEOPublicLayout />} />
        <Route path="/tutorial" element={<SEOPublicLayout />} />
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
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Root />
      </ThemeProvider>
    </React.StrictMode>
  );
}

reportWebVitals();
