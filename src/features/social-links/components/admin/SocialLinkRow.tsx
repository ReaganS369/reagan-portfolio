/** @format */

'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/src/components/ui/Table';
import Button from '@/src/components/ui/Button';
import type { SocialLink } from '@/src/features/social-links/api/social-links';

type SocialLinkRowProps = {
  link: SocialLink;
  isBusy: boolean;
  onEdit: (link: SocialLink) => void;
  onDelete: (link: SocialLink) => void;
};

export default function SocialLinkRow({
  link,
  isBusy,
  onEdit,
  onDelete,
}: SocialLinkRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="social-link-icon-cell">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={link.icon} alt={link.platform} width={32} height={32} />
        </div>
      </TableCell>

      <TableCell>{link.platform}</TableCell>

      <TableCell>
        <a href={link.url} target="_blank" rel="noreferrer">
          {link.url}
        </a>
      </TableCell>

      <TableCell>{link.sort_order}</TableCell>

      <TableCell>
        <div className="social-link-actions">
          <Button
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => onEdit(link)}
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => onDelete(link)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
