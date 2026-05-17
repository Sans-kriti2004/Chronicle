import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api';

export default function PublishingHouse() {
  const { user } = useAuth();
  const [org, setOrg] = useState([]);
  const [completion, setCompletion] = useState(null);
  const [audit, setAudit] = useState([]);
  const [cycle, setCycle] = useState({ goalSettingOpen: true, q1Open: true, q2Open: false, q3Open: false, q4Open: false });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'EMPLOYEE', managerId: '' });
  const [createUserSuccess, setCreateUserSuccess] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const [orgData, completionData, auditData] = await Promise.all([
      api('/api/admin/org'),
      api('/api/admin/completion'),
      api('/api/admin/audit')
    ]);
    setOrg(orgData.users);
    setCompletion(completionData);
    setAudit(auditData.logs);
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      load().catch((err) => setError(err.message));
    }
  }, [user?.role]);

  if (user?.role === 'EMPLOYEE') return <Navigate to="/chronicle" replace />;
  if (user?.role === 'MANAGER') return <Navigate to="/editorial-desk" replace />;

  async function saveCycle() {
    await api('/api/admin/cycle', { method: 'PUT', body: { year: new Date().getFullYear(), ...cycle } });
  }

  async function createUser(event) {
    event.preventDefault();
    setError('');
    setCreateUserSuccess(null);
    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        managerId: newUser.role === 'EMPLOYEE' ? newUser.managerId : null
      };
      const data = await api('/api/admin/users', { method: 'POST', body: payload });
      setCreateUserSuccess({ email: data.user.email, defaultPassword: data.defaultPassword });
      setNewUser({ name: '', email: '', role: 'EMPLOYEE', managerId: '' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function exportCsv() {
    const csv = await api('/api/admin/export');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chronicle-achievements.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const statusLabels = {
    DRAFT: 'In Draft',
    SUBMITTED: 'Awaiting Editor',
    APPROVED: 'Published',
    RETURNED: 'Sent Back for Revision'
  };
  const chartData = ['DRAFT', 'SUBMITTED', 'APPROVED', 'RETURNED'].map((status) => {
    const item = (completion?.sheets || []).find((sheet) => sheet.status === status);
    return { status, label: statusLabels[status], count: item?.count ?? item?._count ?? 0 };
  });
  const totalEmployees = completion?.totalEmployees || 0;
  const managers = org.filter((user) => user.role === 'MANAGER');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-amberline">The Publisher</p>
          <h2 className="mt-1 text-3xl font-black">Publishing House</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={load}><Icon name="refresh" /> Refresh</Button>
          <Button variant="amber" onClick={exportCsv}><Icon name="download" /> Export Report</Button>
        </div>
      </div>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-black">Cycle Windows</h3>
          {Object.keys(cycle).map((key) => (
            <label key={key} className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span>{key.replace(/([A-Z])/g, ' $1')}</span>
              <input type="checkbox" checked={cycle[key]} onChange={(e) => setCycle({ ...cycle, [key]: e.target.checked })} />
            </label>
          ))}
          <Button className="mt-5 w-full" onClick={saveCycle}><Icon name="newspaper" /> Update Windows</Button>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
          <h3 className="font-black">Completion Rates</h3>
          <div className="mt-4 space-y-4">
            {chartData.map((item) => (
              <div key={item.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-bold">{item.label}</span>
                  <span>{item.count} / {totalEmployees}</span>
                </div>
                <div className="h-4 rounded-full bg-slate-100">
                  <div className="h-4 rounded-full bg-progress" style={{ width: `${totalEmployees ? Math.min((item.count / totalEmployees) * 100, 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-black">Add User</h3>
            <p className="mt-1 text-sm text-slate-600">Create a new Chronicle account for the organization imprint.</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase text-amberline">Default password</span>
        </div>
        <form onSubmit={createUser} className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_220px_1fr_auto]">
          <label className="text-sm font-bold">
            Full Name
            <input
              className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 font-normal"
              value={newUser.name}
              onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
              placeholder="Aditi Rao"
            />
          </label>
          <label className="text-sm font-bold">
            Email
            <input
              className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 font-normal"
              value={newUser.email}
              onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
              placeholder="aditi@chronicle.app"
            />
          </label>
          <label className="text-sm font-bold">
            Role
            <select
              className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 font-normal"
              value={newUser.role}
              onChange={(event) => setNewUser({ ...newUser, role: event.target.value, managerId: '' })}
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <label className="text-sm font-bold">
            Reports To
            <select
              className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 font-normal disabled:bg-slate-100 disabled:text-slate-400"
              value={newUser.managerId}
              onChange={(event) => setNewUser({ ...newUser, managerId: event.target.value })}
              disabled={newUser.role !== 'EMPLOYEE'}
              required={newUser.role === 'EMPLOYEE'}
            >
              <option value="">{newUser.role === 'EMPLOYEE' ? 'Choose manager' : 'Not required'}</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>{manager.name}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <Button className="w-full" variant="amber">Create User</Button>
          </div>
        </form>
        {createUserSuccess && (
          <div className="mt-4 rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
            Created {createUserSuccess.email}. Default password: <span className="font-black">{createUserSuccess.defaultPassword}</span>
          </div>
        )}
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-black">Org Imprint</h3>
          <div className="mt-4 divide-y divide-slate-100">
            {org.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3 text-sm">
                <span>{user.name}</span>
                <span className="font-bold text-slate-500">{user.role}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-black">Audit Trail</h3>
          <div className="mt-4 max-h-96 divide-y divide-slate-100 overflow-auto">
            {audit.map((log) => (
              <div key={log.id} className="py-3 text-sm">
                <p className="font-bold">{log.action}</p>
                <p className="text-slate-600">{log.user?.name} · {new Date(log.createdAt).toLocaleString()}</p>
                {log.newValue && <p className="mt-1 text-slate-500">{log.newValue}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
