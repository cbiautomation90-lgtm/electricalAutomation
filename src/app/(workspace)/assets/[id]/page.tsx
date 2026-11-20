import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { archiveAsset } from '../actions';

export default async function AssetDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string } }) {
  const supabase = await createClient();
  const { data: asset, error } = await supabase.from('assets').select('*, plants(name,code), areas(name), asset_categories(name)').eq('id', params.id).single();
  if (error || !asset) notFound();
  const { data: history } = await supabase.from('asset_history').select('id,action,created_at,change_data').eq('asset_id', asset.id).order('created_at', { ascending: false }).limit(30);
  return <div className="mx-auto max-w-4xl space-y-6"><div><Link href="/assets" className="text-sm text-industrial-700">← Equipment register</Link><div className="mt-3 flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium text-industrial-700">{asset.tag}</p><h1 className="mt-1 text-2xl font-bold">{asset.description}</h1><p className="mt-1 text-sm text-slate-500">Asset no. {asset.asset_number}</p></div><form action={archiveAsset}><input type="hidden" name="asset_id" value={asset.id}/><button className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700" formAction={archiveAsset}>Archive asset</button></form></div></div>
    {searchParams.error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">Could not archive this equipment.</p>}
    <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2"><Detail label="Status" value={asset.status.replaceAll('_',' ')}/><Detail label="Criticality" value={asset.criticality}/><Detail label="Plant" value={asset.plants?.name}/><Detail label="Production area" value={asset.areas?.name}/><Detail label="Category" value={asset.asset_categories?.name}/><Detail label="Manufacturer" value={asset.manufacturer}/><Detail label="Model" value={asset.model}/><Detail label="Serial number" value={asset.serial_number}/><Detail label="Voltage" value={asset.voltage ? `${asset.voltage} V` : null}/><Detail label="Power rating" value={asset.power_rating ? `${asset.power_rating} kW` : null}/></section>
    <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Asset history</h2>{history?.length ? <ul className="mt-4 divide-y">{history.map(item=><li key={item.id} className="flex justify-between gap-3 py-3 text-sm"><span>{item.action.replaceAll('_',' ')}</span><time className="text-slate-500">{new Date(item.created_at).toLocaleString()}</time></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No history events recorded.</p>}</section></div>;
}
function Detail({label,value}:{label:string;value:string|null|undefined}){return <div><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-medium capitalize">{value || '—'}</p></div>}
