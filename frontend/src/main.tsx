import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { createQueryClient } from './infrastructure/react-query/query-client';
import { ToastProvider } from './ui/toast/ToastProvider';
import './styles/globals.css';

const queryClient = createQueryClient();

const container = document.getElementById('root');
if (!container) throw new Error('No #root element found');

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
