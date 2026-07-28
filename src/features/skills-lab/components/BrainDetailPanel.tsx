/** @format */

'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { CSSProperties } from 'react';
import type { BrainRegion } from '../data/brainTypes';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function BrainDetailPanel({ region }: { region: BrainRegion | null }) {
  return (
    <AnimatePresence mode="wait">
      {region && (
        <motion.aside
          key={region.id}
          className="sl-panel sl-panel--flat"
          initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: EASE }}
          style={
            region.color ? ({ '--sl-region-color': region.color } as CSSProperties) : undefined
          }
        >
          <header className="sl-panel__head">
            {region.icon && (
              <span className="sl-panel__icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={region.icon} alt="" width={28} height={28} />
              </span>
            )}
            <h3 className="sl-panel__title">{region.title}</h3>
            {region.subtitle && <p className="sl-panel__subtitle">{region.subtitle}</p>}
          </header>

          {region.description && <p className="sl-panel__blurb">{region.description}</p>}
        </motion.aside>
      )}
      {!region && (
        <motion.div
          key="empty"
          className="sl-panel sl-panel--empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p>Click a region of the brain to explore what it represents.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
