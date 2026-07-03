/** @format */

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import './page-intro.css';

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <header className="page-intro">
      <Link href="/" className="page-intro__back">
        <ArrowLeft size={16} />
        <span>Back home</span>
      </Link>
      <span className="page-intro__eyebrow">{eyebrow}</span>
      <h1 className="page-intro__title">{title}</h1>
      {description && <p className="page-intro__description">{description}</p>}
    </header>
  );
}
