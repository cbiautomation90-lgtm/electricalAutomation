'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const equipmentSchema = z.object({
  equipment_number: z.string().trim().min(1).max(40),
  name: z.string().trim().min(2).max(160),
  manufacturer: z.string().trim().max(120).optional(),
  model: z.string().trim().max(120).optional(),
  serial_number: z.string().trim().max(120).optional(),
  calibration_interval_days: z.coerce.number().int().positive(),
  next_calibration_due: z.string().optional(),
});

export async function createCalibrationEquipment(formData: FormData) {
  const parsed = equipmentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/calibration?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('calibration_equipment').insert({
    ...parsed.data,
    next_calibration_due: parsed.data.next_calibration_due || null,
  });
  if (error) redirect('/calibration?error=save');
  revalidatePath('/calibration');
  redirect('/calibration?saved=equipment');
}

const eventSchema = z.object({
  equipment_id: z.string().uuid(),
  calibrated_at: z.string().date(),
  due_at: z.string().date(),
  result: z.enum(['passed', 'failed', 'limited_use']),
  provider: z.string().trim().max(160).optional(),
  certificate_reference: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
}).refine((value) => value.due_at >= value.calibrated_at);

export async function recordCalibration(formData: FormData) {
  const parsed = eventSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/calibration?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('calibration_events').insert({ ...parsed.data, recorded_by: user.id });
  if (error) redirect('/calibration?error=save');
  revalidatePath('/calibration');
  redirect('/calibration?saved=event');
}
