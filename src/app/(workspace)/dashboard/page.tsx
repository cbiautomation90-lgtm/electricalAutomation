import { Activity, Boxes, CircleAlert, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

async function countRows(table: string, filter?: (query: any) => any) {
  const supabase = await createClient();
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  return error ? null : count ?? 0;
}

function Metric({ label, value, note, icon: Icon }: { label: string; value: number | null; note: string; icon: typeof Boxes }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{value === null ? '—' : value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div><span className="rounded-lg bg-industrial-100 p-2 text-industrial-700"><Icon size={20}/></span></div></article>;
}

export default async function DashboardPage() {
  const [assets, operational, outOfService, areas] = await Promise.all([
    countRows('assets', q => q.is('archived_at', null)),
    countRows('assets', q => q.eq('status', 'operational').is('archived_at', null)),
    countRows('assets', q => q.eq('status', 'out_of_service').is('archived_at', null)),
    countRows('areas'),
  ]);
  const hasError = [assets, operational, outOfService, areas].some(value => value === null);
  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-industrial-700">Overview</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Department dashboard</h1><p className="mt-1 text-sm text-slate-500">Live counts from your authorized records.</p></div><Link href="/assets/new" className="rounded-lg bg-industrial-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-industrial-700">Register equipment</Link></div>
    {hasError && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Some data could not be loaded. Confirm your Supabase migrations and user permissions.</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Registered equipment" value={assets} note="Active, non-archived assets" icon={Boxes}/><Metric label="Operational" value={operational} note="Assets marked operational" icon={Activity}/><Metric label="Out of service" value={outOfService} note="Assets requiring attention" icon={CircleAlert}/><Metric label="Production areas" value={areas} note="Configured areas" icon={ClipboardCheck}/></div>
    <div className="grid gap-5 lg:grid-cols-3"><section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2"><h2 className="font-semibold">Operational readiness</h2><p className="mt-1 text-sm text-slate-500">Maintenance and inspection analytics will appear as their modules are implemented and records become available.</p><div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Activity className="mx-auto text-slate-400"/><p className="mt-3 text-sm font-medium">No maintenance metrics are configured yet</p><p className="mt-1 text-xs text-slate-500">No sample figures are shown. Dashboard values reflect database records only.</p></div></section><section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Quick access</h2><div className="mt-4 space-y-3"><Link className="block rounded-lg border border-slate-200 p-3 text-sm hover:border-industrial-600" href="/assets">Equipment register <span className="block pt-1 text-xs text-slate-500">Search and manage assets</span></Link><Link className="block rounded-lg border border-slate-200 p-3 text-sm hover:border-industrial-600" href="/inspections">Inspection tools <span className="block pt-1 text-xs text-slate-500">Inspection workflows planned for the next phase</span></Link><Link className="block rounded-lg border border-slate-200 p-3 text-sm hover:border-industrial-600" href="/kpis">KPI manuals <span className="block pt-1 text-xs text-slate-500">Controlled documents and KPI definitions</span></Link></div></section></div>
  </div>;
}
