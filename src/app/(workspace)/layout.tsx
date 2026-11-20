import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Boxes,
  CircleAlert,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  LogOut,
  Package,
  Ruler,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/login/actions';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Equipment register', icon: Boxes },
  { href: '/breakdowns', label: 'Breakdowns', icon: CircleAlert },
  { href: '/work-orders', label: 'Work orders', icon: ClipboardList },
  { href: '/inspections', label: 'Inspections', icon: ClipboardCheck },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/calibration', label: 'Calibration', icon: Ruler },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/safety', label: 'Safety', icon: ShieldCheck },
  { href: '/kpis', label: 'KPIs & manuals', icon: Gauge },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const displayName = user.user_metadata?.full_name || user.email || 'Department user';

  return (
    <div className="min-h-screen md:flex">
      <aside className="flex w-full flex-col bg-industrial-950 text-white md:fixed md:inset-y-0 md:w-64">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 font-bold">EA</div>
          <div>
            <p className="font-semibold">EAM Manager</p>
            <p className="text-xs text-emerald-100/70">Engineering operations</p>
          </div>
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto p-3 md:block md:flex-1 md:space-y-1 md:overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-emerald-50/80 hover:bg-white/10 hover:text-white">
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-white/10 p-4 md:block">
          <form action={signOut}>
            <button className="flex w-full items-center gap-3 px-2 py-2 text-left text-sm text-emerald-50/80 hover:text-white">
              <LogOut size={17} aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <section className="min-w-0 flex-1 md:ml-64">
        <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity size={17} className="text-industrial-700" aria-hidden="true" /> Department workspace
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-industrial-100 text-sm font-semibold text-industrial-900">
              {String(displayName).slice(0, 1).toUpperCase()}
            </div>
            <form action={signOut} className="md:hidden">
              <button aria-label="Sign out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <LogOut size={17} aria-hidden="true" />
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-5 md:p-8">{children}</main>
      </section>
    </div>
  );
}
