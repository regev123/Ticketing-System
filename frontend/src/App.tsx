import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components';
import { HomePage, ShowDetailPage, CheckoutPage, AdminPage, CreateShowPage } from '@/pages';
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="shows/:showId" element={<ShowDetailPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="admin/shows/new" element={<CreateShowPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
