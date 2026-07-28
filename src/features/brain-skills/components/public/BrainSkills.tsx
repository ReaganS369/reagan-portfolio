/** @format */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import { getAllSkillNodes } from '@/src/features/skills/api/skillNodes';
import { getAllSkillTools } from '@/src/features/skills/api/skillTools';
import { buildSkillTree, type SkillTreeNode } from '@/src/features/skills/lib/tree';
import {
  BRAIN_OUTLINE_D,
  BRAIN_REGIONS,
  BRAIN_VIEWBOX,
} from '../../data/brainRegions';
import { allocateRegions } from '../../lib/allocateRegions';
import '../../styles/brain-skills.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface Tool {
  id: string;
  name: string;
  icon: string | null;
  rating: number | null;
}

/**
 * The brain is a view onto the `skill_nodes` tree (the same tree the /stats
 * explorer renders, edited in nngtw-admin). Nothing about the hierarchy lives
 * in this file: the top level's children claim the hemispheres, and drilling
 * into one re-projects *its* children across the whole brain. How much of the
 * brain a skill occupies is derived from its rating, never hand-entered.
 */
export function BrainSkills() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const [roots, setRoots] = useState<SkillTreeNode[] | null>(null);
  const [toolsByNode, setToolsByNode] = useState<Map<string, Tool[]>>(new Map());
  const [trail, setTrail] = useState<SkillTreeNode[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAllSkillNodes(), getAllSkillTools()])
      .then(([nodes, tools]) => {
        if (cancelled) return;
        const map = new Map<string, Tool[]>();
        for (const t of tools) {
          const list = map.get(t.skill_node_id) ?? [];
          list.push({ id: t.id, name: t.name, icon: t.icon, rating: t.rating });
          map.set(t.skill_node_id, list);
        }
        setToolsByNode(map);
        setRoots(buildSkillTree(nodes.filter((n) => n.is_active)));
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setRoots([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const parent = trail.length > 0 ? trail[trail.length - 1] : null;
  const level = useMemo(() => {
    const list = parent ? parent.children : (roots ?? []);
    return list.filter((n) => n.is_active);
  }, [parent, roots]);

  const alloc = useMemo(() => allocateRegions(level), [level]);

  const selected = level.find((n) => n.id === selectedId) ?? null;
  const focusId = hovered ?? selectedId;

  const open = (node: SkillTreeNode) => {
    const kids = node.children.filter((c) => c.is_active);
    if (kids.length > 0) {
      setTrail((t) => [...t, node]);
      setSelectedId(null);
      setHovered(null);
    } else {
      setSelectedId((prev) => (prev === node.id ? null : node.id));
    }
  };

  const goTo = (depth: number) => {
    setTrail((t) => t.slice(0, depth));
    setSelectedId(null);
    setHovered(null);
  };

  const hint = roots === null
    ? 'Loading the map…'
    : level.length === 0
      ? 'No skills published yet'
      : parent
        ? `Inside ${parent.name} — click a region to go deeper`
        : 'Click a region of the brain to explore';

  return (
    <section className="brain-section" ref={ref} aria-labelledby="skills-heading">
      <h2 id="skills-heading" className="sr-only">
        Technical Skills and Software Expertise
      </h2>
      <div className="section-heading-wrapper">
        <div className="heading-container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <SectionNumber number="03" title="How I Think" />
          </motion.div>
        </div>
      </div>

      <div className="brain-container">
        {/* Breadcrumb trail */}
        <motion.nav
          className="brain-trail"
          aria-label="Skill map breadcrumb"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <button
            type="button"
            className="brain-trail__crumb"
            onClick={() => goTo(0)}
            disabled={trail.length === 0}
          >
            Mind
          </button>
          {trail.map((node, i) => (
            <span key={node.id} className="brain-trail__step">
              <span className="brain-trail__sep" aria-hidden="true">
                /
              </span>
              <button
                type="button"
                className="brain-trail__crumb"
                onClick={() => goTo(i + 1)}
                disabled={i === trail.length - 1}
              >
                {node.name}
              </button>
            </span>
          ))}
        </motion.nav>

        <motion.p
          className="brain-hint"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {hint}
        </motion.p>

        <div className="brain-layout">
          {/* ---------------- Brain ---------------- */}
          <motion.div
            className="brain-stage"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.9, ease: EASE }}
          >
            <svg
              className="brain-svg"
              viewBox={BRAIN_VIEWBOX}
              xmlns="http://www.w3.org/2000/svg"
              role="group"
              aria-label="Interactive brain map of skills"
            >
              {/* Every lobe is the same amber; only the focused one changes. The
                  rest are left exactly as they are — no dimming. */}
              {BRAIN_REGIONS.map((region) => {
                const owner = alloc.ownerByRegion.get(region.id);
                const isFocus = owner ? owner.id === focusId : false;

                return (
                  <path
                    key={region.id}
                    d={region.d}
                    className={`brain-lobe${isFocus ? ' brain-lobe--focus' : ''}`}
                    tabIndex={owner ? 0 : -1}
                    role={owner ? 'button' : undefined}
                    aria-label={owner ? owner.name : undefined}
                    onMouseEnter={() => owner && setHovered(owner.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => owner && setHovered(owner.id)}
                    onBlur={() => setHovered(null)}
                    onClick={() => owner && open(owner)}
                    onKeyDown={(e) => {
                      if (owner && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        open(owner);
                      }
                    }}
                  />
                );
              })}

              {/* Contour linework, painted over the lobes */}
              <path className="brain-outline" d={BRAIN_OUTLINE_D} />
            </svg>
          </motion.div>

          {/* ---------------- Region list ---------------- */}
          <motion.div
            className="brain-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55, duration: 0.8, ease: EASE }}
          >
            {trail.length > 0 && (
              <button
                type="button"
                className="brain-back"
                onClick={() => goTo(trail.length - 1)}
              >
                ← Back to {trail.length > 1 ? trail[trail.length - 2].name : 'Mind'}
              </button>
            )}

            <ul className="brain-list">
              <AnimatePresence mode="popLayout">
                {level.map((node, i) => {
                  const share = alloc.shareByNode.get(node.id) ?? 0;
                  const kids = node.children.filter((c) => c.is_active);
                  const isFocus = node.id === focusId;

                  return (
                    <motion.li
                      key={node.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.35, ease: EASE, delay: i * 0.04 }}
                    >
                      <button
                        type="button"
                        className={`brain-row${isFocus ? ' brain-row--focus' : ''}${
                          share === 0 ? ' brain-row--overflow' : ''
                        }`}
                        onMouseEnter={() => setHovered(node.id)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(node.id)}
                        onBlur={() => setHovered(null)}
                        onClick={() => open(node)}
                      >
                        <span className="brain-row__dot" />
                        <span className="brain-row__name">{node.name}</span>
                        <span className="brain-row__share">
                          {share > 0 ? `${Math.round(share * 100)}%` : '—'}
                        </span>
                        <span className="brain-row__go" aria-hidden="true">
                          {kids.length > 0 ? '→' : ''}
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            {alloc.overflow.length > 0 && (
              <p className="brain-note">
                {alloc.overflow.length} skill
                {alloc.overflow.length === 1 ? '' : 's'} below the top eight share
                the list but not the map.
              </p>
            )}

            {/* Leaf detail */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  key={selected.id}
                  className="brain-detail"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <h3 className="brain-detail__name">{selected.name}</h3>
                  {selected.rating !== null && (
                    <p className="brain-detail__rating">{selected.rating} / 5</p>
                  )}
                  {selected.description && (
                    <p className="brain-detail__body">{selected.description}</p>
                  )}
                  {(toolsByNode.get(selected.id) ?? []).length > 0 && (
                    <ul className="brain-detail__tools">
                      {toolsByNode.get(selected.id)!.map((tool) => (
                        <li key={tool.id} className="brain-detail__tool">
                          {tool.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <p className="brain-credit">
          <a
            href="https://iconscout.com/icons/brain"
            target="_blank"
            rel="noopener noreferrer"
          >
            Brain
          </a>{' '}
          by{' '}
          <a
            href="https://iconscout.com/contributors/icon-click"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vector Place
          </a>{' '}
          on{' '}
          <a href="https://iconscout.com" target="_blank" rel="noopener noreferrer">
            IconScout
          </a>
        </p>
      </div>
    </section>
  );
}
