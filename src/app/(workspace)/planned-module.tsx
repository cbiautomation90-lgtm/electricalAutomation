import Link from 'next/link';

export default function PlannedModule({ title, description, capabilities }: { title: string; description: string; capabilities: string[] }) {
 return <div className="mx-auto max-w-3xl space-y-6"><Link href="/dashboard" className="text-sm text-industrial-700">← Dashboard</Link><div><p className="text-sm font-medium text-industrial-700">EAM Manager</p><h1 className="mt-1 text-2xl font-bold">{title}</h1><p className="mt-2 text-slate-600">{description}</p></div><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Planned capabilities</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">{capabilities.map(item=><li key={item}>{item}</li>)}</ul><p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">This module is not implemented yet; no records or metrics are being presented as complete.</p></section></div>;
}
