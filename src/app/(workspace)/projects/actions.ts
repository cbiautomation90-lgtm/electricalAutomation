'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  project_number: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  start_date: z.string().optional(),
  target_date: z.string().optional(),
  budget: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
});

export async function createProject(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/projects?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('projects').insert({
    ...parsed.data,
    start_date: parsed.data.start_date || null,
    target_date: parsed.data.target_date || null,
    budget: parsed.data.budget === '' ? null : parsed.data.budget,
    owner_id: user.id,
  });
  if (error) redirect('/projects?error=save');
  revalidatePath('/projects');
  redirect('/projects?saved=1');
}
