import { createContext, useContext } from 'react';

export interface CreateTransactionContextValue {
  openCreate: () => void;
}

export const CreateTransactionContext = createContext<CreateTransactionContextValue>({
  openCreate: () => {},
});

export function useCreateTransaction() {
  return useContext(CreateTransactionContext);
}
