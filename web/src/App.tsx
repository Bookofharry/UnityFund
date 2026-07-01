import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';

// Route-level code splitting — each page becomes its own JS chunk
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const FundsPage = lazy(() => import('./pages/FundsPage').then((m) => ({ default: m.FundsPage })));
const FundDetailPage = lazy(() => import('./pages/FundDetailPage').then((m) => ({ default: m.FundDetailPage })));
const ContributionsPage = lazy(() => import('./pages/ContributionsPage').then((m) => ({ default: m.ContributionsPage })));
const MembersPage = lazy(() => import('./pages/MembersPage').then((m) => ({ default: m.MembersPage })));
const PayoutsPage = lazy(() => import('./pages/PayoutsPage').then((m) => ({ default: m.PayoutsPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const InviteAcceptPage = lazy(() => import('./pages/InviteAcceptPage').then((m) => ({ default: m.InviteAcceptPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage').then((m) => ({ default: m.PaymentCallbackPage })));
const BankAccountsPage = lazy(() => import('./pages/BankAccountsPage').then((m) => ({ default: m.BankAccountsPage })));
const MandatesPage = lazy(() => import('./pages/MandatesPage').then((m) => ({ default: m.MandatesPage })));

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" aria-hidden="true" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              {/* Public marketing page */}
              <Route path="/" element={<LandingPage />} />

              {/* Public auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected standalone — no AppShell sidebar */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

              {/* Public invitation acceptance */}
              <Route path="/invite/:token" element={<InviteAcceptPage />} />

              {/* Payment callback — standalone, no sidebar */}
              <Route path="/payments/callback" element={<ProtectedRoute><PaymentCallbackPage /></ProtectedRoute>} />

              {/* Protected app routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/funds" element={<FundsPage />} />
                <Route path="/funds/:fundId" element={<FundDetailPage />} />
                <Route path="/contributions" element={<ContributionsPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/payouts" element={<PayoutsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/bank-accounts" element={<BankAccountsPage />} />
                <Route path="/mandates" element={<MandatesPage />} />
              </Route>

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
