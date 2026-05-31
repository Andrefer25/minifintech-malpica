import { lazy, Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/ui/components/Header/Header';
import { BottomNav } from '@/ui/components/BottomNav/BottomNav';
import { Sidebar } from '@/ui/components/Sidebar/Sidebar';
import { CreateTransactionContext } from './CreateTransactionContext';
import styles from './AppLayout.module.css';

const CreateTransactionModal = lazy(() =>
  import('@/ui/modals/CreateTransactionModal/CreateTransactionModal').then((m) => ({
    default: m.CreateTransactionModal,
  })),
);

export function AppLayout() {
  const [createOpen, setCreateOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const openCreate = () => { setHasOpened(true); setCreateOpen(true); };
  return (
    <CreateTransactionContext.Provider value={{ openCreate }}>
      <div className={styles.layout}>
        <Header onCreateTransaction={openCreate} />
        <div className={styles.body}>
          <Sidebar />
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
        <BottomNav onCreateTransaction={openCreate} />
        {hasOpened && (
          <Suspense fallback={null}>
            <CreateTransactionModal open={createOpen} onClose={() => setCreateOpen(false)} />
          </Suspense>
        )}
      </div>
    </CreateTransactionContext.Provider>
  );
}
