/** @format */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { BrainDetailPanel } from './BrainDetailPanel';
import { getActiveBrainModelUrl, getBrainRegions } from '../data/brainRegions';
import type { BrainRegion } from '../data/brainTypes';
import '../styles/skills-lab.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// The GLB and the whole three.js/R3F stack only load once this component
// mounts on the client — never in the SSR bundle.
const BrainScene = dynamic(() => import('./BrainScene').then((m) => m.BrainScene), {
  ssr: false,
});

export function SkillsLab() {
  const [regions, setRegions] = useState<BrainRegion[]>([]);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selected, setSelected] = useState<BrainRegion | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getBrainRegions(), getActiveBrainModelUrl()])
      .then(([loadedRegions, url]) => {
        if (cancelled) return;
        setRegions(loadedRegions);
        setModelUrl(url);
        setStatus('ready');
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="sl" aria-label="Interactive skills exhibit">
      <motion.header
        className="sl__intro"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <span className="sl__eyebrow">Exhibit 01 — The Operator</span>
        <h1 className="sl__title">Explore the mind</h1>
        <p className="sl__sub">
          Every region of the brain is a piece of what I do — hover to see what it holds,
          click to step inside it.
        </p>
      </motion.header>

      <div className="sl__grid">
        <div className="sl__left sl-brain">
          {status === 'ready' && modelUrl && (
            <BrainScene
              modelUrl={modelUrl}
              regions={regions}
              selectedMeshName={selected?.meshName ?? null}
              onSelectRegion={setSelected}
            />
          )}

          <AnimatePresence>
            {status !== 'ready' && (
              <motion.div
                className={`sl-brain__status${status === 'error' ? ' sl-brain__status--error' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {status === 'loading' ? (
                  <>
                    <span className="sl-brain__status-dot" />
                    Loading the mind…
                  </>
                ) : (
                  "Couldn't load the brain."
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        <div className="sl__right">
          <BrainDetailPanel region={selected} />
        </div>
      </div>
    </section>
  );
}
