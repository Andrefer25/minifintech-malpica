import { AlertTriangle } from 'lucide-react';
import type { Transaction } from '@/domain/transaction/transaction';
import type { User } from '@/domain/user/user';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/Button/Button';
import { useApproveTransaction } from '@/infrastructure/react-query/hooks/useApproveTransaction';
import { useToast } from '@/ui/toast/ToastProvider';
import { formatCurrency } from '@/utils/format-currency';
import { isHttpError } from '@/infrastructure/http/http-error';
import styles from './ApproveTransactionModal.module.css';

export interface ApproveTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  origin?: User | null;
  destination?: User | null;
}

export function ApproveTransactionModal({
  open,
  onClose,
  transaction,
  origin,
  destination,
}: ApproveTransactionModalProps) {
  const approve = useApproveTransaction();
  const toast = useToast();

  if (!transaction) return null;

  function handleConfirm() {
    if (!transaction) return;
    approve.mutate(transaction.id, {
      onSuccess: () => {
        toast.success('Transacción aprobada');
        onClose();
      },
      onError: (err) => {
        const msg = isHttpError(err) ? err.message : (err as Error).message;
        toast.error(msg);
        onClose();
      },
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aprobar Transacción"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={approve.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={approve.isPending}>
            Confirmar Aprobación
          </Button>
        </>
      }
    >
      <div className={styles.summary}>
        <div className={styles.usersRow}>
          <div className={styles.row}>
            <span className={styles.label}>Origen</span>
            <span className={styles.value}>{origin?.name ?? transaction.originUserId}</span>
            {origin && (
              <span className={styles.label}>Saldo: {formatCurrency(origin.balance)}</span>
            )}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Destino</span>
            <span className={styles.value}>
              {destination?.name ?? transaction.destinationUserId}
            </span>
            {destination && (
              <span className={styles.label}>Saldo: {formatCurrency(destination.balance)}</span>
            )}
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Monto a transferir</span>
          <span className={styles.amountValue}>{formatCurrency(transaction.amount)}</span>
        </div>
      </div>
      <div className={styles.warning}>
        <AlertTriangle size={16} />
        <span>Esta acción moverá fondos de forma permanente.</span>
      </div>
    </Modal>
  );
}
