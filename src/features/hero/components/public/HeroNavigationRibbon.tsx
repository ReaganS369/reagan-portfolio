/** @format */

import { storyMessages } from '../../constants';
import { MarqueeTrack } from './MarqueeTrack';
import '../../styles/story-ribbon.css';

export function HeroNavigationRibbon() {
  return (
    <div className="story-ribbon">
      <MarqueeTrack
        messages={storyMessages}
        className="story-track marquee-track"
      />
    </div>
  );
}
