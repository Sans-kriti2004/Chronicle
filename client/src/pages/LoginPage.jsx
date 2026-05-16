import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../hooks/useAuth.jsx';
import Button from '../components/Button';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('employee1@chronicle.app');
  const [password, setPassword] = useState('emp123');
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-[1fr_420px]">
        <section>
          <p className="text-sm font-black uppercase text-amberline">Chronicle</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-black leading-tight text-ink">Every work year deserves a story worth publishing.</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">Goals become chapters, check-ins become plot updates, and approval becomes the editor's sign-off.</p>
        </section>
        <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Open your desk</h2>
          <label className="mt-6 block text-sm font-bold">Email</label>
          <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label className="mt-4 block text-sm font-bold">Password</label>
          <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button className="mt-6 w-full" variant="amber">Enter Chronicle</Button>
          <div className="mt-5 text-xs leading-6 text-slate-500">
            Demo: admin@chronicle.app / admin123<br />
            manager@chronicle.app / manager123<br />
            employee1@chronicle.app / emp123
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
