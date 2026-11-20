import LoginForm from './login-form';

export default function LoginPage() {
  return <main className="flex min-h-screen items-center justify-center px-4 py-12">
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-industrial-900 text-lg font-bold text-white">EA</div><div><h1 className="text-xl font-bold">EAM Manager</h1><p className="text-sm text-slate-500">Electrical & Automation</p></div></div>
      <h2 className="mb-1 text-2xl font-semibold">Sign in</h2><p className="mb-6 text-sm text-slate-500">Use your department account to continue.</p>
      <LoginForm />
      <p className="mt-6 text-xs leading-5 text-slate-500">Accounts are provisioned by your system administrator. Contact them if you need access.</p>
    </section>
  </main>;
}
