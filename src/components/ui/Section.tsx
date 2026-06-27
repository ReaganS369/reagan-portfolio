/** @format */

import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

type SectionProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function Section({
  title,
  description,
  action,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={clsx('admin-section', className)} {...props}>
      {(title || description || action) && (
        <div className="admin-section__header">
          <div className="admin-section__heading">
            {title && <h2 className="admin-section__title">{title}</h2>}
            {description && (
              <p className="admin-section__description">{description}</p>
            )}
          </div>
          {action && <div className="admin-section__action">{action}</div>}
        </div>
      )}
      <div className="admin-section__content">{children}</div>
    </section>
  );
}
