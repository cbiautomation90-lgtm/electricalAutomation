import { createClient } from '@/lib/supabase/server';

export default async function ReportsPage() {
  const supabase = await createClient();
  const [assets, breakdowns, workOrders, pmPlans, incidents, inventory, projects, kpis] = await Promise.all([
    supabase.from('assets').select('id', { count: 'exact', head: true }).is('archived_at', null),
    supabase.from('breakdown_reports').select('id', { count: 'exact', head: true }),
    supabase.from('work_orders').select('id,status,priority,created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('preventive_maintenance_plans').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('safety_incidents').select('id', { count: 'exact', head: true }).neq('status', 'closed'),
    supabase.from('inventory_items').select('id,item_number,name,quantity_on_hand,reorder_level,unit').eq('active', true).order('name').limit(200),
    supabase.from('projects').select('id,status', { count: 'exact' }).limit(200),
    supabase.from('manual_kpi_entries').select('id,metric_name,period_start,period_end,value,unit,target').order('period_start', { ascending: false }).limit(20),
  ]);
  const openOrders = workOrders.data?.filter((order) => !['closed', 'cancelled'].includes(order.status)) ?? [];
  const lowStock = inventory.data?.filter((item) => Number(item.quantity_on_hand) <= Number(item.reorder_level)) ?? [];
  return <section className="space-y-6"><header><p className="text-sm font-medium text-industrial-700">Management information</p><h1 className="mt-1 text-3xl font-semibold">Operational reports</h1><p className="mt-2 text-slate-600">Current snapshots from module records visible to your account.</p></header>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Active assets', assets.count], ['Breakdown reports', breakdowns.count], ['Open work orders', openOrders.length], ['Active PM plans', pmPlans.count], ['Open safety incidents', incidents.count], ['Projects', projects.count]].map(([label, count]) => <article key={String(label)} className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-3xl font-semibold">{count ?? '—'}</p></article>)}</div>
    <div className="grid gap-6 lg:grid-cols-2"><div className="overflow-x-auto rounded-xl border bg-white"><h2 className="p-5 text-lg font-semibold">Open work orders</h2><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Status</th><th className="p-3">Priority</th><th className="p-3">Created</th></tr></thead><tbody>{openOrders.slice(0, 20).map((order) => <tr key={order.id} className="border-t"><td className="p-3">{order.status.replace('_', ' ')}</td><td className="p-3">{order.priority}</td><td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>{!openOrders.length && <p className="p-5 text-sm text-slate-500">No open work orders.</p>}</div>
    <div className="overflow-x-auto rounded-xl border bg-white"><h2 className="p-5 text-lg font-semibold">Items at or below reorder level</h2><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Item</th><th className="p-3">On hand</th><th className="p-3">Reorder level</th></tr></thead><tbody>{lowStock.map((item) => <tr key={item.id} className="border-t"><td className="p-3">{item.item_number} · {item.name}</td><td className="p-3">{item.quantity_on_hand} {item.unit}</td><td className="p-3">{item.reorder_level}</td></tr>)}</tbody></table>{!lowStock.length && <p className="p-5 text-sm text-slate-500">No low-stock items found.</p>}</div>
    <div className="overflow-x-auto rounded-xl border bg-white"><h2 className="p-5 text-lg font-semibold">Recent KPI measurements</h2><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Metric</th><th className="p-3">Period</th><th className="p-3">Value</th><th className="p-3">Target</th></tr></thead><tbody>{kpis.data?.map((entry) => <tr key={entry.id} className="border-t"><td className="p-3">{entry.metric_name}</td><td className="p-3">{entry.period_start} – {entry.period_end}</td><td className="p-3">{entry.value} {entry.unit}</td><td className="p-3">{entry.target ?? '—'}</td></tr>)}</tbody></table>{!kpis.data?.length && <p className="p-5 text-sm text-slate-500">No KPI data.</p>}</div>
    <div className="rounded-xl border bg-white p-5"><h2 className="text-lg font-semibold">Report notes</h2><p className="mt-2 text-sm text-slate-600">Counts respect database row-level security. This is a live operational snapshot; it is not a certified financial, safety, or reliability report.</p></div></div>
  </section>;
}
