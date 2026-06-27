/** @format */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/src/components/ui/Card';
import {
  createSocialLink,
  deleteSocialLink,
  getSocialLinks,
  updateSocialLink,
  type SocialLink,
} from '@/src/features/social-links/api/social-links';
import {
  deleteStorageObject,
  getStoragePathFromUrl,
  uploadSocialLinkIcon,
} from '@/src/lib/storage';
import SocialLinkModal, { type SocialLinkFormValues } from './SocialLinkModal';
import SocialLinkTable from './SocialLinkTable';
import './social-links.css';

function sortLinks(links: SocialLink[]): SocialLink[] {
  return [...links].sort((a, b) => a.sort_order - b.sort_order);
}

function getNextDisplayOrder(links: SocialLink[]): number {
  if (links.length === 0) return 0;
  return Math.max(...links.map((link) => link.sort_order)) + 1;
}

export default function SocialLinksManager() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyLinkId, setBusyLinkId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultDisplayOrder = useMemo(
    () => getNextDisplayOrder(links),
    [links],
  );

  const loadLinks = useCallback(async () => {
    setError(null);

    try {
      const data = await getSocialLinks();
      setLinks(sortLinks(data));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load social links.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchLinks() {
      await loadLinks();
    }

    void fetchLinks();
  }, [loadLinks]);

  function openCreateModal() {
    setModalMode('create');
    setEditingLink(null);
    setModalOpen(true);
  }

  function openEditModal(link: SocialLink) {
    setModalMode('edit');
    setEditingLink(link);
    setModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) return;
    setModalOpen(false);
    setEditingLink(null);
  }

  async function handleSubmit(values: SocialLinkFormValues) {
    setIsSubmitting(true);
    setError(null);

    const previousLinks = links;
    const tempId = `temp-${crypto.randomUUID()}`;

    try {
      let iconUrl = values.icon;

      if (values.iconFile) {
        iconUrl = await uploadSocialLinkIcon(values.iconFile);
      }

      if (modalMode === 'create') {
        const optimisticLink: SocialLink = {
          id: tempId,
          platform: values.platform,
          url: values.url,
          icon: iconUrl,
          sort_order: values.display_order,
          created_at: new Date().toISOString(),
        };

        setLinks((current) => sortLinks([...current, optimisticLink]));

        const created = await createSocialLink({
          platform: values.platform,
          url: values.url,
          icon: iconUrl,
          sort_order: values.display_order,
        });

        setLinks((current) =>
          sortLinks(
            current.map((link) => (link.id === tempId ? created : link)),
          ),
        );
      } else if (editingLink) {
        const optimisticLink: SocialLink = {
          ...editingLink,
          platform: values.platform,
          url: values.url,
          icon: iconUrl,
          sort_order: values.display_order,
        };

        setLinks((current) =>
          sortLinks(
            current.map((link) =>
              link.id === editingLink.id ? optimisticLink : link,
            ),
          ),
        );

        const updated = await updateSocialLink(editingLink.id, {
          platform: values.platform,
          url: values.url,
          icon: iconUrl,
          sort_order: values.display_order,
        });

        if (values.iconFile && editingLink.icon !== updated.icon) {
          const previousPath = getStoragePathFromUrl(editingLink.icon);
          if (previousPath) {
            void deleteStorageObject(previousPath).catch(() => undefined);
          }
        }

        setLinks((current) =>
          sortLinks(
            current.map((link) => (link.id === updated.id ? updated : link)),
          ),
        );
      }

      setModalOpen(false);
      setEditingLink(null);
    } catch (submitError) {
      setLinks(previousLinks);
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to save social link.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(link: SocialLink) {
    const previousLinks = links;
    setBusyLinkId(link.id);
    setError(null);

    setLinks((current) => current.filter((item) => item.id !== link.id));

    try {
      await deleteSocialLink(link.id);
      const previousPath = getStoragePathFromUrl(link.icon);
      if (previousPath) {
        void deleteStorageObject(previousPath).catch(() => undefined);
      }
    } catch (deleteError) {
      setLinks(previousLinks);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete social link.',
      );
    } finally {
      setBusyLinkId(null);
    }
  }

  return (
    <Card padding="md">
      {error && <div className="social-links-alert">{error}</div>}

      <SocialLinkTable
        links={links}
        isLoading={isLoading}
        busyLinkId={busyLinkId}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <SocialLinkModal
        key={
          modalOpen
            ? `${modalMode}-${editingLink?.id ?? 'new'}-${defaultDisplayOrder}`
            : 'closed'
        }
        open={modalOpen}
        mode={modalMode}
        link={editingLink}
        defaultDisplayOrder={defaultDisplayOrder}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
