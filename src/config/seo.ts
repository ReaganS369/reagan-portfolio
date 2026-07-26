export const SEO_CONFIG = {
  baseUrl: 'https://reagan.nngtw.com',
  title: 'Reagan Sagolsem | Technical Artist, Game Developer & XR Creator',
  description:
    'Portfolio of Reagan Sagolsem, Technical 3D Artist and Game Developer from Manipur. Founder of NNGTW Studio, specializing in XR, real-time rendering, and procedural pipelines.',
  keywords: [
    'Reagan Sagolsem',
    'Reagan designer',
    'Reagan technical artist',
    'Reagan technical 3D artist',
    'Reagan game developer',
    'Reagan animation',
    'Reagan XR',
    'Reagan Manipur',
    'Reagan NNGTW',
    'Reagan portfolio',
    'Reagan resume',
  ],
  author: {
    name: 'Reagan Sagolsem',
    url: 'https://reagan.nngtw.com',
  },
  social: {
    twitter: '@ReaganSagolsem',
  },
};

export const PERSON_SCHEMA = {
  '@type': 'Person',
  '@id': `${SEO_CONFIG.baseUrl}/#person`,
  name: 'Reagan Sagolsem',
  jobTitle: ['Technical 3D Artist', 'Game Developer', 'XR Explorer'],
  url: SEO_CONFIG.baseUrl,
  image: `${SEO_CONFIG.baseUrl}/favicon.svg`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Manipur',
    addressCountry: 'IN',
  },
  worksFor: {
    '@id': `${SEO_CONFIG.baseUrl}/#organization`,
  },
  sameAs: [
    'https://nngtw.com',
    'https://linkedin.com/in/reagansagolsem', // Replace with actual
    'https://github.com/ReaganS369',
    'https://www.imdb.com/name/nm0000000', // Replace with actual
    'https://instagram.com/reagansagolsem', // Replace with actual
    'https://youtube.com/@reagansagolsem', // Replace with actual
    'https://x.com/ReaganSagolsem', // Replace with actual
  ],
};

export const ORGANIZATION_SCHEMA = {
  '@type': 'Organization',
  '@id': `${SEO_CONFIG.baseUrl}/#organization`,
  name: 'NNGTW Studio',
  url: 'https://nngtw.com',
  founder: {
    '@id': `${SEO_CONFIG.baseUrl}/#person`,
  },
};

export const WEBSITE_SCHEMA = {
  '@type': 'WebSite',
  '@id': `${SEO_CONFIG.baseUrl}/#website`,
  url: SEO_CONFIG.baseUrl,
  name: 'Reagan Sagolsem Portfolio',
  publisher: {
    '@id': `${SEO_CONFIG.baseUrl}/#person`,
  },
};
