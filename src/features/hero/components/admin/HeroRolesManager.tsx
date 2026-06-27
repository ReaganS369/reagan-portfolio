'use client';

/** @format */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/src/components/ui/Card';
import {
  createHeroRole,
  deleteHeroRole,
  getAllHeroRoles,
  swapHeroRoleOrder,
  updateHeroRole,
  type HeroRole,
} from '@/src/features/hero/api/heroRoles';
import {
  deleteStorageObject,
  uploadHeroRoleIcon,
} from '@/src/lib/storage';
import HeroRoleModal, { type HeroRoleFormValues } from './HeroRoleModal';
import HeroRoleTable from './HeroRoleTable';
import './hero-roles.css';

function sortRoles(roles: HeroRole[]): HeroRole[] {
  return [...roles].sort((a, b) => a.display_order - b.display_order);
}

function getNextDisplayOrder(roles: HeroRole[]): number {
  if (roles.length === 0) return 0;
  return Math.max(...roles.map((role) => role.display_order)) + 1;
}

export default function HeroRolesManager() {
  const [roles, setRoles] = useState<HeroRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyRoleId, setBusyRoleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRole, setEditingRole] = useState<HeroRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultDisplayOrder = useMemo(
    () => getNextDisplayOrder(roles),
    [roles],
  );

  const loadRoles = useCallback(async () => {
    setError(null);

    try {
      const data = await getAllHeroRoles();
      setRoles(sortRoles(data));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load hero roles.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  function openCreateModal() {
    setModalMode('create');
    setEditingRole(null);
    setModalOpen(true);
  }

  function openEditModal(role: HeroRole) {
    setModalMode('edit');
    setEditingRole(role);
    setModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) return;
    setModalOpen(false);
    setEditingRole(null);
  }

  async function handleSubmit(values: HeroRoleFormValues) {
    setIsSubmitting(true);
    setError(null);

    const previousRoles = roles;
    const tempId = `temp-${crypto.randomUUID()}`;

    try {
      let iconPath = values.icon_url;

      if (values.iconFile) {
        iconPath = await uploadHeroRoleIcon(values.iconFile);
      }

      if (modalMode === 'create') {
        const optimisticRole: HeroRole = {
          id: tempId,
          title: values.title,
          icon_url: iconPath,
          display_order: values.display_order,
          is_active: values.is_active,
        };

        setRoles((current) => sortRoles([...current, optimisticRole]));

        const created = await createHeroRole({
          title: values.title,
          icon_url: iconPath,
          display_order: values.display_order,
          is_active: values.is_active,
        });

        setRoles((current) =>
          sortRoles(
            current.map((role) => (role.id === tempId ? created : role)),
          ),
        );
      } else if (editingRole) {
        const optimisticRole: HeroRole = {
          ...editingRole,
          title: values.title,
          icon_url: iconPath,
          display_order: values.display_order,
          is_active: values.is_active,
        };

        setRoles((current) =>
          sortRoles(
            current.map((role) =>
              role.id === editingRole.id ? optimisticRole : role,
            ),
          ),
        );

        const updated = await updateHeroRole(editingRole.id, {
          title: values.title,
          icon_url: iconPath,
          display_order: values.display_order,
          is_active: values.is_active,
        });

        if (
          values.iconFile &&
          editingRole.icon_url &&
          editingRole.icon_url !== updated.icon_url
        ) {
          void deleteStorageObject(editingRole.icon_url).catch(() => undefined);
        }

        setRoles((current) =>
          sortRoles(
            current.map((role) => (role.id === updated.id ? updated : role)),
          ),
        );
      }

      setModalOpen(false);
      setEditingRole(null);
    } catch (submitError) {
      setRoles(previousRoles);
      throw submitError;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(role: HeroRole) {
    const previousRoles = roles;
    setBusyRoleId(role.id);
    setError(null);

    setRoles((current) => current.filter((item) => item.id !== role.id));

    try {
      await deleteHeroRole(role.id);
      if (role.icon_url) {
        void deleteStorageObject(role.icon_url).catch(() => undefined);
      }
    } catch (deleteError) {
      setRoles(previousRoles);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete hero role.',
      );
    } finally {
      setBusyRoleId(null);
    }
  }

  async function handleToggleActive(role: HeroRole) {
    const previousRoles = roles;
    const nextActive = !role.is_active;

    setBusyRoleId(role.id);
    setError(null);

    setRoles((current) =>
      sortRoles(
        current.map((item) =>
          item.id === role.id ? { ...item, is_active: nextActive } : item,
        ),
      ),
    );

    try {
      const updated = await updateHeroRole(role.id, { is_active: nextActive });
      setRoles((current) =>
        sortRoles(
          current.map((item) => (item.id === updated.id ? updated : item)),
        ),
      );
    } catch (toggleError) {
      setRoles(previousRoles);
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : 'Failed to update role status.',
      );
    } finally {
      setBusyRoleId(null);
    }
  }

  async function handleMove(role: HeroRole, direction: 'up' | 'down') {
    const previousRoles = roles;
    const sorted = sortRoles(roles);
    const index = sorted.findIndex((item) => item.id === role.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) {
      return;
    }

    const neighbor = sorted[targetIndex];
    const optimistic = sortRoles(
      sorted.map((item) => {
        if (item.id === role.id) {
          return { ...item, display_order: neighbor.display_order };
        }
        if (item.id === neighbor.id) {
          return { ...item, display_order: role.display_order };
        }
        return item;
      }),
    );

    setBusyRoleId(role.id);
    setError(null);
    setRoles(optimistic);

    try {
      const nextRoles = await swapHeroRoleOrder(roles, role.id, direction);
      setRoles(nextRoles);
    } catch (moveError) {
      setRoles(previousRoles);
      setError(
        moveError instanceof Error
          ? moveError.message
          : 'Failed to reorder hero roles.',
      );
    } finally {
      setBusyRoleId(null);
    }
  }

  return (
    <Card padding="md">
      {error && <div className="hero-roles-alert">{error}</div>}

      <HeroRoleTable
        roles={roles}
        isLoading={isLoading}
        busyRoleId={busyRoleId}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onMove={handleMove}
      />

      <HeroRoleModal
        open={modalOpen}
        mode={modalMode}
        role={editingRole}
        defaultDisplayOrder={defaultDisplayOrder}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
