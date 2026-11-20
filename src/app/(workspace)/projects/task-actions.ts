'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  project_id: z.string().uuid(),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1500).optional(),
  assignee_id: z.union([z.string().uuid(), z.literal('')]).optional(),
  due_date: z.string().optional(),
});

export async function createProjectTask(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/projects?error=task-validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('project_tasks').insert({
    ...parsed.data,
    description: parsed.data.description || null,
    assignee_id: parsed.data.assignee_id || null,
    due_date: parsed.data.due_date || null,
  });
  if (error) redirect('/projects?error=task-save');
  revalidatePath('/projects');
  redirect('/projects?task=1');
}
