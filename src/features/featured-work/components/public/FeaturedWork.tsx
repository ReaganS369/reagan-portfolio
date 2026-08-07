/** @format */

'use client';

import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import { usePointerLight } from '@/src/components/effects/usePointerLight';
import { 
  Gamepad2, 
  Smartphone, 
  Sparkles, 
  Palette, 
  LayoutGrid, 
  Image as ImageIcon, 
  Clapperboard,
  User,
  Trees,
  WandSparkles,
  Play,
  Workflow,
  Link,
  Code2,
  PenTool
} from 'lucide-react';
import '../../styles/featured-work.css';

import { SEO_CONFIG, PERSON_SCHEMA } from '@/src/config/seo';

const CARDS = [
  {
    key: 'game',
    category: 'GAME DEVELOPMENT',
    title: 'Every World Begins Here',
    description:
      'Building immersive games from concept to launch—combining gameplay systems, AI, multiplayer, environments, technical art, and cinematic storytelling.',
    hoverHeading: 'Core Skills',
    hoverItems: [
      { label: 'Unreal Engine 5', icon: Gamepad2 },
      { label: 'Unity', icon: Gamepad2 },
      { label: 'C++', icon: Code2 },
      { label: 'C#', icon: Code2 },
      { label: 'Narrative Design', icon: PenTool },
    ],
    carouselItems: ['Arithmetic Destination', 'King Summon'],
    className: 'bento-card bento-card--game',
    schemaType: 'VideoGame',
    dateCreated: '2025',
    softwareRequirements: 'Unreal Engine 5, Unity',
    programmingLanguage: 'C++, C#',
  },
  {
    key: '3d',
    category: 'TECHNICAL 3D ART',
    title: 'Engineering Imagination',
    description:
      'Producing production-ready 3D assets, procedural systems, shaders, rigging, cinematic animation, and optimized pipelines for games and interactive experiences.',
    hoverHeading: 'Specializations',
    hoverItems: [
      { label: 'Character Creation', icon: User },
      { label: 'Environment Art', icon: Trees },
      { label: 'Materials & Shaders', icon: WandSparkles },
      { label: 'Rigging', icon: Link },
      { label: 'Animation', icon: Play },
      { label: 'Procedural Systems', icon: Workflow },
    ],
    className: 'bento-card bento-card--3d',
    schemaType: 'VisualArtwork',
    dateCreated: '2026',
    softwareRequirements: 'Houdini, Blender, Substance Designer',
  },
  {
    key: 'xr',
    category: 'XR & APP DEVELOPMENT',
    title: 'Beyond Traditional Interfaces',
    description:
      'Designing intelligent web, mobile, AI, and immersive applications with a focus on performance, usability, and beautiful user experiences.',
    hoverHeading: 'Core Skills',
    hoverItems: [
      { label: 'React Native', icon: Smartphone },
      { label: 'Next.js 15', icon: LayoutGrid },
      { label: 'WebGL', icon: Sparkles },
      { label: 'TypeScript', icon: Code2 },
      { label: 'GLSL', icon: WandSparkles },
    ],
    carouselItems: ['SanaEase', 'AeiMate', 'Richingness', 'NngTest', 'WithEye', '20:20:20 Reminder'],
    className: 'bento-card bento-card--ui',
    schemaType: 'SoftwareApplication',
    dateCreated: '2025',
    softwareRequirements: 'React Native, Next.js 15, WebGL',
    programmingLanguage: 'TypeScript, GLSL',
  },
  {
    key: 'design',
    category: 'GRAPHIC DESIGN',
    title: 'Design With Purpose',
    description:
      'Creating memorable visual identities, user interfaces, marketing graphics, icons, illustrations, and digital experiences with clarity and precision.',
    hoverHeading: 'Core Skills',
    hoverItems: [
      { label: 'Branding', icon: Palette },
      { label: 'UI / UX', icon: LayoutGrid },
      { label: 'Motion Graphics', icon: Clapperboard },
      { label: 'Photoshop', icon: ImageIcon },
      { label: 'Sketchbook Pro', icon: PenTool },
    ],
    carouselItems: ['Icons', 'Game Assets'],
    className: 'bento-card bento-card--design',
    schemaType: 'VisualArtwork',
    dateCreated: '2024',
  },
];

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const chipContainer = {
  hidden: {},
  hover: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } }, // 0.3s delay waits for the description to start expanding
};

const chipAnim = {
  hidden: { opacity: 0, y: 8 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

function ProjectCarousel({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <div className="project-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="project-carousel__text"
        >
          {items[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Cards emerge from darkness: unlit and low, then rise as the light comes up
const cardAnim = {
  hidden: { opacity: 0, y: 48, filter: 'brightness(0.3)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'brightness(1)',
    transition: { duration: 0.9, ease: EASE },
  },
};

export function FeaturedWork() {
  const ref = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  // Cursor light across the bento: interior highlight and rim glow brighten,
  // shadows deepen, and each card's visual layer drifts a few px in parallax.
  usePointerLight(ref, {
    targets: '.bento-card',
    radius: 340,
    parallaxX: 10,
    parallaxY: 8,
  });

  // The section paints a black cover ABOVE the fixed scroll-avatar with a
  // window cut out over the 3D card, so the character shows only inside the
  // card. Measure the card's layout rect (transform-agnostic offset chain)
  // relative to the section and expose it as CSS vars for the cover strips
  // and the behind-character hole background.
  useLayoutEffect(() => {
    const section = ref.current;
    const card = cardRef.current;
    if (!section || !card) return;

    const measure = () => {
      let top = 0;
      let left = 0;
      let el: HTMLElement | null = card;
      while (el && el !== section) {
        top += el.offsetTop;
        left += el.offsetLeft;
        el = el.offsetParent as HTMLElement | null;
      }
      section.style.setProperty('--fw-hole-top', `${top}px`);
      section.style.setProperty('--fw-hole-left', `${left}px`);
      section.style.setProperty('--fw-hole-w', `${card.offsetWidth}px`);
      section.style.setProperty('--fw-hole-h', `${card.offsetHeight}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(card);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section className="featured-section" ref={ref} aria-labelledby="featured-work-heading">
      <h2 id="featured-work-heading" className="sr-only">Featured Technical Art and Game Development Projects</h2>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: CARDS.map((card, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': card.schemaType,
                name: card.title,
                description: card.description,
                genre: card.category,
                dateCreated: card.dateCreated,
                softwareRequirements: card.softwareRequirements,
                programmingLanguage: card.programmingLanguage,
                url: SEO_CONFIG.baseUrl,
                creator: { '@id': PERSON_SCHEMA['@id'] }
              }
            }))
          })
        }}
      />
      {/* Layer B — sits BEHIND the fixed character, only in the card window:
          dark base + pink glow the character stands against */}
      <div className="featured-hole-bg" aria-hidden="true">
        <div className="featured-hole-glow" />
      </div>

      {/* Layer A — black cover ABOVE the character everywhere except the
          card window (4 strips framing the hole) */}
      <div className="featured-cover featured-cover--top" aria-hidden="true" />
      <div className="featured-cover featured-cover--left" aria-hidden="true" />
      <div className="featured-cover featured-cover--right" aria-hidden="true" />
      <div className="featured-cover featured-cover--bottom" aria-hidden="true" />

      <div className="featured-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionNumber number="01" title="Where Ideas Become Reality" />
        </motion.div>

        <motion.div
          className="bento-grid"
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
        >
          {/* Game — large top-left card */}
          <motion.div className={CARDS[0].className} variants={cardAnim} whileHover="hover">
            <div className="bento-visual bento-visual--game">
              <ProjectCarousel items={CARDS[0].carouselItems || []} />
              <div className="bento-carousel">
                <div className="bento-carousel__slot slot-a" />
                <div className="bento-carousel__slot slot-b" />
                <div className="bento-carousel__slot slot-c" />
              </div>
              <div className="bento-noise" />
            </div>
            <div className="bento-body">
              <span className="bento-category">{CARDS[0].category}</span>
              <h3 className="bento-title">{CARDS[0].title}</h3>
              <p className="bento-desc">{CARDS[0].description}</p>
              
              <div className="bento-hover-content">
                <span className="bento-hover-heading">{CARDS[0].hoverHeading}</span>
                <motion.div 
                  className="bento-chip-list"
                  variants={chipContainer}
                >
                  {CARDS[0].hoverItems?.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div key={i} className="bento-chip" variants={chipAnim}>
                        <Icon size={14} className="bento-chip-icon" />
                        <span>{item.label}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* 3D Modeling — tall right card; transparent window: the fixed
              scroll avatar docks behind it and shows through, standing on the
              section's hole background (glow) while the black cover hides it
              everywhere else */}
          <motion.div
            ref={cardRef}
            className={CARDS[1].className}
            variants={cardAnim}
            whileHover="hover"
          >
            <div className="bento-visual bento-visual--3d">
              <div className="bento-noise" />
            </div>
            <div className="bento-body">
              <span className="bento-category">{CARDS[1].category}</span>
              <h3 className="bento-title">{CARDS[1].title}</h3>
              <p className="bento-desc">{CARDS[1].description}</p>
              
              <div className="bento-hover-content">
                <span className="bento-hover-heading">{CARDS[1].hoverHeading}</span>
                <motion.div 
                  className="bento-chip-list"
                  variants={chipContainer}
                >
                  {CARDS[1].hoverItems?.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div key={i} className="bento-chip" variants={chipAnim}>
                        <Icon size={14} className="bento-chip-icon" />
                        <span>{item.label}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* UI / App */}
          <motion.div className={CARDS[2].className} variants={cardAnim} whileHover="hover">
            <div className="bento-visual bento-visual--ui">
              <ProjectCarousel items={CARDS[2].carouselItems || []} />
              <div className="bento-noise" />
            </div>
            <div className="bento-body">
              <span className="bento-category">{CARDS[2].category}</span>
              <h3 className="bento-title">{CARDS[2].title}</h3>
              <p className="bento-desc">{CARDS[2].description}</p>
              
              <div className="bento-hover-content">
                <span className="bento-hover-heading">{CARDS[2].hoverHeading}</span>
                <motion.div 
                  className="bento-chip-list"
                  variants={chipContainer}
                >
                  {CARDS[2].hoverItems?.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div key={i} className="bento-chip" variants={chipAnim}>
                        <Icon size={14} className="bento-chip-icon" />
                        <span>{item.label}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Graphic Design */}
          <motion.div className={CARDS[3].className} variants={cardAnim} whileHover="hover">
            <div className="bento-visual bento-visual--design">
              <ProjectCarousel items={CARDS[3].carouselItems || []} />
              <div className="bento-noise" />
            </div>
            <div className="bento-body">
              <span className="bento-category">{CARDS[3].category}</span>
              <h3 className="bento-title">{CARDS[3].title}</h3>
              <p className="bento-desc">{CARDS[3].description}</p>
              
              <div className="bento-hover-content">
                <span className="bento-hover-heading">{CARDS[3].hoverHeading}</span>
                <motion.div 
                  className="bento-chip-list"
                  variants={chipContainer}
                >
                  {CARDS[3].hoverItems?.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div key={i} className="bento-chip" variants={chipAnim}>
                        <Icon size={14} className="bento-chip-icon" />
                        <span>{item.label}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
