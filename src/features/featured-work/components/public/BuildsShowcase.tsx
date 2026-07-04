/** @format */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Hammer } from 'lucide-react';
import { getProjects, type Project } from '../../api/projects';
import '../../styles/builds-page.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

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
    return (
      <div className="builds-grid" aria-busy>
        {[0, 1, 2].map((i) => (
          <div key={i} className={`builds-skeleton ${i === 0 ? 'builds-card--feature' : ''}`}>
            <div className="builds-skeleton__visual" />
            <div className="builds-skeleton__lines">
              <span style={{ width: '30%' }} />
              <span style={{ width: '65%' }} />
              <span style={{ width: '90%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error' || projects.length === 0) {
    return (
      <motion.div
        className="builds-empty"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <span className="builds-empty__icon">
          <Hammer size={22} />
        </span>
        <h3 className="builds-empty__title">
          {status === 'error' ? 'The workshop door is stuck' : 'The workshop is heating up'}
        </h3>
        <p className="builds-empty__text">
          {status === 'error'
            ? 'Something went wrong loading projects — try refreshing.'
            : 'Selected work is being prepared for display. Check back soon.'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="builds-grid">
      {projects.map((project, i) => (
        <motion.article
          key={project.id}
          className={`builds-card ${i === 0 ? 'builds-card--feature' : ''}`}
          initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease: EASE }}
        >
          <div className="builds-card__visual">
            {project.image_url ? (
              <img src={project.image_url} alt="" className="builds-card__image" />
            ) : (
              <div className="builds-card__noise" />
            )}
            <span className="builds-card__index">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="builds-card__sheen" aria-hidden />
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
                <span>View project</span>
                <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        </motion.article>
      ))}
    </div>
  );
}
