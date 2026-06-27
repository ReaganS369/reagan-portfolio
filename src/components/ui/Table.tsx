/** @format */

import clsx from 'clsx';
import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

type TableProps = HTMLAttributes<HTMLTableElement> & {
  children: ReactNode;
};

type TableSectionProps = HTMLAttributes<HTMLTableSectionElement> & {
  children: ReactNode;
};

type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  children: ReactNode;
};

type TableHeadCellProps = ThHTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
};

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
};

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className="admin-table-wrap">
      <table className={clsx('admin-table', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className, ...props }: TableSectionProps) {
  return (
    <thead className={clsx('admin-table__head', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }: TableSectionProps) {
  return (
    <tbody className={clsx('admin-table__body', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr className={clsx('admin-table__row', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHeadCell({ children, className, ...props }: TableHeadCellProps) {
  return (
    <th className={clsx('admin-table__head-cell', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td className={clsx('admin-table__cell', className)} {...props}>
      {children}
    </td>
  );
}
