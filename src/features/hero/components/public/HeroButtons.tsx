/** @format */

'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';


import { PLAY_TRANSFORMATION_EVENT } from './HeroVideoStage';
import '../../styles/buttons.css';

function scrollToSection(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
}

export function HeroButtons() {
  const rowRef = useRef<HTMLDivElement>(null);
  const router = useRouter();


  // Pressing creates a soft light ripple travelling across the face from
  // the exact press point.
  const ripple = (ev: React.PointerEvent<HTMLButtonElement>) => {
    const btn = ev.currentTarget;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'btn-ripple';
    span.style.left = `${ev.clientX - rect.left}px`;
    span.style.top = `${ev.clientY - rect.top}px`;
    btn.appendChild(span);
    span.addEventListener('animationend', () => span.remove(), { once: true });
  };

  const onShowreel = () => {
    // The hero video stage claims this event (preventDefault) when the
    // transformation clip exists; until then, glide straight to Skills.
    const unclaimed = window.dispatchEvent(
      new CustomEvent(PLAY_TRANSFORMATION_EVENT, { cancelable: true }),
    );
    if (unclaimed) scrollToSection('.brain-section');
  };

  return (
    <div className="hero-buttons" ref={rowRef}>
      <div className="btn-3d btn-3d--primary">
        <span className="btn-3d__base btn-3d__base--primary" aria-hidden="true" />
        <button
          className="primary-btn"
          onPointerDown={ripple}
          onClick={() => router.push('/builds')}
        >
          Explore Projects
        </button>
      </div>
      <div className="btn-3d btn-3d--secondary">
        <span className="btn-3d__base btn-3d__base--secondary" aria-hidden="true" />
        <button 
          className="secondary-btn" 
          onPointerDown={ripple} 
          onClick={() => window.open('https://www.youtube.com/@reagans369', '_blank')}
        >
          Watch Showreel
        </button>
      </div>
    </div>
  );
}
