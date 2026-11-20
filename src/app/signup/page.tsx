import Link from 'next/link';
import SignUpForm from './signup-form';

export default function SignUpPage() {
  return <main className="flex min-h-screen items-center justify-center px-4 py-12">
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-industrial-900 text-lg font-bold text-white">EA</div><div><h1 className="text-xl font-bold">EAM Manager</h1><p className="text-sm text-slate-500">Electrical & Automation</p></div></div>
      <h2 className="mb-1 text-2xl font-semibold">Create account</h2><p className="mb-6 text-sm text-slate-500">New accounts start with operator access. A Department Head can grant additional roles.</p>
      <SignUpForm />
      <p className="mt-6 text-sm text-slate-600">Already have an account? <Link href="/login" className="font-semibold text-industrial-900 underline">Sign in</Link></p>
    </section>
  </main>;
}
