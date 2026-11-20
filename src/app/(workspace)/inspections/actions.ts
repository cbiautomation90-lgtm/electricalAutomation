'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  asset_id: z.string().uuid(),
  inspected_at: z.string().optional(),
  result: z.enum(['passed', 'failed', 'follow_up']),
  findings: z.string().trim().max(3000).optional(),
});

export async function createInspectionRecord(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/inspections?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('inspection_records').insert({
    ...parsed.data,
    inspected_at: parsed.data.inspected_at || new Date().toISOString(),
    findings: parsed.data.findings || null,
    inspector_id: user.id,
  });
  if (error) redirect('/inspections?error=save');
  revalidatePath('/inspections');
  redirect('/inspections?saved=1');
}
