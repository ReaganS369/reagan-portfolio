/** @format */

import './section-number.css';

interface SectionNumberProps {
  number: string;
  title: string;
}

export function SectionNumber({ number, title }: SectionNumberProps) {
  return (
    <div className="section-eyebrow">
      <span className="section-eyebrow__num">{number}</span>
      <h2 className="section-eyebrow__title">{title}</h2>
    </div>
  );
}
