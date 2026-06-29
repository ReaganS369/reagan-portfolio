/** @format */

export type MarqueeMessage = string | { label: string; shortLabel: string };

export interface HeroRole {
  id: string;
  title: string;
  icon_url: string;
  display_order: number;
  is_active: boolean;
}

export interface UserProfile {
  casual_avatar: string;
  formal_avatar: string;
}
