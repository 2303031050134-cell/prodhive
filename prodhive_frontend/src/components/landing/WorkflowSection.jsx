import React, { useState } from 'react';
import { 
  FileText, ListCheck, Code2, GitPullRequest, 
  LineChart, Rocket, CheckCircle2, ChevronRight 
} from 'lucide-react';

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'plan',
      name: 'Plan',
      icon: FileText,
      subtitle: 'Roadmaps & Backlog Grooming',
      description: 'Define product scope, groom user stories with AI, map epic timelines, and align engineering with business goals.',
      highlights: ['Interactive Epics & Milestones', 'Automated Backlog Prioritization', 'Resource & Capacity Planning'],
      codeSnippet: '// ProdHive Roadmap API\nconst epic = await prodhive.epics.create({\n  title: "V2 Microservices Architecture",\n  targetSprint: "Q4-S2"\n});',
    },
    {
      id: 'track',
      name: 'Track',
      icon: ListCheck,
      subtitle: 'Kanban & Issue Triage',
      description: 'Track bugs, user requests, and task assignments in real-time with customizable drag & drop Kanban boards.',
      highlights: ['Custom Workflows & Tags', 'Sub-task Dependency Trees', 'Automated Triage Rules'],
      codeSnippet: 'issue.onStatusChange((status) => {\n  if (status === "IN_PROGRESS") {\n    prodhive.notifyAssignees(issue.id);\n  }\n});',
    },
    {
      id: 'develop',
      name: 'Develop',
      icon: Code2,
      subtitle: 'Git Branch & CLI Integration',
      description: 'Link GitHub branches and commits automatically to issues. Use the ProdHive CLI to checkout feature branches with 1 command.',
      highlights: ['GitHub & GitLab Webhooks', '1-Click Branch Checkout', 'Real-time Commit Linking'],
      codeSnippet: '$ prodhive checkout issue-104\nSwitched to branch: feat/user-auth-impl\nLinked to Issue #104 (In Progress)',
    },
    {
      id: 'review',
      name: 'Review',
      icon: GitPullRequest,
      subtitle: 'Pull Requests & Automated CI Checks',
      description: 'Review code faster with inline PR comments, automatic status checks, and AI-generated change summaries.',
      highlights: ['AI Code Review Summaries', 'Automated PR Gate Checks', 'Direct Merge Approvals'],
      codeSnippet: 'PR #42: "Refactor auth middleware"\nStatus: 4/4 Checks Passed ✓\nAI Summary: Replaced JWT legacy with OAuth2.',
    },
    {
      id: 'analyze',
      name: 'Analyze',
      icon: LineChart,
      subtitle: 'Velocity & Cycle Time Metrics',
      description: 'Gain deep insight into your team’s delivery speed, burndown rate, lead time, and bottleneck alerts.',
      highlights: ['Sprint Burndown Charts', 'PR Merge Velocity Tracker', 'Team Capacity Heatmaps'],
      codeSnippet: 'Metric Report: Sprint 14\nVelocity: 42 Story Points (+14% vs avg)\nCycle Time: 1.8 Days (Industry top 5%)',
    },
    {
      id: 'ship',
      name: 'Ship',
      icon: Rocket,
      subtitle: 'Automated Releases & Changelogs',
      description: 'Publish release tags, automatically generate markdown release notes, and notify stakeholders instantly.',
      highlights: ['Automated Release Notes', 'Deployment Webhooks', 'Rollback Alert Triggers'],
      codeSnippet: '$ prodhive release tag v2.4.0\nGenerating Release Notes...\nPublished release notes to GitHub & Slack!',
    },
  ];

  return (
    <section id="capabilities" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Unified Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans mt-3">
            Connecting the entire software lifecycle
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Eliminate context switching. From initial planning to code deployment, ProdHive keeps your team in sync every step of the way.
          </p>
        </div>

        {/* Workflow Lifecycle Pipeline Bar */}
        <div className="relative mb-12">
          {/* Subtle Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 text-center cursor-pointer border ${
                    isActive
                      ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-600/10 scale-[1.02]'
                      : 'bg-white/80 border-slate-200 hover:border-indigo-300 hover:bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors mb-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <StepIcon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                    0{idx + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5">
                    {step.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Deep Dive Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Stage Overview */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                Stage {activeStep + 1} of 6 — {steps[activeStep].subtitle}
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {steps[activeStep].name}: {steps[activeStep].subtitle}
              </h3>

              <p className="text-slate-600 text-base leading-relaxed">
                {steps[activeStep].description}
              </p>

              <div className="pt-2 space-y-2.5">
                {steps[activeStep].highlights.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Stage Code / Visual Preview */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 sm:p-5 font-mono text-xs border border-slate-800 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-sans">prodhive-cli / stage_{steps[activeStep].id}</span>
                </div>
                <pre className="overflow-x-auto text-emerald-400 leading-relaxed font-mono">
                  <code>{steps[activeStep].codeSnippet}</code>
                </pre>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
