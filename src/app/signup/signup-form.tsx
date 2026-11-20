'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signUp, type SignUpState } from '../login/actions';

const initialState: SignUpState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="w-full rounded-lg bg-industrial-900 px-4 py-3 font-semibold text-white hover:bg-industrial-700 disabled:opacity-60">{pending ? 'Creating account...' : 'Create account'}</button>;
}

export default function SignUpForm() {
  const [state, action] = useFormState(signUp, initialState);
  if (state.success) {
    return <p role="status" className="rounded-lg bg-green-50 p-4 text-sm text-green-800">{state.success}</p>;
  }
  return <form action={action} className="space-y-4">
    <label className="block text-sm font-medium">Full name<input required minLength={2} maxLength={120} name="full_name" autoComplete="name" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
    <label className="block text-sm font-medium">Work email<input required type="email" name="email" autoComplete="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
    <label className="block text-sm font-medium">Password<input required minLength={8} type="password" name="password" autoComplete="new-password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
    {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    <SubmitButton />
  </form>;
}
