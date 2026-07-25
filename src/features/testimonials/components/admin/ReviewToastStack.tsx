'use client';

/** @format */

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';

export type ReviewToast = {
  id: string;
  tone: 'success' | 'error';
  message: string;
};

type Props = {
  toasts: ReviewToast[];
  onDismiss: (id: string) => void;
};

export default function ReviewToastStack({ toasts, onDismiss }: Props) {
  if (typeof document === 'undefined' || toasts.length === 0) return null;

  return createPortal(
    <div className="rvw-toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rvw-toast rvw-toast--${toast.tone}`}
          onClick={() => onDismiss(toast.id)}
        >
          {toast.tone === 'success' ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>,
    document.body,
  );
}
