/** @format */

import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={clsx('admin-empty-state', className)}>
      <div className="admin-empty-state__icon" aria-hidden="true">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <h3 className="admin-empty-state__title">{title}</h3>
      {description && (
        <p className="admin-empty-state__description">{description}</p>
      )}
      {action && <div className="admin-empty-state__action">{action}</div>}
    </div>
  );
}
