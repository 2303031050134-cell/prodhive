import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Play, CheckCircle2, Sparkles, GitPullRequest, 
  Search, Bell, Plus, Check, LayoutGrid, ListTodo, Calendar, 
  Map, GitBranch, Shield, BarChart3, ChevronDown, Layers, Box, Filter
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function HeroSection({ onOpenDemo }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Board');

  return (
    <section className="relative overflow-hidden bg-slate-50/60 pt-10 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-36 border-b border-slate-200/60">
      
      {/* Background Subtle Gradient Blobs (No glassmorphism, just soft ambient backdrop) */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN - Messaging & CTAs */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Built for Modern Development Teams
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-sans">
              Build. Track. Ship. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600">
                Together.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl mx-auto lg:mx-0">
              One workspace for your entire software development lifecycle. Plan, collaborate, code, and ship faster with ProdHive — the all-in-one platform for modern teams.
            </p>

            {/* Buttons / CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to={user ? "/app" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all duration-150 active:scale-[0.99]"
              >
                {user ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="w-4 h-4" />
              </Link>

              
              <button
                onClick={onOpenDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-base shadow-xs transition-all duration-150 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-indigo-600 ml-0.5" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Trust points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
                <span>Set up in minutes</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Realistic Application Dashboard Preview (Matching Reference Screenshot) */}
          <div className="lg:col-span-7 relative">
            
            {/* Outer Wrapper with subtle background accents */}
            <div className="relative mx-auto max-w-2xl lg:max-w-none">

              {/* 1. FLOATING WIDGET: Sprint Progress (Top-Left) */}
              <div className="hidden sm:flex absolute -top-8 -left-6 z-20 bg-white rounded-2xl p-4 shadow-xl border border-slate-200/90 items-center gap-4 w-60 animate-bounce-subtle">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  {/* SVG Donut Chart */}
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="22" stroke="#E2E8F0" strokeWidth="5" fill="transparent" />
                    <circle cx="28" cy="28" r="22" stroke="#4F46E5" strokeWidth="5" strokeDasharray="138" strokeDashoffset="44" fill="transparent" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-xs font-bold text-slate-900">68%</span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-800">Sprint Progress</p>
                  <div className="flex items-center justify-between text-slate-500 gap-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600" /> Completed</span>
                    <span className="font-bold text-slate-900">11</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 gap-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> In Progress</span>
                    <span className="font-bold text-slate-900">5</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 gap-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-300" /> Remaining</span>
                    <span className="font-bold text-slate-900">3</span>
                  </div>
                </div>
              </div>

              {/* 2. FLOATING WIDGET: GitHub Pull Request (Top-Right) */}
              <div className="hidden sm:flex absolute -top-6 -right-4 z-20 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-200/90 items-center gap-3 w-64">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">Pull Request #42</p>
                    <span className="text-[10px] text-slate-400">2m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Merged successfully
                  </p>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* MAIN SAAS DASHBOARD CONTAINER */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10">
                
                {/* Top Search & Action Bar */}
                <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    </div>
                  </div>
                  
                  {/* Search box */}
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-slate-200 text-slate-400 w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400 font-normal">Search...</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                      JD
                    </div>
                  </div>
                </div>

                {/* Dashboard Main View Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-slate-900">Product Development</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    {['Board', 'List', 'Timeline', 'Roadmap'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 rounded-md font-medium transition-all ${
                          activeTab === tab
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    New Issue
                  </button>
                </div>

                {/* Body Area: Sidebar + Kanban Board */}
                <div className="flex min-h-[360px] text-xs">
                  
                  {/* Left Mini Sidebar */}
                  <div className="w-40 sm:w-48 bg-slate-50/70 border-r border-slate-200 p-3 flex flex-col justify-between hidden sm:flex">
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold flex items-center gap-2 text-xs">
                        <Box className="w-4 h-4 text-indigo-600" />
                        Projects
                      </div>
                      <div className="px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-xs">
                        <ListTodo className="w-4 h-4 text-slate-400" />
                        Issues
                      </div>
                      <div className="px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-xs">
                        <Layers className="w-4 h-4 text-slate-400" />
                        Sprints
                      </div>
                      <div className="px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-xs">
                        <Map className="w-4 h-4 text-slate-400" />
                        Roadmap
                      </div>
                      <div className="px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-xs">
                        <GitBranch className="w-4 h-4 text-slate-400" />
                        GitHub
                      </div>
                      <div className="px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-xs">
                        <GitPullRequest className="w-4 h-4 text-slate-400" />
                        Pull Requests
                      </div>
                      <div className="px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-xs">
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        Analytics
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-400">
                      ProdHive v2.4
                    </div>
                  </div>

                  {/* Main Kanban Content Grid */}
                  <div className="flex-1 p-3.5 bg-slate-50/30 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* COLUMN 1: TO DO (8) */}
                    <div className="bg-slate-100/70 p-2.5 rounded-xl space-y-2 border border-slate-200/60">
                      <div className="flex items-center justify-between px-1 text-slate-700 font-bold text-xs">
                        <span>To Do</span>
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">8</span>
                      </div>

                      {/* Card 1 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs space-y-2 hover:border-indigo-300 transition-colors">
                        <p className="font-semibold text-slate-900 text-xs">Implement user authentication</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-semibold border border-rose-100">backend</span>
                            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-semibold border border-red-100">high</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[9px] flex items-center justify-center">AK</div>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs space-y-2 hover:border-indigo-300 transition-colors">
                        <p className="font-semibold text-slate-900 text-xs">Design landing page</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">frontend</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-semibold border border-amber-100">medium</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-violet-500 text-white font-bold text-[9px] flex items-center justify-center">SL</div>
                        </div>
                      </div>

                      {/* Card 3 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs space-y-2 hover:border-indigo-300 transition-colors">
                        <p className="font-semibold text-slate-900 text-xs">Set up CI/CD pipeline</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-semibold border border-purple-100">devops</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-semibold border border-amber-100">medium</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-[9px] flex items-center justify-center">MR</div>
                        </div>
                      </div>

                    </div>

                    {/* COLUMN 2: IN PROGRESS (4) */}
                    <div className="bg-slate-100/70 p-2.5 rounded-xl space-y-2 border border-slate-200/60">
                      <div className="flex items-center justify-between px-1 text-slate-700 font-bold text-xs">
                        <span>In Progress</span>
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">4</span>
                      </div>

                      {/* Card 1 */}
                      <div className="bg-white p-2.5 rounded-lg border border-indigo-200 shadow-xs space-y-2 relative">
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white" />
                        <p className="font-semibold text-slate-900 text-xs">Build Kanban board UI</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">frontend</span>
                            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-semibold border border-red-100">high</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">JD</div>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs space-y-2">
                        <p className="font-semibold text-slate-900 text-xs">API integration</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-semibold border border-rose-100">backend</span>
                            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-semibold border border-red-100">high</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">TN</div>
                        </div>
                      </div>

                      {/* Card 3 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs space-y-2">
                        <p className="font-semibold text-slate-900 text-xs">Write unit tests</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-100">testing</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-semibold border border-amber-100">medium</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[9px] flex items-center justify-center">AK</div>
                        </div>
                      </div>

                    </div>

                    {/* COLUMN 3: DONE (8) */}
                    <div className="bg-slate-100/70 p-2.5 rounded-xl space-y-2 border border-slate-200/60">
                      <div className="flex items-center justify-between px-1 text-slate-700 font-bold text-xs">
                        <span>Done</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">8</span>
                      </div>

                      {/* Card 1 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 opacity-90 space-y-2">
                        <p className="font-semibold text-slate-900 text-xs line-through text-slate-500">Project setup</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-semibold border border-purple-100">devops</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-100">low</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-slate-600 text-white font-bold text-[9px] flex items-center justify-center">MR</div>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 opacity-90 space-y-2">
                        <p className="font-semibold text-slate-900 text-xs line-through text-slate-500">Database schema</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-semibold border border-rose-100">backend</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-semibold border border-amber-100">medium</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[9px] flex items-center justify-center">AK</div>
                        </div>
                      </div>

                      {/* Card 3 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 opacity-90 space-y-2">
                        <p className="font-semibold text-slate-900 text-xs line-through text-slate-500">UI/UX improvements</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">frontend</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-100">low</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-violet-500 text-white font-bold text-[9px] flex items-center justify-center">SL</div>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* 3. FLOATING WIDGET: AI Assistant Badge (Bottom-Left) */}
              <div className="hidden sm:flex absolute -bottom-6 -left-4 z-20 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-200/90 items-center gap-3 w-64">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">AI Assistant</p>
                  <p className="text-[11px] text-slate-500 truncate">Generate issue, write code, create docs...</p>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
              </div>

              {/* 4. FLOATING WIDGET: Team Velocity Chart (Bottom-Right) */}
              <div className="hidden sm:flex absolute -bottom-8 -right-6 z-20 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-200/90 flex-col gap-2 w-56">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Team Velocity</p>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 flex items-center gap-0.5">
                    +12% ↗
                  </span>
                </div>
                {/* Mini Bar Chart */}
                <div className="flex items-end gap-1.5 h-8 pt-1 justify-between">
                  {[30, 45, 35, 60, 50, 75, 65, 85, 95].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-2.5 rounded-t-xs ${
                        i >= 6 ? 'bg-indigo-600' : 'bg-indigo-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
