/** @format */

import type { MarqueeMessage } from '../../types';
import { StoryItem } from './StoryItem';

interface MarqueeTrackProps {
  messages: MarqueeMessage[];
  className: string;
}

export function MarqueeTrack({ messages, className }: MarqueeTrackProps) {
  const repeatedMessages = [...messages, ...messages];

  return (
    <div className={className}>
      {repeatedMessages.map((message, index) => {
        if (typeof message === 'string') {
          return <span key={`${className}-${index}`}>{message}</span>;
        }

        return (
          <StoryItem
            key={`${className}-${index}`}
            label={message.label}
            shortLabel={message.shortLabel}
          />
        );
      })}
    </div>
  );
}
