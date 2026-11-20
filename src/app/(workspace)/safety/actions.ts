'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  reference_number: z.string().trim().max(40).optional(),
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
    reference_number: parsed.data.reference_number || null,
    incident_at: parsed.data.incident_at || null,
    location: parsed.data.location || null,
    immediate_action: parsed.data.immediate_action || null,
    reported_by: user.id,
  });
  if (error) redirect('/safety?error=save');
  revalidatePath('/safety');
  redirect('/safety?saved=1');
}

const investigationSchema = z.object({
  incident_id: z.string().uuid(),
  status: z.enum(['investigating', 'actions_open', 'closed']),
  investigation_findings: z.string().trim().max(4000).optional(),
  corrective_actions: z.string().trim().max(4000).optional(),
});

export async function updateIncidentInvestigation(formData: FormData) {
  const parsed = investigationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/safety?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const actions = parsed.data.corrective_actions?.split('\n').map((line) => line.trim()).filter(Boolean) ?? [];
  const { error } = await supabase.from('safety_incidents').update({
    status: parsed.data.status,
    investigation_findings: parsed.data.investigation_findings || null,
    corrective_actions: actions,
    closed_at: parsed.data.status === 'closed' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', parsed.data.incident_id);
  if (error) redirect('/safety?error=investigation');
  revalidatePath('/safety');
  redirect('/safety?updated=1');
}
