'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const assetSchema = z.object({
  asset_number: z.string().trim().min(1).max(64),
  tag: z.string().trim().min(1).max(64),
  description: z.string().trim().min(2).max(240),
  plant_id: z.string().uuid(),
  area_id: z.string().uuid().optional().or(z.literal('')),
  category_id: z.string().uuid().optional().or(z.literal('')),
  manufacturer: z.string().trim().max(120).optional(),
  model: z.string().trim().max(120).optional(),
  serial_number: z.string().trim().max(120).optional(),
  criticality: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['operational', 'maintenance', 'out_of_service', 'inactive']),
});

export async function createAsset(formData: FormData) {
  const parsed = assetSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/assets/new?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data, error } = await supabase.from('assets').insert({
    ...parsed.data,
    area_id: parsed.data.area_id || null,
    category_id: parsed.data.category_id || null,
    created_by: user.id,
  }).select('id').single();
  if (error) {
    const code = error.code === '23505' ? 'duplicate' : 'save';
    redirect(`/assets/new?error=${code}`);
  }
  await supabase.from('asset_history').insert({ asset_id: data.id, action: 'asset_created', performed_by: user.id, change_data: { tag: parsed.data.tag } });
  revalidatePath('/assets');
  redirect(`/assets/${data.id}`);
}

export async function archiveAsset(formData: FormData) {
  const assetId = String(formData.get('asset_id') ?? '');
  const parsedId = z.string().uuid().safeParse(assetId);
  if (!parsedId.success) redirect('/assets?error=invalid');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('assets').update({ archived_at: new Date().toISOString(), status: 'inactive' }).eq('id', assetId);
  if (error) redirect(`/assets/${assetId}?error=archive`);
  await supabase.from('asset_history').insert({ asset_id: assetId, action: 'asset_archived', performed_by: user.id });
  revalidatePath('/assets');
  redirect('/assets');
}
