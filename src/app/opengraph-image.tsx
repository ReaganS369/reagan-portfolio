import { ImageResponse } from 'next/og';
import { SEO_CONFIG } from '@/src/config/seo';

export const runtime = 'edge';

export const alt = SEO_CONFIG.title;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 80,
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 900, textTransform: 'uppercase', marginBottom: 24 }}>
          {SEO_CONFIG.author.name}
        </div>
        <div style={{ fontSize: 42, color: '#a3a3a3' }}>
          Technical 3D Artist • Game Developer • XR Explorer
        </div>
        <div style={{ fontSize: 32, color: '#525252', marginTop: 40 }}>
          {SEO_CONFIG.baseUrl.replace('https://', '')}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
