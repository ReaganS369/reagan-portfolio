'use client';

/** @format */

import { useCallback, useRef, useState } from 'react';
import type { ReviewToast } from '../components/admin/ReviewToastStack';

const TOAST_DURATION_MS = 3200;

export default function useReviewToasts() {
  const [toasts, setToasts] = useState<ReviewToast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ReviewToast['tone'], message: string) => {
      const id = `t${nextId.current++}`;
      setToasts((prev) => [...prev, { id, tone, message }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  return {
    toasts,
    dismiss,
    success: useCallback((message: string) => push('success', message), [push]),
    error: useCallback((message: string) => push('error', message), [push]),
  };
}
