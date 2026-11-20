'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  item_id: z.string().uuid(),
  transaction_type: z.enum(['receipt', 'issue', 'adjustment', 'return']),
  quantity: z.coerce.number().positive(),
  reference: z.string().trim().max(120).optional(),
  work_order_id: z.union([z.string().uuid(), z.literal('')]).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export async function recordInventoryTransaction(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect('/inventory?error=validation');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('inventory_transactions').insert({
    ...parsed.data,
    work_order_id: parsed.data.work_order_id || null,
    reference: parsed.data.reference || null,
    notes: parsed.data.notes || null,
    performed_by: user.id,
  });
  if (error) redirect('/inventory?error=transaction');
  revalidatePath('/inventory');
  redirect('/inventory?transaction=1');
}
