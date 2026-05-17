import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import ArcHealth from '../components/ArcHealth';
import Button from '../components/Button';
import ChapterCard from '../components/ChapterCard';
import Icon from '../components/Icon';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api';
import { statusLabel } from '../lib/scoreEngine';

export default function EditorialDesk() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteQuarter, setNoteQuarter] = useState('Q1');
  const [noteComment, setNoteComment] = useState('');

  async function load() {
    const data = await api('/api/manager/team');
    setTeam(data.team);
    setSelected((current) => current ? data.team.find((item) => item.id === current.id) || data.team[0] : data.team[0]);
  }

  useEffect(() => {
    if (user?.role === 'MANAGER' || user?.role === 'ADMIN') {
      load().catch((err) => setError(err.message));
    }
  }, [user?.role]);

  if (user?.role === 'EMPLOYEE') return <Navigate to="/chronicle" replace />;

  async function approve(sheetId) {
    setError('');
    try {
      await api(`/api/manager/sheet/${sheetId}/approve`, { method: 'PUT' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function returnSheet(sheetId) {
    setError('');
    try {
      await api(`/api/manager/sheet/${sheetId}/return`, { method: 'PUT', body: { reason: 'Needs sharper plot tension and cleaner weightage.' } });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function savePlotNote(sheetId) {
    setError('');
    try {
      await api('/api/manager/checkin', { method: 'POST', body: { goalSheetId: sheetId, quarter: noteQuarter, comment: noteComment } });
      setNoteComment('');
      setNoteOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
      <aside>
        <p className="text-sm font-black uppercase text-amberline">The Editor</p>
        <h2 className="mt-1 text-3xl font-black">Editorial Desk</h2>
        <div className="mt-6 grid gap-3">
          {team.map((member) => (
            <button
              key={member.id}
              onClick={() => {
                setSelected(member);
                setNoteOpen(false);
                setNoteComment('');
              }}
              className={`focus-ring rounded-lg border p-4 text-left ${selected?.id === member.id ? 'border-amberline bg-amber-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black">{member.name}</p>
                  <p className="text-sm text-slate-600">{statusLabel(member.sheet?.status || 'DRAFT')}</p>
                </div>
                <span className="text-2xl font-black">{member.arcHealth?.score || 0}</span>
              </div>
            </button>
          ))}
        </div>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </aside>
      <section>
        {!selected && (
          <div className="rounded-lg border border-dashed border-amber-300 bg-white p-10 shadow-sm">
            <p className="text-sm font-black uppercase text-amberline">Quiet desk</p>
            <h3 className="mt-2 text-2xl font-black text-ink">Your editorial desk is empty.</h3>
            <p className="mt-2 text-slate-600">No authors reporting to you yet.</p>
          </div>
        )}
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black">{selected.name}'s Chronicle</h3>
                <p className="text-sm text-slate-600">{statusLabel(selected.sheet?.status || 'DRAFT')}</p>
              </div>
              {selected.sheet && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="amber" onClick={() => approve(selected.sheet.id)}><Icon name="check" /> Publish</Button>
                  <Button variant="ghost" onClick={() => returnSheet(selected.sheet.id)}><Icon name="return" /> Send Back</Button>
                  <Button variant="ghost" onClick={() => setNoteOpen((open) => !open)}><Icon name="note" /> Plot Note</Button>
                </div>
              )}
            </div>
            {selected.sheet && noteOpen && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase text-amberline">Plot Note</p>
                    <p className="text-sm text-slate-600">Add the editor's quarterly check-in for {selected.name}.</p>
                  </div>
                  <select className="focus-ring rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-bold" value={noteQuarter} onChange={(event) => setNoteQuarter(event.target.value)}>
                    <option>Q1</option>
                    <option>Q2</option>
                    <option>Q3</option>
                    <option>Q4</option>
                  </select>
                </div>
                <textarea
                  className="focus-ring mt-4 min-h-28 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm"
                  placeholder="Write the plot update..."
                  value={noteComment}
                  onChange={(event) => setNoteComment(event.target.value)}
                />
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setNoteOpen(false)}>Cancel</Button>
                  <Button variant="amber" onClick={() => savePlotNote(selected.sheet.id)}><Icon name="check" /> Save Plot Note</Button>
                </div>
              </div>
            )}
            {selected.sheet?.checkIns?.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h4 className="font-black">Saved Plot Notes</h4>
                <div className="mt-3 divide-y divide-slate-100">
                  {selected.sheet.checkIns.map((checkIn) => (
                    <div key={checkIn.id} className="py-3 text-sm">
                      <p className="font-bold text-ink">{checkIn.quarter} · {new Date(checkIn.createdAt).toLocaleString()}</p>
                      <p className="mt-1 text-slate-600">{checkIn.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ArcHealth arcHealth={selected.arcHealth} />
            <div className="space-y-4">
              {(selected.sheet?.goals || []).map((goal) => <ChapterCard key={goal.id} goal={goal} />)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
