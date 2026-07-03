/** @format */

'use client';

import { useEffect, useState } from 'react';
import { JOURNEY } from '../../constants';
import { getEducation, type Education } from '@/src/features/education/api/education';
import { getExperience, type Experience } from '@/src/features/experience/api/experience';
import '../../styles/origin-page.css';

function formatYear(value: string | null): string {
  if (!value) return 'Present';
  return new Date(value).getFullYear().toString();
}

export function OriginTimeline() {
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);

  useEffect(() => {
    getEducation().then(setEducation).catch(console.error);
    getExperience().then(setExperience).catch(console.error);
  }, []);

  return (
    <div className="origin-container">
      <section className="origin-block">
        <h2 className="origin-block__title">The Timeline</h2>
        <div className="origin-timeline">
          {JOURNEY.map((entry) => (
            <div key={entry.year} className="origin-entry">
              <span className="origin-entry__year">{entry.year}</span>
              <div className="origin-entry__body">
                <div className="origin-entry__heading">
                  <h3 className="origin-entry__title">{entry.title}</h3>
                  {entry.projects !== null && (
                    <span className="origin-entry__count">{entry.projects} projects</span>
                  )}
                </div>
                <p className="origin-entry__summary">{entry.summary}</p>
                <p className="origin-entry__detail">{entry.detail}</p>
                <div className="origin-entry__tech">
                  {entry.tech.map((tag) => (
                    <span key={tag} className="origin-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {experience.length > 0 && (
        <section className="origin-block">
          <h2 className="origin-block__title">Experience</h2>
          <div className="origin-list">
            {experience.map((item) => (
              <div key={item.id} className="origin-list__item">
                <div className="origin-list__heading">
                  <h3>{item.position}</h3>
                  <span className="origin-list__dates">
                    {formatYear(item.start_date)} — {item.current ? 'Present' : formatYear(item.end_date)}
                  </span>
                </div>
                <p className="origin-list__sub">{item.company}</p>
                {item.description && <p className="origin-list__desc">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="origin-block">
          <h2 className="origin-block__title">Education</h2>
          <div className="origin-list">
            {education.map((item) => (
              <div key={item.id} className="origin-list__item">
                <div className="origin-list__heading">
                  <h3>{item.degree}</h3>
                  <span className="origin-list__dates">
                    {item.start_year ?? ''}
                    {item.start_year && item.end_year ? ' — ' : ''}
                    {item.end_year ?? ''}
                  </span>
                </div>
                <p className="origin-list__sub">
                  {item.institution} · {item.field}
                </p>
                {item.description && <p className="origin-list__desc">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
