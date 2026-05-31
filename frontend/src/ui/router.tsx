import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout/AppLayout';

const DashboardScreen = lazy(() =>
  import('./screens/DashboardScreen/DashboardScreen').then((m) => ({ default: m.DashboardScreen })),
);
const UsersScreen = lazy(() =>
  import('./screens/UsersScreen/UsersScreen').then((m) => ({ default: m.UsersScreen })),
);
const UserDetailScreen = lazy(() =>
  import('./screens/UserDetailScreen/UserDetailScreen').then((m) => ({ default: m.UserDetailScreen })),
);
const TransactionsScreen = lazy(() =>
  import('./screens/TransactionsScreen/TransactionsScreen').then((m) => ({ default: m.TransactionsScreen })),
);
const TransactionDetailScreen = lazy(() =>
  import('./screens/TransactionDetailScreen/TransactionDetailScreen').then((m) => ({
    default: m.TransactionDetailScreen,
  })),
);
const PendingScreen = lazy(() =>
  import('./screens/PendingScreen/PendingScreen').then((m) => ({ default: m.PendingScreen })),
);

export function AppRouter() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/usuarios" element={<UsersScreen />} />
          <Route path="/usuarios/:id" element={<UserDetailScreen />} />
          <Route path="/transacciones" element={<TransactionsScreen />} />
          <Route path="/transacciones/:id" element={<TransactionDetailScreen />} />
          <Route path="/pendientes" element={<PendingScreen />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
