/** @format */

export interface ReviewAvatarOption {
  id: string;
  label: string;
  subtitle: string;
  className: string;
}

const REVIEW_AVATARS: ReviewAvatarOption[] = [
  {
    id: 'short-hair',
    label: 'Short Hair',
    subtitle: 'Clean and professional',
    className: 'short-hair',
  },
  {
    id: 'beard',
    label: 'Beard',
    subtitle: 'Refined and modern',
    className: 'beard',
  },
  {
    id: 'glasses',
    label: 'Glasses',
    subtitle: 'Thoughtful and sharp',
    className: 'glasses',
  },
  {
    id: 'short-hair-female',
    label: 'Short Hair',
    subtitle: 'Bold and polished',
    className: 'short-hair-female',
  },
  {
    id: 'long-hair',
    label: 'Long Hair',
    subtitle: 'Elegant and confident',
    className: 'long-hair',
  },
  {
    id: 'curly-hair',
    label: 'Curly Hair',
    subtitle: 'Creative and vibrant',
    className: 'curly-hair',
  },
  {
    id: 'neutral-1',
    label: 'Neutral',
    subtitle: 'Minimal and clean',
    className: 'neutral-1',
  },
  {
    id: 'neutral-2',
    label: 'Calm',
    subtitle: 'Balanced and quiet',
    className: 'neutral-2',
  },
];

export default REVIEW_AVATARS;
