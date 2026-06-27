/** @format */

import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'admin-btn',
        `admin-btn--${variant}`,
        `admin-btn--${size}`,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
