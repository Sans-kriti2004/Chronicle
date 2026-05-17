import React, { useState } from 'react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { AuthProvider, useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api';

function Shell() {
  const { user, loading, logout } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  if (loading) return <div className="p-8 text-sm text-slate-600">Opening your Chronicle...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const roleLabel = {
    EMPLOYEE: 'THE AUTHOR',
    MANAGER: 'THE EDITOR',
    ADMIN: 'THE PUBLISHER'
  }[user.role];

  async function changePassword(event) {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    try {
      await api('/api/auth/change-password', { method: 'POST', body: passwordForm });
      setPasswordMessage('Password updated.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message);
    }
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
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-amberline">
              {roleLabel}
            </span>
            <span className="hidden text-sm text-slate-300 sm:inline">{user.name}</span>
            <div className="relative">
              <Button variant="ghost" className="border-white/15 text-white hover:bg-white/10" onClick={() => setPasswordOpen((open) => !open)}>Change Password</Button>
              {passwordOpen && (
                <form onSubmit={changePassword} className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 text-ink shadow-lg">
                  <h3 className="font-black">Change Password</h3>
                  <label className="mt-4 block text-xs font-bold uppercase text-slate-500">
                    Current password
                    <input
                      className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal text-ink"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                    />
                  </label>
                  <label className="mt-3 block text-xs font-bold uppercase text-slate-500">
                    New password
                    <input
                      className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal text-ink"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                    />
                  </label>
                  <label className="mt-3 block text-xs font-bold uppercase text-slate-500">
                    Confirm new password
                    <input
                      className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal text-ink"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                    />
                  </label>
                  {passwordError && <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{passwordError}</p>}
                  {passwordMessage && <p className="mt-3 rounded-md bg-teal-50 p-2 text-sm text-teal-700">{passwordMessage}</p>}
                  <div className="mt-4 flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setPasswordOpen(false)}>Cancel</Button>
                    <Button variant="amber">Save</Button>
                  </div>
                </form>
              )}
            </div>
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
