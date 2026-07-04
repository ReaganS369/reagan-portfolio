/** @format */

import { supabase } from '@/src/lib/supabase/client';

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

export type ReviewUpdate = Partial<ReviewInput> & {
  status?: ReviewStatus;
  featured?: boolean;
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

export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function getRecentReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function getPendingReviewCount(): Promise<number> {
  const { count, error } = await supabase
    .from('reviews')
    .select('*', { head: true, count: 'exact' })
    .eq('status', 'pending');

  if (error) throw error;
  return count ?? 0;
}

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
 * Partial update — only the keys explicitly provided are written, so a
 * status-only or featured-only change never clobbers the review's content.
 */
export async function updateReview(
  id: string,
  input: ReviewUpdate,
): Promise<Review> {
  const payload: Record<string, unknown> = {};

  if (input.display_name !== undefined) payload.display_name = input.display_name;
  if (input.avatar !== undefined) payload.avatar = input.avatar;
  if (input.rating !== undefined) payload.rating = input.rating;
  if (input.public_review !== undefined) payload.public_review = input.public_review;
  if (input.private_suggestion !== undefined) {
    payload.private_suggestion = input.private_suggestion ?? null;
  }
  if (input.recommendation !== undefined) payload.recommendation = input.recommendation;
  if (input.relationship !== undefined) {
    payload.relationship = input.relationship ?? null;
  }
  if (input.status !== undefined) payload.status = input.status;
  if (input.featured !== undefined) payload.featured = input.featured;

  const { data, error } = await supabase
    .from('reviews')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Review;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);

  if (error) throw error;
}

/**
 * Subscribe to any change on the reviews table (insert/update/delete) so the
 * admin dashboard — and, in turn, the public site — stay in sync live.
 * Returns an unsubscribe function. Safe to call even if Realtime is not
 * enabled: the channel simply never emits.
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
