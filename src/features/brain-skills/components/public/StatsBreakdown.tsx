/** @format */

'use client';

import { DESIGN_SKILLS, DEV_SKILLS } from '../../constants';
import '../../styles/stats-page.css';

function groupByRing(skills: { name: string; ring: number }[]) {
  return {
    core: skills.filter((s) => s.ring === 1),
    secondary: skills.filter((s) => s.ring === 2),
  };
}

export function StatsBreakdown() {
  const design = groupByRing(DESIGN_SKILLS);
  const dev = groupByRing(DEV_SKILLS);

  return (
    <div className="stats-container">
      <section className="stats-block">
        <h2 className="stats-block__title stats-block__title--design">Design &amp; Art</h2>
        <div className="stats-group">
          <span className="stats-group__label">Core</span>
          <div className="stats-chips">
            {design.core.map((s) => (
              <span key={s.name} className="stats-chip stats-chip--design">
                {s.name}
              </span>
            ))}
          </div>
        </div>
        <div className="stats-group">
          <span className="stats-group__label">Secondary</span>
          <div className="stats-chips">
            {design.secondary.map((s) => (
              <span key={s.name} className="stats-chip stats-chip--design">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-block">
        <h2 className="stats-block__title stats-block__title--dev">Development &amp; Engineering</h2>
        <div className="stats-group">
          <span className="stats-group__label">Core</span>
          <div className="stats-chips">
            {dev.core.map((s) => (
              <span key={s.name} className="stats-chip stats-chip--dev">
                {s.name}
              </span>
            ))}
          </div>
        </div>
        <div className="stats-group">
          <span className="stats-group__label">Secondary</span>
          <div className="stats-chips">
            {dev.secondary.map((s) => (
              <span key={s.name} className="stats-chip stats-chip--dev">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
