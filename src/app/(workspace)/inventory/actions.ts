'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  item_number: z.string().trim().min(1).max(40),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional(),
  category: z.string().trim().max(100).optional(),
  unit: z.string().trim().min(1).max(30),
  quantity_on_hand: z.coerce.number().min(0),
  reorder_level: z.coerce.number().min(0),
  location: z.string().trim().max(160).optional(),
});

export async function createInventoryItem(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/inventory?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('inventory_items').insert(parsed.data);
  if (error) redirect('/inventory?error=save');
  revalidatePath('/inventory');
  redirect('/inventory?saved=1');
}
