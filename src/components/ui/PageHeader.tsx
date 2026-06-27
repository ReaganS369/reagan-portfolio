/** @format */

import clsx from 'clsx';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={clsx('admin-page-header', className)}>
      <div className="admin-page-header__content">
        <h1 className="admin-page-header__title">{title}</h1>
        {description && (
          <p className="admin-page-header__description">{description}</p>
        )}
      </div>
      {action && <div className="admin-page-header__action">{action}</div>}
    </header>
  );
}
