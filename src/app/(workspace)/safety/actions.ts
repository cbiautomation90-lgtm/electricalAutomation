'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  reference_number: z.string().trim().min(2).max(40),
  severity: z.enum(['near_miss', 'minor', 'moderate', 'major', 'critical']),
  incident_at: z.string().optional(),
  location: z.string().trim().max(160).optional(),
  description: z.string().trim().min(5).max(4000),
  immediate_action: z.string().trim().max(2000).optional(),
});

export async function createSafetyIncident(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/safety?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('safety_incidents').insert({
    ...parsed.data,
    incident_at: parsed.data.incident_at || null,
    reported_by: user.id,
  });
  if (error) redirect('/safety?error=save');
  revalidatePath('/safety');
  redirect('/safety?saved=1');
}
