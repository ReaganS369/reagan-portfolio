/** @format */

import type { UserProfile } from '../../types';
import '../../styles/avatar.css';

interface HeroAvatarProps {
  profile: UserProfile;
}

export function HeroAvatar({ profile }: HeroAvatarProps) {
  return (
    <div className="hero-right">
      <div className="character-wrapper">
        <img
          src={profile.casual_avatar}
          className="character"
          alt=""
        />
      </div>
    </div>
  );
}
