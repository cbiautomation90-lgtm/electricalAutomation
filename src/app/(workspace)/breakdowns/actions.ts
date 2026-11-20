'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const reportSchema = z.object({
  asset_id: z.string().uuid(),
  fault_description: z.string().trim().min(5).max(4000),
  fault_category: z.string().trim().max(120).optional(),
  priority: z.enum(['emergency', 'critical', 'high', 'medium', 'low']),
  production_impact: z.string().trim().max(2000).optional(),
  safety_impact: z.enum(['true', 'false']),
  initial_observations: z.string().trim().max(4000).optional(),
  failure_at: z.string().optional(),
});

export async function reportBreakdown(formData: FormData) {
  const parsed = reportSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/breakdowns/new?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data, error } = await supabase.from('breakdown_reports').insert({
    ...parsed.data,
    reported_by: user.id,
    safety_impact: parsed.data.safety_impact === 'true',
    failure_at: parsed.data.failure_at || null,
  }).select('id,reference_number').single();
  if (error || !data) redirect('/breakdowns/new?error=save');
  revalidatePath('/breakdowns');
  revalidatePath('/work-orders');
  redirect(`/breakdowns/${data.id}?reported=${encodeURIComponent(data.reference_number)}`);
}

const transitionSchema = z.object({ work_order_id: z.string().uuid(), status: z.enum(['assigned','in_progress','repair_completed','tested','verified','closed']) });
const transitions: Record<string, string[]> = {
  open: ['assigned','in_progress'], assigned: ['in_progress','cancelled'], in_progress: ['repair_completed'],
  repair_completed: ['tested'], tested: ['verified'], verified: ['closed'],
};

export async function updateWorkOrderStatus(formData: FormData) {
  const parsed = transitionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/work-orders?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: current, error: readError } = await supabase.from('work_orders').select('id,status').eq('id', parsed.data.work_order_id).single();
  if (readError || !current || !transitions[current.status]?.includes(parsed.data.status)) redirect(`/work-orders/${parsed.data.work_order_id}?error=transition`);
  const now = new Date().toISOString();
  const patch: Record<string, string> = { status: parsed.data.status, updated_at: now };
  if (parsed.data.status === 'in_progress') patch.work_started_at = now;
  if (parsed.data.status === 'repair_completed') patch.repair_completed_at = now;
  if (parsed.data.status === 'closed') { patch.closed_at = now; patch.restored_at = now; }
  const { error } = await supabase.from('work_orders').update(patch).eq('id', current.id);
  if (error) redirect(`/work-orders/${current.id}?error=permission`);
  await supabase.from('work_order_events').insert({ work_order_id: current.id, actor_id: user.id, event_type: 'status_changed', details: { from: current.status, to: parsed.data.status } });
  revalidatePath('/work-orders');
  revalidatePath(`/work-orders/${current.id}`);
  redirect(`/work-orders/${current.id}?updated=1`);
}
