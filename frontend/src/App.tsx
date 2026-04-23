import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components';
import { RequireAdmin, RequireAuth, RequireScanner, RequireUser } from '@/components/auth';
import { AppNotificationProvider } from '@/components/appNotifications/AppNotificationProvider';
import { AuthProvider } from '@/auth/AuthContext';
import {
  HomePage,
  ShowDetailPage,
  CheckoutPage,
  OrdersPage,
  OrderDetailsPage,
  CheckInPage,
  NotFoundPage,
  AdminMetricsPage,
  CreateShowPage,
  ManageShowsPage,
  EditShowPage,
  ScannerAccountsPage,
  ChangePasswordPage,
  LoginPage,
  RegisterPage,
  VerifyEmailPage,
  VerifyEmailNoticePage,
} from '@/pages';
import { QUERY_RETRY_COUNT, QUERY_STALE_TIME_MS } from '@/config/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      retry: QUERY_RETRY_COUNT,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppNotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="shows/:showId" element={<ShowDetailPage />} />
                <Route
                  path="checkout"
                  element={(
                    <RequireAuth>
                      <CheckoutPage />
                    </RequireAuth>
                  )}
                />
                <Route
                  path="change-password"
                  element={(
                    <RequireAuth>
                      <ChangePasswordPage />
                    </RequireAuth>
                  )}
                />
                <Route
                  path="orders"
                  element={(
                    <RequireUser>
                      <OrdersPage />
                    </RequireUser>
                  )}
                />
                <Route
                  path="orders/:orderId"
                  element={(
                    <RequireUser>
                      <OrderDetailsPage />
                    </RequireUser>
                  )}
                />
                <Route
                  path="check-in"
                  element={(
                    <RequireScanner>
                      <CheckInPage />
                    </RequireScanner>
                  )}
                />
                <Route
                  path="admin/metrics"
                  element={(
                    <RequireAdmin>
                      <AdminMetricsPage />
                    </RequireAdmin>
                  )}
                />
                <Route
                  path="admin/shows"
                  element={(
                    <RequireAdmin>
                      <ManageShowsPage />
                    </RequireAdmin>
                  )}
                />
                <Route
                  path="admin/shows/new"
                  element={(
                    <RequireAdmin>
                      <CreateShowPage />
                    </RequireAdmin>
                  )}
                />
                <Route
                  path="admin/shows/:showId/edit"
                  element={(
                    <RequireAdmin>
                      <EditShowPage />
                    </RequireAdmin>
                  )}
                />
                <Route
                  path="admin/scanners"
                  element={(
                    <RequireAdmin>
                      <ScannerAccountsPage />
                    </RequireAdmin>
                  )}
                />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="verify-email-notice" element={<VerifyEmailNoticePage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AppNotificationProvider>
    </QueryClientProvider>
  );
}
