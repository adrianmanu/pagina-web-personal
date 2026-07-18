import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="confirm">
        <span className="confirm__icon">
          <AlertTriangle size={22} />
        </span>
        <p>{message}</p>
      </div>
      <div className="modal__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
