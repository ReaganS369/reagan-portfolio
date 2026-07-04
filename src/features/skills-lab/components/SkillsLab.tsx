/** @format */

'use client';

import { motion } from 'motion/react';
import { SkillsLabProvider } from '../SkillsLabContext';
import { SkillsExplorer } from './SkillsExplorer';
import { AvatarStage } from './AvatarStage';
import { DetailPanel } from './DetailPanel';
import '../styles/skills-lab.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function SkillsLab() {
  return (
    <SkillsLabProvider>
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
            Two views. Same data. Click a body part or spin the core —
            every region opens a layer of what I do.
          </p>
        </motion.header>

        <div className="sl__grid">
          <div className="sl__left">
            <SkillsExplorer />
          </div>
          <div className="sl__right">
            <AvatarStage />
          </div>
        </div>

        <DetailPanel />
      </section>
    </SkillsLabProvider>
  );
}
