/** @format */

'use client';

import MorphText from '@/src/components/ui/morph-text';

export default function TestPage() {
  return (
    <main
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#111',
      }}
    >
      <MorphText words={['GAME', ' ARTIST', '3D ', 'XR ']} />
    </main>
  );
}
