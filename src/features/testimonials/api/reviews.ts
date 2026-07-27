/** @format */

import { supabase } from '@/src/lib/supabase/client';

/**
 * Public read + public submission only.
 *
 * Moderation (approve/hide/feature/edit/delete) moved to the nngtw-admin
 * app (`src/modules/portfolio`). `createReview` stays here because it is
 * genuinely a visitor action: the review form on this site submits it
 * anonymously, and the row lands as `pending` for someone to moderate.
 */

export type ReviewStatus = 'pending' | 'approved' | 'hidden';
export type ReviewRecommendation = 'yes' | 'maybe' | 'no' | '';

export type Review = {
  id: string;
  display_name: string;
  avatar: string;
  rating: number;
  public_review: string;
  private_suggestion: string | null;
  recommendation: ReviewRecommendation;
  relationship: string | null;
  status: ReviewStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ReviewInput = {
  display_name: string;
  avatar: string;
  rating: number;
  public_review: string;
  private_suggestion?: string | null;
  recommendation?: ReviewRecommendation;
  relationship?: string | null;
};

export async function getApprovedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Review[];
}

/**
 * Submitted by a visitor. `status` and `featured` are deliberately not
 * set here — the table's defaults land the row as pending and unfeatured,
 * and the admin's RLS policy for this insert path enforces the same, so a
 * crafted request can't self-approve a testimonial.
 */
export async function createReview(input: ReviewInput): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      display_name: input.display_name,
      avatar: input.avatar,
      rating: input.rating,
      public_review: input.public_review,
      private_suggestion: input.private_suggestion ?? null,
      recommendation: input.recommendation ?? 'maybe',
      relationship: input.relationship ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Review;
}

/**
 * Subscribe to any change on the reviews table so the public carousel
 * picks up a newly approved review without a reload. Returns an
 * unsubscribe function. Safe to call even if Realtime is not enabled:
 * the channel simply never emits.
 */
export function subscribeToReviews(onChange: () => void): () => void {
  const channel = supabase
    .channel('reviews-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reviews' },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
