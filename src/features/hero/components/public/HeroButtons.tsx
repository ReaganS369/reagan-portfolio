/** @format */

import '../../styles/buttons.css';

export function HeroButtons() {
  return (
    <div className="hero-buttons">
      <div className="btn-3d btn-3d--primary">
        <span className="btn-3d__base btn-3d__base--primary" aria-hidden="true" />
        <button className="primary-btn">Explore Projects</button>
      </div>
      <div className="btn-3d btn-3d--secondary">
        <span className="btn-3d__base btn-3d__base--secondary" aria-hidden="true" />
        <button className="secondary-btn">Watch Showreel</button>
      </div>
    </div>
  );
}
