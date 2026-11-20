'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  metric_name: z.string().trim().min(2).max(120),
  period_start: z.string().date(),
  period_end: z.string().date(),
  value: z.coerce.number(),
  unit: z.string().trim().min(1).max(40),
  target: z.union([z.coerce.number(), z.literal('')]).optional(),
  notes: z.string().trim().max(1000).optional(),
}).refine((value) => value.period_end >= value.period_start, { path: ['period_end'] });

export async function createKpiEntry(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/kpis?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('manual_kpi_entries').insert({
    ...parsed.data,
    target: parsed.data.target === '' ? null : parsed.data.target,
    entered_by: user.id,
  });
  if (error) redirect('/kpis?error=save');
  revalidatePath('/kpis');
  redirect('/kpis?saved=1');
}
