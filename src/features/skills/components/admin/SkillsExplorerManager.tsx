'use client';

/** @format */

import { Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import {
  createSkillNode,
  deleteSkillNode,
  getAllSkillNodes,
  moveSkillNode,
  swapSkillNodeOrder,
  updateSkillNode,
  type SkillNodeRow,
} from '../../api/skillNodes';
import {
  createSkillTool,
  deleteSkillTool,
  getAllSkillTools,
  swapSkillToolOrder,
  updateSkillTool,
  type SkillToolRow,
} from '../../api/skillTools';
import { buildSkillTree, computeSharePercent, filterTreeForSearch, getDescendantIds, getSiblings } from '../../lib/tree';
import SkillTree from './SkillTree';
import SkillNodeModal, { type SkillNodeFormValues } from './SkillNodeModal';
import MoveNodeModal from './MoveNodeModal';
import ToolsPanel from './ToolsPanel';
import ToolModal, { type ToolFormValues } from './ToolModal';
import './skills-admin.css';

function parentLabelFor(parentId: string | null, allNodes: SkillNodeRow[]): string {
  if (!parentId) return 'Knowledge Core (root)';
  return allNodes.find((n) => n.id === parentId)?.name ?? 'Unknown';
}

function breadcrumbFor(node: SkillNodeRow, allNodes: SkillNodeRow[]): string {
  const chain: string[] = [node.name];
  let current = node;
  while (current.parent_id) {
    const parent = allNodes.find((n) => n.id === current.parent_id);
    if (!parent) break;
    chain.unshift(parent.name);
    current = parent;
  }
  chain.unshift('Knowledge Core');
  return chain.join(' / ');
}

export default function SkillsExplorerManager() {
  const [allNodes, setAllNodes] = useState<SkillNodeRow[]>([]);
  const [allTools, setAllTools] = useState<SkillToolRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toolBusyId, setToolBusyId] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | number>('all');

  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [nodeModalMode, setNodeModalMode] = useState<'create' | 'edit'>('create');
  const [editingNode, setEditingNode] = useState<SkillNodeRow | null>(null);
  const [createParent, setCreateParent] = useState<SkillNodeRow | null>(null);
  const [isSubmittingNode, setIsSubmittingNode] = useState(false);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [movingNode, setMovingNode] = useState<SkillNodeRow | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [toolModalMode, setToolModalMode] = useState<'create' | 'edit'>('create');
  const [editingTool, setEditingTool] = useState<SkillToolRow | null>(null);
  const [isSubmittingTool, setIsSubmittingTool] = useState(false);

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [nodes, tools] = await Promise.all([getAllSkillNodes(), getAllSkillTools()]);
      setAllNodes(nodes);
      setAllTools(tools);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const roots = useMemo(() => buildSkillTree(allNodes), [allNodes]);
  const availableLevels = useMemo(
    () => Array.from(new Set(allNodes.map((n) => n.level))).sort((a, b) => a - b),
    [allNodes],
  );

  const searchLower = search.trim().toLowerCase();
  const displayRoots = useMemo(() => {
    if (levelFilter !== 'all') {
      return allNodes
        .filter((n) => n.level === levelFilter)
        .filter((n) => !searchLower || n.name.toLowerCase().includes(searchLower))
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((n) => ({ ...n, children: [] }));
    }
    return searchLower ? filterTreeForSearch(roots, searchLower) : roots;
  }, [roots, allNodes, levelFilter, searchLower]);

  const selectedNode = allNodes.find((n) => n.id === selectedId) ?? null;
  const selectedTools = allTools.filter((t) => t.skill_node_id === selectedId);
  const selectedSiblings = selectedNode ? getSiblings(selectedNode, allNodes) : [];
  const selectedShare = selectedNode ? computeSharePercent(selectedNode, selectedSiblings) : 0;

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* --------------------------- node CRUD --------------------------- */

  function openCreateRoot() {
    setNodeModalMode('create');
    setEditingNode(null);
    setCreateParent(null);
    setNodeModalOpen(true);
  }

  function openAddChild(parent: SkillNodeRow) {
    setNodeModalMode('create');
    setEditingNode(null);
    setCreateParent(parent);
    setExpandedIds((prev) => new Set(prev).add(parent.id));
    setNodeModalOpen(true);
  }

  function openEditNode(node: SkillNodeRow) {
    setNodeModalMode('edit');
    setEditingNode(node);
    setCreateParent(null);
    setNodeModalOpen(true);
  }

  function closeNodeModal() {
    if (isSubmittingNode) return;
    setNodeModalOpen(false);
    setEditingNode(null);
  }

  async function handleNodeSubmit(values: SkillNodeFormValues) {
    setIsSubmittingNode(true);
    setError(null);
    try {
      const payload = {
        parent_id: nodeModalMode === 'create' ? (createParent?.id ?? null) : editingNode!.parent_id,
        name: values.name,
        description: values.description || null,
        icon: values.icon || null,
        color: values.color || null,
        rating: values.rating.trim() === '' ? null : Number(values.rating),
        sort_order: values.sort_order,
        is_active: values.is_active,
        notes: values.notes || null,
      };

      if (nodeModalMode === 'create') {
        const created = await createSkillNode(payload, createParent?.level ?? null);
        setAllNodes((prev) => [...prev, created]);
        setSelectedId(created.id);
      } else if (editingNode) {
        const updated = await updateSkillNode(editingNode.id, payload);
        setAllNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      }
      setNodeModalOpen(false);
      setEditingNode(null);
    } finally {
      setIsSubmittingNode(false);
    }
  }

  async function handleDeleteNode(node: SkillNodeRow) {
    setBusyId(node.id);
    setError(null);
    const removedIds = getDescendantIds(node.id, allNodes);
    removedIds.add(node.id);
    try {
      await deleteSkillNode(node.id);
      setAllNodes((prev) => prev.filter((n) => !removedIds.has(n.id)));
      setAllTools((prev) => prev.filter((t) => !removedIds.has(t.skill_node_id)));
      if (selectedId && removedIds.has(selectedId)) setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReorderNode(node: SkillNodeRow, direction: 'up' | 'down') {
    setBusyId(node.id);
    setError(null);
    try {
      const siblings = getSiblings(node, allNodes);
      const updatedSiblings = await swapSkillNodeOrder(siblings, node.id, direction);
      setAllNodes((prev) => {
        const byId = new Map(updatedSiblings.map((s) => [s.id, s]));
        return prev.map((n) => byId.get(n.id) ?? n);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder.');
    } finally {
      setBusyId(null);
    }
  }

  function openMove(node: SkillNodeRow) {
    setMovingNode(node);
    setMoveModalOpen(true);
  }

  async function handleMoveSubmit(newParentId: string | null) {
    if (!movingNode) return;
    setIsMoving(true);
    setError(null);
    try {
      const updated = await moveSkillNode(movingNode, allNodes, newParentId);
      setAllNodes(updated);
      setMoveModalOpen(false);
      setMovingNode(null);
    } finally {
      setIsMoving(false);
    }
  }

  /* --------------------------- tool CRUD --------------------------- */

  function openAddTool() {
    setToolModalMode('create');
    setEditingTool(null);
    setToolModalOpen(true);
  }

  function openEditTool(tool: SkillToolRow) {
    setToolModalMode('edit');
    setEditingTool(tool);
    setToolModalOpen(true);
  }

  function closeToolModal() {
    if (isSubmittingTool) return;
    setToolModalOpen(false);
    setEditingTool(null);
  }

  async function handleToolSubmit(values: ToolFormValues) {
    if (!selectedNode) return;
    setIsSubmittingTool(true);
    try {
      const payload = {
        name: values.name,
        icon: values.icon || null,
        rating: values.rating.trim() === '' ? null : Number(values.rating),
        notes: values.notes || null,
        sort_order: values.sort_order,
      };

      if (toolModalMode === 'create') {
        const created = await createSkillTool({ ...payload, skill_node_id: selectedNode.id });
        setAllTools((prev) => [...prev, created]);
      } else if (editingTool) {
        const updated = await updateSkillTool(editingTool.id, payload);
        setAllTools((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      }
      setToolModalOpen(false);
      setEditingTool(null);
    } finally {
      setIsSubmittingTool(false);
    }
  }

  async function handleDeleteTool(tool: SkillToolRow) {
    setToolBusyId(tool.id);
    try {
      await deleteSkillTool(tool.id);
      setAllTools((prev) => prev.filter((t) => t.id !== tool.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tool.');
    } finally {
      setToolBusyId(null);
    }
  }

  async function handleReorderTool(tool: SkillToolRow, direction: 'up' | 'down') {
    setToolBusyId(tool.id);
    try {
      const siblings = allTools.filter((t) => t.skill_node_id === tool.skill_node_id);
      const updated = await swapSkillToolOrder(siblings, tool.id, direction);
      setAllTools((prev) => {
        const byId = new Map(updated.map((t) => [t.id, t]));
        return prev.map((t) => byId.get(t.id) ?? t);
      });
    } finally {
      setToolBusyId(null);
    }
  }

  /* ------------------------------ render ------------------------------ */

  if (isLoading) {
    return <Card padding="md"><div className="skx-loading">Loading skills…</div></Card>;
  }

  return (
    <Card padding="md">
      {error && <div className="skx-alert">{error}</div>}

      <div className="skx-toolbar">
        <div className="skx-search">
          <Search size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills…"
          />
        </div>
        <select
          className="skx-level-filter"
          value={levelFilter === 'all' ? 'all' : String(levelFilter)}
          onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        >
          <option value="all">All levels</option>
          {availableLevels.map((lvl) => (
            <option key={lvl} value={lvl}>Level {lvl}</option>
          ))}
        </select>
        <Button variant="primary" onClick={openCreateRoot}>
          <Plus size={14} style={{ marginRight: 6 }} />
          Add root skill
        </Button>
      </div>

      <div className="skx-layout">
        <div>
          {displayRoots.length === 0 ? (
            <div className="skx-empty-inline">
              {allNodes.length === 0
                ? 'No skills yet — add your first root-level category.'
                : 'No skills match this search or filter.'}
            </div>
          ) : (
            <SkillTree
              roots={displayRoots}
              allNodes={allNodes}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
              forceExpand={searchLower.length > 0}
              busyId={busyId}
              onSelect={(n) => setSelectedId(n.id)}
              onAddChild={openAddChild}
              onEdit={openEditNode}
              onMove={openMove}
              onDelete={handleDeleteNode}
              onReorder={handleReorderNode}
            />
          )}
        </div>

        <div className="skx-detail">
          {!selectedNode ? (
            <div className="skx-detail__empty">Select a skill to view and edit its details.</div>
          ) : (
            <div>
              <div className="skx-detail__header">
                <div>
                  <div className="skx-detail__title">
                    <span>{selectedNode.icon || '•'}</span>
                    {selectedNode.name}
                  </div>
                  <div className="skx-detail__breadcrumb">{breadcrumbFor(selectedNode, allNodes)}</div>
                </div>
                <div className="skx-detail__actions">
                  <Button variant="secondary" size="sm" onClick={() => openEditNode(selectedNode)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => openMove(selectedNode)}>Move</Button>
                </div>
              </div>

              <div className="skx-share-preview">
                <span>Rating {selectedNode.rating ?? '—'}</span>
                <span className="skx-share-preview__bar">
                  <span className="skx-share-preview__fill" style={{ width: `${Math.min(100, selectedShare)}%` }} />
                </span>
                <span>~{Math.round(selectedShare)}% of parent</span>
              </div>

              {selectedNode.description && (
                <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>
                  {selectedNode.description}
                </p>
              )}

              {selectedNode.notes && (
                <p style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                  Notes: {selectedNode.notes}
                </p>
              )}

              {!selectedNode.is_active && (
                <p style={{ marginTop: 8, fontSize: '0.78rem', color: '#fca5a5' }}>
                  Inactive — hidden from the 3D explorer.
                </p>
              )}

              <div className="skx-section-title">Tools</div>
              <ToolsPanel
                tools={selectedTools}
                busyId={toolBusyId}
                onAdd={openAddTool}
                onEdit={openEditTool}
                onDelete={handleDeleteTool}
                onReorder={handleReorderTool}
              />
            </div>
          )}
        </div>
      </div>

      <SkillNodeModal
        open={nodeModalOpen}
        mode={nodeModalMode}
        node={editingNode}
        parentLabel={
          nodeModalMode === 'create'
            ? parentLabelFor(createParent?.id ?? null, allNodes)
            : parentLabelFor(editingNode?.parent_id ?? null, allNodes)
        }
        levelLabel={
          nodeModalMode === 'create'
            ? `Level ${createParent ? createParent.level + 1 : 0}`
            : `Level ${editingNode?.level ?? 0}`
        }
        defaultSortOrder={
          nodeModalMode === 'create'
            ? (createParent
                ? allNodes.filter((n) => n.parent_id === createParent.id)
                : allNodes.filter((n) => n.parent_id === null)
              ).reduce((max, n) => Math.max(max, n.sort_order + 1), 0)
            : editingNode?.sort_order ?? 0
        }
        isSubmitting={isSubmittingNode}
        onClose={closeNodeModal}
        onSubmit={handleNodeSubmit}
      />

      <MoveNodeModal
        open={moveModalOpen}
        node={movingNode}
        allNodes={allNodes}
        isSubmitting={isMoving}
        onClose={() => { if (!isMoving) { setMoveModalOpen(false); setMovingNode(null); } }}
        onSubmit={handleMoveSubmit}
      />

      {selectedNode && (
        <ToolModal
          open={toolModalOpen}
          mode={toolModalMode}
          tool={editingTool}
          skillName={selectedNode.name}
          defaultSortOrder={selectedTools.reduce((max, t) => Math.max(max, t.sort_order + 1), 0)}
          isSubmitting={isSubmittingTool}
          onClose={closeToolModal}
          onSubmit={handleToolSubmit}
        />
      )}
    </Card>
  );
}
