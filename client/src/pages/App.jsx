import React, { useState } from 'react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { AuthProvider, useAuth } from '../hooks/useAuth.jsx';

function Shell() {
  const { user, loading, login, logout } = useAuth();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  if (loading) return <div className="p-8 text-sm text-slate-600">Opening your Chronicle...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const roleLabel = {
    EMPLOYEE: 'THE AUTHOR',
    MANAGER: 'THE EDITOR',
    ADMIN: 'THE PUBLISHER'
  }[user.role];

  const demoRoles = [
    { label: 'The Author', email: 'employee1@chronicle.app', password: 'emp123' },
    { label: 'The Editor', email: 'manager@chronicle.app', password: 'manager123' },
    { label: 'The Publisher', email: 'admin@chronicle.app', password: 'admin123' }
  ];

  async function switchRole(account) {
    setSwitcherOpen(false);
    await login(account.email, account.password);
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-slate-200 bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-amberline">AtomQuest Hackathon 1.0</p>
            <h1 className="text-xl font-black">Chronicle</h1>
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            {user.role === 'EMPLOYEE' && <NavLink className="rounded-md px-3 py-2 text-sm hover:bg-white/10" to="/chronicle"><Icon name="book" className="inline" /> Chronicle</NavLink>}
            {(user.role === 'MANAGER' || user.role === 'ADMIN') && <NavLink className="rounded-md px-3 py-2 text-sm hover:bg-white/10" to="/editorial-desk"><Icon name="pen" className="inline" /> Editorial Desk</NavLink>}
            {user.role === 'ADMIN' && <NavLink className="rounded-md px-3 py-2 text-sm hover:bg-white/10" to="/publishing-house"><Icon name="newspaper" className="inline" /> Publishing House</NavLink>}
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                className="focus-ring rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-amberline hover:bg-white/15"
                onClick={() => setSwitcherOpen((open) => !open)}
              >
                {roleLabel}
              </button>
              {switcherOpen && (
                <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-2 text-ink shadow-lg">
                  <p className="px-3 py-2 text-xs font-black uppercase text-amberline">Quick-switch demo</p>
                  {demoRoles.map((account) => (
                    <button
                      key={account.email}
                      className="focus-ring block w-full rounded-md px-3 py-2 text-left hover:bg-slate-50"
                      onClick={() => switchRole(account)}
                    >
                      <span className="block text-sm font-black">{account.label}</span>
                      <span className="block text-xs text-slate-500">{account.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="hidden text-sm text-slate-300 sm:inline">{user.name}</span>
            <Button variant="amber" onClick={logout}><Icon name="logout" /> Sign out</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
