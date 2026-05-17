import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import ArcHealth from '../components/ArcHealth';
import Button from '../components/Button';
import ChapterCard from '../components/ChapterCard';
import Icon from '../components/Icon';
import WeightageComposer from '../components/WeightageComposer';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api';
import { statusLabel } from '../lib/scoreEngine';

const initialGoal = { thrustArea: '', title: '', description: '', uomType: 'MIN', target: 100, weightage: 10 };

export default function EmployeeChronicle() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(initialGoal);
  const [error, setError] = useState('');

  async function load() {
    const response = await api('/api/goals/my-sheet');
    setData(response);
  }

  useEffect(() => {
    if (user?.role === 'EMPLOYEE') {
      load().catch((err) => setError(err.message));
    }
  }, [user?.role]);

  async function addChapter(event) {
    event.preventDefault();
    setError('');
    try {
      await api('/api/goals', { method: 'POST', body: draft });
      setDraft(initialGoal);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submit() {
    setError('');
    try {
      await api('/api/goals/submit', { method: 'POST' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const sheet = data?.sheet;
  const goals = sheet?.goals || [];
  const isPublished = sheet?.status === 'APPROVED';
  const isAwaitingReview = sheet?.status === 'SUBMITTED';

  if (user?.role === 'MANAGER') return <Navigate to="/editorial-desk" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/publishing-house" replace />;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside className="space-y-5">
        <div>
          <p className="text-sm font-black uppercase text-amberline">The Author</p>
          <h2 className="mt-1 text-3xl font-black">My Chronicle</h2>
          <p className="mt-2 text-sm text-slate-600">Status: {statusLabel(sheet?.status || 'DRAFT')}</p>
        </div>
        <ArcHealth arcHealth={data?.arcHealth} />
        <WeightageComposer goals={goals} />
        {isPublished ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="font-black">Your story is published.</p>
            <p className="mt-1 text-sm text-slate-600">Chapters are locked.</p>
          </div>
        ) : isAwaitingReview ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <p className="font-black">Your chronicle is awaiting the editor's review.</p>
            <p className="mt-1 text-sm text-slate-600">No changes can be made until it is returned or approved.</p>
          </div>
        ) : (
          <>
            <form onSubmit={addChapter} className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-black">Add a Chapter</h3>
              <input className="focus-ring mt-4 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="Chapter title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <input className="focus-ring mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="Thrust area" value={draft.thrustArea} onChange={(e) => setDraft({ ...draft, thrustArea: e.target.value })} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <select className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm" value={draft.uomType} onChange={(e) => setDraft({ ...draft, uomType: e.target.value })}>
                  <option>MIN</option><option>MAX</option><option>TIMELINE</option><option>ZERO</option>
                </select>
                <input className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm" type="number" min="10" placeholder="Weightage" value={draft.weightage} onChange={(e) => setDraft({ ...draft, weightage: Number(e.target.value) })} />
              </div>
              <input className="focus-ring mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Target" value={draft.target} onChange={(e) => setDraft({ ...draft, target: Number(e.target.value) })} />
              <Button className="mt-4 w-full" variant="amber"><Icon name="plus" /> Add a Chapter</Button>
            </form>
            <Button className="w-full" onClick={submit}><Icon name="send" /> Submit for Review</Button>
          </>
        )}
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </aside>
      <section className="relative">
        <div className="chapter-line absolute bottom-0 left-3 top-2 w-1 rounded-full" />
        <div className="space-y-5 pl-9">
          {goals.length === 0 && (
            <div className="rounded-lg border border-dashed border-amber-300 bg-white p-10 shadow-sm">
              <p className="text-sm font-black uppercase text-amberline">Blank first page</p>
              <h3 className="mt-2 text-2xl font-black text-ink">Your story hasn't started yet.</h3>
              <p className="mt-2 max-w-xl text-slate-600">Create your first chapter and start shaping this year's Chronicle.</p>
            </div>
          )}
          {goals.map((goal) => <ChapterCard key={goal.id} goal={goal} />)}
        </div>
      </section>
    </div>
  );
}
