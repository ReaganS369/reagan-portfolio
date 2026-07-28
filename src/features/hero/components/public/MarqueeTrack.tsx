/** @format */

import type { RefObject } from 'react';

import type { MarqueeMessage } from '../../types';
import { StoryItem } from './StoryItem';

interface MarqueeTrackProps {
  messages: MarqueeMessage[];
  className: string;
  /** Lets the ribbon spin the loop down to a stop when it docks. */
  trackRef?: RefObject<HTMLDivElement | null>;
}

export function MarqueeTrack({
  messages,
  className,
  trackRef,
}: MarqueeTrackProps) {
  const repeatedMessages = [...messages, ...messages];

  return (
    <div className={className} ref={trackRef}>
      {repeatedMessages.map((message, index) => {
        if (typeof message === 'string') {
          return <span key={`${className}-${index}`}>{message}</span>;
        }

        return (
          <StoryItem
            key={`${className}-${index}`}
            label={message.label}
            shortLabel={message.shortLabel}
            href={message.href}
            // The track holds two passes of the same list; the slot a label
            // docks into is its position within one pass.
            itemIndex={index % messages.length}
          />
        );
      })}
    </div>
  );
}
