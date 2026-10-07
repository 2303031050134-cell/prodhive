import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/shared/api/client';
import { useToast } from '@/shared/components/Toast';

const TRIGGERS = [
  ['PR_OPENED', 'PR opened'],
  ['REVIEW_APPROVED', 'Review approved'],
  ['CHANGES_REQUESTED', 'Changes requested'],
  ['PR_MERGED', 'PR merged'],
  ['ISSUE_CREATED', 'Issue created'],
  ['ISSUE_ASSIGNED', 'Issue assigned'],
];
const ACTIONS = [
  ['MOVE_ISSUE_TO_IN_REVIEW', 'Move issue to In Review'],
  ['MOVE_ISSUE_TO_IN_PROGRESS', 'Move issue to In Progress'],
  ['MOVE_ISSUE_TO_DONE', 'Move issue to Done'],
  ['NOTIFY_ASSIGNEE', 'Notify assignee'],
];

export default function AnalyticsPage() {
  const { projectId } = useParams();
  const toast = useToast();
  const [board, setBoard] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [burndown, setBurndown] = useState([]);
  const [velocity, setVelocity] = useState([]);
  const [cycleTime, setCycleTime] = useState(null);
  const [leadTime, setLeadTime] = useState(null);
  const [workload, setWorkload] = useState({});
  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ name: '', trigger: 'PR_OPENED', action: 'MOVE_ISSUE_TO_IN_REVIEW' });
  const [loading, setLoading] = useState(true);

  const loadRules = useCallback(() => api.get(`/core/projects/${projectId}/automations`).then(r => setRules(r.data)).catch(() => {}), [projectId]);

  useEffect(() => {
    api.get(`/core/boards?projectId=${projectId}`).then(async r => {
      if (!r.data.length) { setLoading(false); return; }
      const b = r.data[0];
      setBoard(b);
      const [sprintsRes, velRes, ctRes, ltRes, wlRes, hRes, summaryRes] = await Promise.all([
        api.get(`/core/sprints?boardId=${b.id}`),
        api.get(`/core/boards/${b.id}/analytics/velocity`),
        api.get(`/core/boards/${b.id}/analytics/cycle-time`),
        api.get(`/core/boards/${b.id}/analytics/lead-time`),
        api.get(`/core/boards/${b.id}/workload/by-assignee`),
        api.get(`/core/boards/${b.id}/workload/health`),
        api.get(`/core/boards/${b.id}/analytics/summary`),
      ]);
      setSprints(sprintsRes.data);
      setVelocity(velRes.data);
      setCycleTime(ctRes.data.avgHours);
      setLeadTime(ltRes.data.avgHours);
      setWorkload(wlRes.data);
      setHealth(hRes.data.score);
      setSummary(summaryRes.data);
      const active = sprintsRes.data.find(s => s.status === 'ACTIVE');
      if (active) setSelectedSprint(active.id);
      loadRules();
    }).catch(() => toast('Failed to load analytics', 'error'))
      .finally(() => setLoading(false));
  }, [projectId, toast, loadRules]);

  useEffect(() => {
    if (!board || !selectedSprint) return;
    api.get(`/core/boards/${board.id}/analytics/burndown?sprintId=${selectedSprint}`)
      .then(r => setBurndown(r.data)).catch(() => {});
  }, [board, selectedSprint]);

  const createRule = async () => {
    try {
      await api.post(`/core/projects/${projectId}/automations`, newRule);
      setNewRule({ name: '', trigger: 'PR_OPENED', action: 'MOVE_ISSUE_TO_IN_REVIEW' });
      loadRules();
      toast('Automation created', 'success');
    } catch (e) { toast(e?.response?.data?.message || 'Could not create automation', 'error'); }
  };

  const toggleRule = async rule => {
    try {
      await api.put(`/core/projects/${projectId}/automations/${rule.id}`, {
        name: rule.name, trigger: rule.trigger, action: rule.action, enabled: !rule.enabled,
      });
      loadRules();
    } catch { toast('Could not update automation', 'error'); }
  };

  const deleteRule = async id => {
    try { await api.delete(`/core/projects/${projectId}/automations/${id}`); loadRules(); }
    catch { toast('Could not delete automation', 'error'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!board) return <div className="empty-state"><p>No board found.</p></div>;

  const maxBurndown = Math.max(...burndown.map(d => d.remaining || 0), 1);
  const maxVelocity = Math.max(...velocity.map(v => v.completed || 0), 1);
  const issues = summary?.issues || {};
  const prs = summary?.pullRequests || {};
  const reviews = summary?.reviews || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Delivery health, review flow and project automation</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <Stat value={health ?? '—'} label="Project Health Score" accent />
        <Stat value={cycleTime != null ? `${cycleTime.toFixed(1)}h` : '—'} label="Avg Cycle Time" />
        <Stat value={leadTime != null ? `${leadTime.toFixed(1)}h` : '—'} label="Avg Lead Time" />
        <Stat value={issues.stale ?? '—'} label="Stale Issues" />
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <Stat value={issues.inProgress ?? 0} label="In Progress" />
        <Stat value={issues.inReview ?? 0} label="In Review" />
        <Stat value={prs.open ?? 0} label="Open PRs" />
        <Stat value={reviews.averageResponseHours != null ? `${reviews.averageResponseHours}h` : '—'} label="Avg Review Response" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 14 }}>Burndown Chart</div>
            <select className="input" style={{ width: 'auto', fontSize: 12 }} value={selectedSprint} onChange={e => setSelectedSprint(e.target.value)}>
              <option value="">Select Sprint</option>
              {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {burndown.length === 0 ? <Empty text="No burndown data" /> : <SimpleBarChart data={burndown} xKey="date" yKey="remaining" color="var(--accent)" max={maxBurndown} />}
        </div>
        <div className="card">
          <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 14, marginBottom: 16 }}>Velocity</div>
          {velocity.length === 0 ? <Empty text="No velocity data" /> : <SimpleBarChart data={velocity} xKey="sprintName" yKey="completed" color="var(--info)" max={maxVelocity} />}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 14, marginBottom: 16 }}>Delivery Flow</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {[['TODO', issues.todo], ['IN PROGRESS', issues.inProgress], ['IN REVIEW', issues.inReview], ['REOPENED', issues.reopened], ['DONE', issues.done]].map(([label, value]) => (
            <div key={label} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-heading)', marginTop: 5 }}>{value ?? 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 14, marginBottom: 16 }}>Workload by Assignee</div>
        {Object.keys(workload).length === 0 ? <Empty text="No workload data" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(workload).map(([userId, count]) => {
              const max = Math.max(...Object.values(workload));
              const pct = (count / max) * 100;
              return <div key={userId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>U</div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 60 }}>User #{userId}</span>
                <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 4, height: 8 }}><div style={{ width: `${pct}%`, background: 'var(--accent)', height: '100%', borderRadius: 4 }} /></div>
                <span style={{ fontSize: 12, color: 'var(--text)', minWidth: 30, textAlign: 'right' }}>{count}</span>
              </div>;
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 14 }}>Advanced Automation</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>Turn GitHub and issue events into predictable workflow actions.</div>
          </div>
          <span className="badge badge-success">{rules.filter(r => r.enabled).length} active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginTop: 16 }}>
          <input className="input" placeholder="Rule name" value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} />
          <select className="input" value={newRule.trigger} onChange={e => setNewRule({ ...newRule, trigger: e.target.value })}>{TRIGGERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select className="input" value={newRule.action} onChange={e => setNewRule({ ...newRule, action: e.target.value })}>{ACTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <button className="btn btn-primary" onClick={createRule}>Add rule</button>
        </div>

        <div style={{ marginTop: 16 }}>
          {rules.length === 0 ? <Empty text="No automation rules configured" /> : rules.map(rule => (
            <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <button className={`badge ${rule.enabled ? 'badge-success' : ''}`} onClick={() => toggleRule(rule)} style={{ border: 0, cursor: 'pointer' }}>{rule.enabled ? 'ON' : 'OFF'}</button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 600 }}>{rule.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{labelFor(TRIGGERS, rule.trigger)} <span style={{ margin: '0 5px' }}>→</span> {labelFor(ACTIONS, rule.action)}</div>
              </div>
              <button className="btn btn-ghost" onClick={() => deleteRule(rule.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, accent }) {
  return <div className="stat-card"><div className={`stat-value ${accent ? 'stat-accent' : ''}`}>{value}</div><div className="stat-label">{label}</div></div>;
}
function Empty({ text }) { return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{text}</div>; }
function labelFor(options, value) { return options.find(([v]) => v === value)?.[1] || value; }
function SimpleBarChart({ data, xKey, yKey, color, max }) {
  return <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, paddingBottom: 20 }}>
    {data.map((d, i) => { const h = Math.max((d[yKey] / max) * 120, 2); return <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d[yKey]}</span><div style={{ width: '100%', height: h, background: color, borderRadius: '3px 3px 0 0', opacity: .85 }} />
      <span style={{ fontSize: 9, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{String(d[xKey]).slice(0, 8)}</span>
    </div>; })}
  </div>;
}
