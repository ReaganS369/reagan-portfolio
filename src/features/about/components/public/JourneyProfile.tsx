/** @format */

'use client';

import { motion } from 'motion/react';
import type { JourneyMilestone } from '../../constants/journey';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Bars are drawn on a 0–10 track, matching JourneySkill.level. */
const SCALE = 10;

/** Explicit initial/animate rather than variants: this block mounts inside the
 *  chapter card, whose own variants would otherwise drive these children and
 *  replay the row's entrance instead of the reveal. */
const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: EASE, delay },
});

interface JourneyProfileProps {
  milestone: JourneyMilestone;
}

/**
 * Everything below the chapter's year and title, revealed on hover.
 *
 * Deliberately NOT shown here: `detail` and `cta`. The resting card is year +
 * title only and the reveal is meant to stay scannable, so the long-form copy
 * and the call to action are left out of the presentation even though both are
 * still carried in the data for the CMS.
 *
 * Every block is optional — a milestone with no subtitle, skills or tags
 * renders nothing rather than an empty shell.
 */
export function JourneyProfile({ milestone }: JourneyProfileProps) {
  const { subtitle, description, projectCount, skillCategories, tags } =
    milestone;

  const categories = skillCategories.filter((c) => c.skills.length > 0);

  // Stagger runs across ALL bars in the panel, not per category, so the wipe
  // reads as one continuous sweep down the list. Offsets are resolved up front
  // rather than by incrementing a counter mid-render.
  const offsets = categories.reduce<number[]>((acc, _category, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + categories[i - 1].skills.length);
    return acc;
  }, []);

  return (
    <div className="jp">
      {(subtitle || projectCount !== null) && (
        <motion.span className="jp__meta" {...reveal(0.04)}>
          {subtitle}
          {projectCount !== null && (
            <span className="jp__count">{projectCount} projects</span>
          )}
        </motion.span>
      )}

      {description && (
        <motion.p className="jp__desc" {...reveal(0.1)}>
          {description}
        </motion.p>
      )}

      {categories.length > 0 && (
        <motion.div className="jp__grid" {...reveal(0.17)}>
          {categories.map((category, ci) => (
            <div key={category.name} className="jp__cat">
              <span className="jp__cat-name">{category.name}</span>
              <ul className="jp__skills">
                {category.skills.map((skill, si) => {
                  const barIndex = offsets[ci] + si;
                  const pct = Math.max(
                    0,
                    Math.min(100, (skill.level / SCALE) * 100),
                  );
                  return (
                    <li key={skill.name} className="jp__skill">
                      <span className="jp__skill-name">{skill.name}</span>
                      <span
                        className="jp__track"
                        role="img"
                        aria-label={`${skill.name}: ${skill.level} out of ${SCALE}`}
                      >
                        <motion.span
                          className="jp__fill"
                          initial={{ transform: 'scaleX(0)' }}
                          animate={{ transform: 'scaleX(1)' }}
                          transition={{
                            duration: 0.65,
                            ease: EASE,
                            delay: 0.24 + barIndex * 0.055,
                          }}
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </motion.div>
      )}

      {tags.length > 0 && (
        <motion.div className="jp__tags" {...reveal(0.3)}>
          {tags.map((tag) => (
            <span key={tag} className="jp__tag">
              {tag}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
