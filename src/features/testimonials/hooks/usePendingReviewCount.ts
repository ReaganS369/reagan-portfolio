/** @format */

'use client';

import { useEffect, useState } from 'react';
import { getPendingReviewCount } from '@/src/features/testimonials/api/reviews';

export default function usePendingReviewCount() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;

    void getPendingReviewCount()
      .then((count) => {
        if (active) setPendingCount(count);
      })
      .catch(() => {
        if (active) setPendingCount(0);
      });

    return () => {
      active = false;
    };
  }, []);

  return pendingCount;
}
