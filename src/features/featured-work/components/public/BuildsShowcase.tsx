/** @format */

'use client';

import { useEffect, useState } from 'react';
import { getProjects, type Project } from '../../api/projects';
import '../../styles/builds-page.css';

export function BuildsShowcase() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    getProjects()
      .then((data) => {
        setProjects(data);
        setStatus('ready');
      })
      .catch((err) => {
        console.error(err);
        setStatus('error');
      });
  }, []);

  if (status === 'loading') {
    return <p className="builds-status">Loading projects…</p>;
  }

  if (status === 'error') {
    return <p className="builds-status">Something went wrong loading projects.</p>;
  }

  if (projects.length === 0) {
    return <p className="builds-status">Projects coming soon.</p>;
  }

  return (
    <div className="builds-grid">
      {projects.map((project) => (
        <article key={project.id} className="builds-card">
          <div className="builds-card__visual">
            {project.image_url ? (
              <img src={project.image_url} alt="" className="builds-card__image" />
            ) : (
              <div className="builds-card__noise" />
            )}
          </div>
          <div className="builds-card__body">
            <span className="builds-card__category">{project.category}</span>
            <h3 className="builds-card__title">{project.title}</h3>
            <p className="builds-card__description">{project.description}</p>
            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noreferrer"
                className="builds-card__link"
              >
                View project →
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
