'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  asset_id: z.string().uuid(),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(2000).optional(),
  interval_days: z.coerce.number().int().positive(),
  next_due_at: z.string().date(),
  estimated_duration_minutes: z.union([z.coerce.number().int().positive(), z.literal('')]).optional(),
});

export async function createMaintenancePlan(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/maintenance?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('preventive_maintenance_plans').insert({
    ...parsed.data,
    description: parsed.data.description || null,
    estimated_duration_minutes: parsed.data.estimated_duration_minutes === '' ? null : parsed.data.estimated_duration_minutes,
    created_by: user.id,
  });
  if (error) redirect('/maintenance?error=save');
  revalidatePath('/maintenance');
  redirect('/maintenance?saved=1');
}
