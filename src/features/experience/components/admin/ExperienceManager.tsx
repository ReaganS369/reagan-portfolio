'use client';

/** @format */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/src/components/ui/Card';
import {
  createExperience,
  deleteExperience,
  getExperience,
  swapExperienceOrder,
  updateExperience,
  type Experience,
} from '../../api/experience';
import ExperienceModal, { type ExperienceFormValues } from './ExperienceModal';
import ExperienceTable from './ExperienceTable';
import './experience-admin.css';

function sortEntries(entries: Experience[]): Experience[] {
  return [...entries].sort((a, b) => a.sort_order - b.sort_order);
}

function getNextSortOrder(entries: Experience[]): number {
  if (entries.length === 0) return 0;
  return Math.max(...entries.map((e) => e.sort_order)) + 1;
}

export default function ExperienceManager() {
  const [entries, setEntries] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingEntry, setEditingEntry] = useState<Experience | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultSortOrder = useMemo(() => getNextSortOrder(entries), [entries]);

  const loadEntries = useCallback(async () => {
    setError(null);
    try {
      const data = await getExperience();
      setEntries(sortEntries(data));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load experience entries.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  function openCreateModal() {
    setModalMode('create');
    setEditingEntry(null);
    setModalOpen(true);
  }

  function openEditModal(entry: Experience) {
    setModalMode('edit');
    setEditingEntry(entry);
    setModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) return;
    setModalOpen(false);
    setEditingEntry(null);
  }

  async function handleSubmit(values: ExperienceFormValues) {
    setIsSubmitting(true);
    setError(null);

    const previous = entries;
    const tempId = `temp-${crypto.randomUUID()}`;

    try {
      if (modalMode === 'create') {
        const optimistic: Experience = {
          id: tempId,
          company: values.company,
          position: values.position,
          description: values.description || null,
          start_date: values.start_date || null,
          end_date: values.end_date || null,
          current: values.current,
          sort_order: values.sort_order,
          created_at: new Date().toISOString(),
        };

        setEntries((current) => sortEntries([...current, optimistic]));

        const created = await createExperience({
          company: values.company,
          position: values.position,
          description: values.description || null,
          start_date: values.start_date || null,
          end_date: values.end_date || null,
          current: values.current,
          sort_order: values.sort_order,
        });

        setEntries((current) =>
          sortEntries(current.map((e) => (e.id === tempId ? created : e))),
        );
      } else if (editingEntry) {
        const optimistic: Experience = {
          ...editingEntry,
          company: values.company,
          position: values.position,
          description: values.description || null,
          start_date: values.start_date || null,
          end_date: values.end_date || null,
          current: values.current,
          sort_order: values.sort_order,
        };

        setEntries((current) =>
          sortEntries(current.map((e) => (e.id === editingEntry.id ? optimistic : e))),
        );

        const updated = await updateExperience(editingEntry.id, {
          company: values.company,
          position: values.position,
          description: values.description || null,
          start_date: values.start_date || null,
          end_date: values.end_date || null,
          current: values.current,
          sort_order: values.sort_order,
        });

        setEntries((current) =>
          sortEntries(current.map((e) => (e.id === updated.id ? updated : e))),
        );
      }

      setModalOpen(false);
      setEditingEntry(null);
    } catch (submitError) {
      setEntries(previous);
      throw submitError;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(entry: Experience) {
    const previous = entries;
    setBusyId(entry.id);
    setError(null);

    setEntries((current) => current.filter((e) => e.id !== entry.id));

    try {
      await deleteExperience(entry.id);
    } catch (deleteError) {
      setEntries(previous);
      setError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete entry.',
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(entry: Experience, direction: 'up' | 'down') {
    const previous = entries;
    const sorted = sortEntries(entries);
    const index = sorted.findIndex((e) => e.id === entry.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return;

    setBusyId(entry.id);
    setError(null);

    const neighbor = sorted[targetIndex];
    const optimistic = sortEntries(
      sorted.map((e) => {
        if (e.id === entry.id) return { ...e, sort_order: neighbor.sort_order };
        if (e.id === neighbor.id) return { ...e, sort_order: entry.sort_order };
        return e;
      }),
    );

    setEntries(optimistic);

    try {
      const next = await swapExperienceOrder(entries, entry.id, direction);
      setEntries(next);
    } catch (moveError) {
      setEntries(previous);
      setError(
        moveError instanceof Error ? moveError.message : 'Failed to reorder entries.',
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card padding="md">
      {error && <div className="experience-alert">{error}</div>}

      <ExperienceTable
        entries={entries}
        isLoading={isLoading}
        busyId={busyId}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onMove={handleMove}
      />

      <ExperienceModal
        open={modalOpen}
        mode={modalMode}
        entry={editingEntry}
        defaultSortOrder={defaultSortOrder}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
