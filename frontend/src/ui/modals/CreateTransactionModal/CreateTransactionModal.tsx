import { useEffect, useMemo, useState } from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/Button/Button';
import { UserCombobox } from '@/ui/components/UserCombobox/UserCombobox';
import { Input } from '@/ui/components/Input/Input';
import { APPROVAL_THRESHOLD } from '@/domain/transaction/transaction';
import { useUsersList } from '@/infrastructure/react-query/hooks/useUsersList';
import { useCreateTransaction } from '@/infrastructure/react-query/hooks/useCreateTransaction';
import { useToast } from '@/ui/toast/ToastProvider';
import { formatCurrency } from '@/utils/format-currency';
import { isHttpError } from '@/infrastructure/http/http-error';
import { cx } from '@/utils/cx';
import styles from './CreateTransactionModal.module.css';

interface Errors {
  origin?: string;
  destination?: string;
  amount?: string;
}

export interface CreateTransactionModalProps {
  open: boolean;
  onClose: () => void;
  defaultOriginUserId?: string;
}

export function CreateTransactionModal({
  open,
  onClose,
  defaultOriginUserId,
}: CreateTransactionModalProps) {
  const toast = useToast();
  const usersQuery = useUsersList();
  const createMutation = useCreateTransaction();

  const [originUserId, setOriginUserId] = useState('');
  const [destinationUserId, setDestinationUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setOriginUserId(defaultOriginUserId ?? '');
      setDestinationUserId('');
      setAmount('');
      setErrors({});
    }
  }, [open, defaultOriginUserId]);

  const users = usersQuery.data ?? [];
  const origin = users.find((u) => u.id === originUserId);

  const destinationUsers = useMemo(
    () => users.filter((u) => u.id !== originUserId),
    [users, originUserId],
  );

  const amountNumber = Number(amount);
  const requiresApproval = Number.isFinite(amountNumber) && amountNumber > APPROVAL_THRESHOLD;

  function validate(): boolean {
    const next: Errors = {};
    if (!originUserId) next.origin = 'Seleccioná el usuario origen';
    if (!destinationUserId) next.destination = 'Seleccioná el usuario destino';
    if (originUserId && destinationUserId && originUserId === destinationUserId) {
      next.destination = 'Origen y destino deben ser distintos';
    }
    if (!amount || !Number.isFinite(amountNumber) || amountNumber <= 0) {
      next.amount = 'Ingresá un monto mayor a 0';
    } else if (origin && amountNumber > origin.balance) {
      next.amount = 'Saldo insuficiente';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate(
      { originUserId, destinationUserId, amount: amountNumber },
      {
        onSuccess: (data) => {
          if (data.status === 'COMPLETED') {
            toast.success(data.message ?? 'Transacción completada');
          } else {
            toast.info(data.message ?? 'Transacción pendiente de aprobación');
          }
          onClose();
        },
        onError: (err) => {
          const msg = isHttpError(err) ? err.message : (err as Error).message;
          toast.error(msg);
        },
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crear Transacción"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-tx-form"
            loading={createMutation.isPending}
            disabled={usersQuery.isLoading}
          >
            Crear Transacción
          </Button>
        </>
      }
    >
      <form id="create-tx-form" className={styles.form} onSubmit={handleSubmit}>
        <UserCombobox
          label="Usuario Origen"
          placeholder="Buscar usuario…"
          users={users}
          value={originUserId}
          onChange={(id) => { setOriginUserId(id); setDestinationUserId(''); }}
          getSecondaryLabel={(u) => formatCurrency(u.balance)}
          error={errors.origin}
          disabled={usersQuery.isLoading}
        />
        <UserCombobox
          label="Usuario Destino"
          placeholder="Buscar usuario…"
          users={destinationUsers}
          value={destinationUserId}
          onChange={setDestinationUserId}
          error={errors.destination}
          disabled={usersQuery.isLoading || !originUserId}
        />
        <Input
          label="Monto"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          help={origin ? `Saldo disponible: ${formatCurrency(origin.balance)}` : undefined}
          className={styles.amountInput}
        />
        <div className={cx(styles.notice, requiresApproval && styles.warningNotice)}>
          {requiresApproval ? <AlertTriangle size={16} /> : <Info size={16} />}
          <span>
            Si el monto es menor o igual a {formatCurrency(APPROVAL_THRESHOLD)}, la transacción se aprobará automáticamente. Si supera los {formatCurrency(APPROVAL_THRESHOLD)}, quedará pendiente de aprobación.
          </span>
        </div>
      </form>
    </Modal>
  );
}
