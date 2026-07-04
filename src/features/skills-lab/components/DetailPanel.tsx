/** @format */

'use client';

import { motion, AnimatePresence } from 'motion/react';
import { getRegion, resolvePath } from '../data/skillsData';
import type { SkillNode } from '../data/skillsData';
import { useSkillsLab } from '../SkillsLabContext';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function DetailPanel() {
  const { region, path, pushNode, popTo, focusRegion, reset } = useSkillsLab();

  const activeRegion = region ? getRegion(region) : null;
  const chain = activeRegion ? resolvePath(activeRegion, path) : [];
  const current: SkillNode | null = chain[chain.length - 1] ?? null;
  const open = !!activeRegion && !!current;

  return (
    <AnimatePresence>
      {open && activeRegion && current && (
        <motion.aside
          className="sl-panel"
          initial={{ opacity: 0, x: 60, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 60, filter: 'blur(8px)' }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {/* breadcrumb */}
          <nav className="sl-panel__crumbs" aria-label="Skill path">
            <button className="sl-panel__crumb" onClick={reset}>
              Avatar
            </button>
            <span className="sl-panel__crumb-sep">/</span>
            <button
              className="sl-panel__crumb"
              onClick={() => focusRegion(activeRegion.id, [])}
            >
              {activeRegion.label}
            </button>
            {chain.map((n, i) => (
              <span key={n.id} className="sl-panel__crumb-group">
                <span className="sl-panel__crumb-sep">/</span>
                <button
                  className={`sl-panel__crumb ${
                    i === chain.length - 1 ? 'sl-panel__crumb--current' : ''
                  }`}
                  onClick={() => popTo(i + 1)}
                >
                  {n.label}
                </button>
              </span>
            ))}
          </nav>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className="sl-panel__body"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <header className="sl-panel__head">
                <h3 className="sl-panel__title">{current.label}</h3>
                <div className="sl-panel__meter" aria-label={`Proficiency ${current.weight} of 10`}>
                  <motion.span
                    className="sl-panel__meter-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${current.weight * 10}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                  />
                </div>
              </header>

              {current.blurb && <p className="sl-panel__blurb">{current.blurb}</p>}

              {current.examples && current.examples.length > 0 && (
                <div className="sl-panel__examples">
                  <span className="sl-panel__section-label">Examples</span>
                  <ul>
                    {current.examples.map((ex) => (
                      <li key={ex}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}

              {current.children && current.children.length > 0 && (
                <div className="sl-panel__children">
                  <span className="sl-panel__section-label">Go deeper</span>
                  <div className="sl-panel__chips">
                    {current.children.map((child, i) => (
                      <motion.button
                        key={child.id}
                        className="sl-chip"
                        style={{ fontSize: `${0.7 + child.weight * 0.02}rem` }}
                        onClick={() => pushNode(child.id)}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.15 + i * 0.05, ease: EASE }}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {child.label}
                        <span className="sl-chip__weight">{child.weight}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {chain.length > 1 && (
                <button className="sl-panel__back" onClick={() => popTo(chain.length - 1)}>
                  ← Back to {chain[chain.length - 2].label}
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
