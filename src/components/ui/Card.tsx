/** @format */

import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
};

export default function Card({
  children,
  className,
  padding = 'md',
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'admin-card',
        `admin-card--padding-${padding}`,
        interactive && 'admin-card--interactive',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
