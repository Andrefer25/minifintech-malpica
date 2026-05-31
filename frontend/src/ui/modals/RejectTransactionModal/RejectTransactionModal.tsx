import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Transaction } from '@/domain/transaction/transaction';
import type { User } from '@/domain/user/user';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/Button/Button';
import { Textarea } from '@/ui/components/Textarea/Textarea';
import { useRejectTransaction } from '@/infrastructure/react-query/hooks/useRejectTransaction';
import { useToast } from '@/ui/toast/ToastProvider';
import { formatCurrency } from '@/utils/format-currency';
import { isHttpError } from '@/infrastructure/http/http-error';
import styles from './RejectTransactionModal.module.css';

export interface RejectTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  origin?: User | null;
  destination?: User | null;
}

export function RejectTransactionModal({ open, onClose, transaction, origin, destination }: RejectTransactionModalProps) {
  const reject = useRejectTransaction();
  const toast = useToast();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!transaction) return null;

  function handleConfirm() {
    if (!transaction) return;
    reject.mutate(
      { id: transaction.id, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Transacción rechazada');
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
      title="Rechazar Transacción"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={reject.isPending}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={reject.isPending}>
            Confirmar Rechazo
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
      <Textarea
        label="Motivo del rechazo"
        placeholder="Opcional..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={500}
        showCount
      />
      <div className={styles.notice}>
        <AlertTriangle size={16} />
        <span>Esta acción NO moverá fondos.</span>
      </div>
    </Modal>
  );
}
