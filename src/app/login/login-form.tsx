'use client';

import { useFormState } from 'react-dom';
import { signIn } from './actions';

const initialState: { error?: string } = {};

export default function LoginForm() {
  const [state, action] = useFormState(signIn, initialState);
  return <form action={action} className="space-y-4">
    <label className="block text-sm font-medium">Work email<input required type="email" name="email" autoComplete="username" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
    <label className="block text-sm font-medium">Password<input required minLength={8} type="password" name="password" autoComplete="current-password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
    {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    <button className="w-full rounded-lg bg-industrial-900 px-4 py-3 font-semibold text-white hover:bg-industrial-700">Sign in</button>
  </form>;
}
