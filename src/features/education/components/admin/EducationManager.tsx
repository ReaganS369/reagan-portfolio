'use client';

/** @format */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/src/components/ui/Card';
import {
  createEducation,
  deleteEducation,
  getEducation,
  swapEducationOrder,
  updateEducation,
  type Education,
} from '../../api/education';
import EducationModal, { type EducationFormValues } from './EducationModal';
import EducationTable from './EducationTable';
import './education-admin.css';

function sortEntries(entries: Education[]): Education[] {
  return [...entries].sort((a, b) => a.sort_order - b.sort_order);
}

function getNextSortOrder(entries: Education[]): number {
  if (entries.length === 0) return 0;
  return Math.max(...entries.map((e) => e.sort_order)) + 1;
}

export default function EducationManager() {
  const [entries, setEntries] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingEntry, setEditingEntry] = useState<Education | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultSortOrder = useMemo(() => getNextSortOrder(entries), [entries]);

  const loadEntries = useCallback(async () => {
    setError(null);
    try {
      const data = await getEducation();
      setEntries(sortEntries(data));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load education entries.',
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

  function openEditModal(entry: Education) {
    setModalMode('edit');
    setEditingEntry(entry);
    setModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) return;
    setModalOpen(false);
    setEditingEntry(null);
  }

  async function handleSubmit(values: EducationFormValues) {
    setIsSubmitting(true);
    setError(null);

    const previous = entries;
    const tempId = `temp-${crypto.randomUUID()}`;

    try {
      if (modalMode === 'create') {
        const optimistic: Education = {
          id: tempId,
          institution: values.institution,
          degree: values.degree,
          field: values.field,
          description: values.description || null,
          start_year: values.start_year ? Number(values.start_year) : null,
          end_year: values.end_year ? Number(values.end_year) : null,
          sort_order: values.sort_order,
          created_at: new Date().toISOString(),
        };

        setEntries((current) => sortEntries([...current, optimistic]));

        const created = await createEducation({
          institution: values.institution,
          degree: values.degree,
          field: values.field,
          description: values.description || null,
          start_year: values.start_year ? Number(values.start_year) : null,
          end_year: values.end_year ? Number(values.end_year) : null,
          sort_order: values.sort_order,
        });

        setEntries((current) =>
          sortEntries(current.map((e) => (e.id === tempId ? created : e))),
        );
      } else if (editingEntry) {
        const optimistic: Education = {
          ...editingEntry,
          institution: values.institution,
          degree: values.degree,
          field: values.field,
          description: values.description || null,
          start_year: values.start_year ? Number(values.start_year) : null,
          end_year: values.end_year ? Number(values.end_year) : null,
          sort_order: values.sort_order,
        };

        setEntries((current) =>
          sortEntries(current.map((e) => (e.id === editingEntry.id ? optimistic : e))),
        );

        const updated = await updateEducation(editingEntry.id, {
          institution: values.institution,
          degree: values.degree,
          field: values.field,
          description: values.description || null,
          start_year: values.start_year ? Number(values.start_year) : null,
          end_year: values.end_year ? Number(values.end_year) : null,
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

  async function handleDelete(entry: Education) {
    const previous = entries;
    setBusyId(entry.id);
    setError(null);

    setEntries((current) => current.filter((e) => e.id !== entry.id));

    try {
      await deleteEducation(entry.id);
    } catch (deleteError) {
      setEntries(previous);
      setError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete entry.',
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(entry: Education, direction: 'up' | 'down') {
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
      const next = await swapEducationOrder(entries, entry.id, direction);
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
      {error && <div className="education-alert">{error}</div>}

      <EducationTable
        entries={entries}
        isLoading={isLoading}
        busyId={busyId}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onMove={handleMove}
      />

      <EducationModal
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
