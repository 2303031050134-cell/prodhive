import React, { useState } from 'react';
import { 
  BarChart3, LayoutGrid, GitBranch, GitPullRequest, 
  Sparkles, CheckCircle, Clock, AlertTriangle, ArrowUpRight, 
  UserCheck, ShieldCheck, ChevronRight, Filter, Search, Plus
} from 'lucide-react';

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState('kanban');

  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Product Deep Dive
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans mt-3">
            Designed like a real workspace. Built for engineering teams.
          </h2>
          <p className="mt-3 text-base text-slate-600">
            No fluff. ProdHive provides high-density, lightning-fast interfaces for managing your entire development workspace.
          </p>

          {/* Interactive Navigation Switcher */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center p-1.5 bg-slate-100 rounded-xl gap-1 border border-slate-200">
            {[
              { id: 'kanban', label: 'Kanban Board', icon: LayoutGrid },
              { id: 'github', label: 'GitHub & PR Sync', icon: GitPullRequest },
              { id: 'sprints', label: 'Sprint Analytics', icon: BarChart3 },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Interactive SaaS Window Frame */}
        <div className="bg-slate-900 rounded-2xl p-2 sm:p-3 border border-slate-800 shadow-2xl">
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            
            {/* Top Workspace Navbar */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-300 ml-2">ProdHive Workspace / Core-API-V2</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[11px] border border-slate-700">
                  ● Prod-Cluster Healthy
                </span>
              </div>
            </div>

            {/* TAB CONTENT 1: KANBAN BOARD */}
            {activeTab === 'kanban' && (
              <div className="p-4 sm:p-6 bg-slate-50 min-h-[420px] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Sprint 14 Active Issues</h3>
                    <p className="text-xs text-slate-500">18 total issues • 4 blocking PR reviews</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filter issues..."
                        className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
                    <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                      + Add Issue
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1 */}
                  <div className="space-y-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                      <span>Backlog & Ready</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">5</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-indigo-600">PROD-102</span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold">High</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">Configure Redis Sentinel failover strategy</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>Tag: #infrastructure</span>
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center">AK</div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-indigo-600">PROD-105</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold">Medium</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">Implement rate limiting for Auth Endpoints</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>Tag: #security</span>
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">JD</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                      <span>In Development</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">6</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-indigo-300 shadow-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-indigo-600">PROD-98</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-bold">PR Ready</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">Refactor WebSocket sync handler for real-time boards</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span className="text-indigo-600 font-semibold">PR #42 linked</span>
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">SL</div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-indigo-600">PROD-101</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">Normal</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">Migrate Postgres schemas to V2 migrations</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>Tag: #db</span>
                        <div className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[9px] flex items-center justify-center">MR</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="space-y-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                      <span>Shipped & Merged</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">7</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 line-through">PROD-89</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold">Merged</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 line-through text-slate-400">Add OAuth2 SSO Google login support</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>v2.3.8 Released</span>
                        <div className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-[9px] flex items-center justify-center">AK</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB CONTENT 2: GITHUB & PR SYNC */}
            {activeTab === 'github' && (
              <div className="p-4 sm:p-6 bg-slate-50 min-h-[420px] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">GitHub Repository & Pull Request Sync</h3>
                    <p className="text-xs text-slate-500">Connected to org/prodhive-core • 3 pending reviews</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    ● Webhooks Active
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 42, title: 'Refactor WebSocket sync handler for real-time boards', author: 'Sarah Lin', branch: 'feat/ws-sync', status: 'Approved & Passed CI', checks: '8/8 Checks', time: '12m ago' },
                    { id: 41, title: 'Fix JWT token refresh edge case on session expiration', author: 'Alex Kim', branch: 'fix/auth-refresh', status: 'Changes Requested', checks: '6/8 Checks', time: '1h ago' },
                    { id: 40, title: 'Add Prometheus metrics exporter for API latency', author: 'John Doe', branch: 'feat/metrics-export', status: 'Approved', checks: '8/8 Checks', time: '3h ago' },
                  ].map((pr) => (
                    <div key={pr.id} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          <GitPullRequest className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900">
                            #{pr.id} {pr.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            by <span className="font-semibold text-slate-700">{pr.author}</span> • Branch <code className="bg-slate-100 px-1 rounded text-indigo-600">{pr.branch}</code>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-700">
                          {pr.checks}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                          {pr.status}
                        </span>
                        <span className="text-slate-400">{pr.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: SPRINT ANALYTICS */}
            {activeTab === 'sprints' && (
              <div className="p-4 sm:p-6 bg-slate-50 min-h-[420px] space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Sprint 14 Performance Metrics</h3>
                    <p className="text-xs text-slate-500">Cycle Time: 1.8 days • PR Lead Time: 4.2 hours</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100">
                    Velocity +14% vs Sprint 13
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Completed Points</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">42 / 48</p>
                    <span className="text-[11px] text-emerald-600 font-bold">87.5% completion rate</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Avg PR Merge Time</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">3.4 hrs</p>
                    <span className="text-[11px] text-emerald-600 font-bold">↓ 45% faster than benchmark</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Active Contributors</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">12 Devs</p>
                    <span className="text-[11px] text-indigo-600 font-bold">100% sprint participation</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Defect Escapes</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">0 Bugs</p>
                    <span className="text-[11px] text-emerald-600 font-bold">Zero critical defects</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
