/** @format */

import { supabase } from '@/src/lib/supabase/client';

export type ContactSubmissionInput = {
  name: string;
  email: string;
  project: string | null;
  message: string;
};

export async function createContactSubmission(
  input: ContactSubmissionInput,
): Promise<void> {
  const { error } = await supabase.from('contact_submissions').insert(input);

  if (error) throw error;
}
