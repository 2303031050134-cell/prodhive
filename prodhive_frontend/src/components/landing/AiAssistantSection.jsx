import React, { useState } from 'react';
import { Sparkles, Bot, ArrowRight, Code, FileText, Bug, Check, Copy } from 'lucide-react';

export default function AiAssistantSection() {
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [copied, setCopied] = useState(false);

  const aiPrompts = [
    {
      title: 'Generate Issues',
      icon: Bug,
      promptText: 'Create issue from Sentry error: "Unhandled Promise Rejection: Redis connection timeout on auth worker"',
      output: `Title: [BUG] Handle Redis connection timeout in Auth Worker
Priority: High
Labels: #backend, #infrastructure, #sentry-autogen

Description:
Sentry detected repeated connection timeouts on Auth Worker node #3 during peak load.

Action Items:
1. Implement retry backoff algorithm in auth/redis.ts
2. Add healthcheck probe before dispatching session verification
3. Set alert threshold to 3 consecutive failures.`,
    },
    {
      title: 'Summarize Activity',
      icon: Bot,
      promptText: 'Summarize key achievements and blockers for Sprint 14 team standup.',
      output: `Sprint 14 Progress Summary:
✓ Merged 14 PRs including OAuth2 SSO migration & Postgres V2 schemas.
✓ Reduced API median latency from 120ms to 45ms.

⚠️ Current Blockers:
• PR #41 (Auth refresh edge case) waiting on security team review.
• 2 staging environment deploys pending Redis Sentinel test completion.`,
    },
    {
      title: 'Code Assistance',
      icon: Code,
      promptText: 'Draft GitHub PR description for feat/user-auth-impl branch.',
      output: `PR Summary: Refactor Authentication Flow to OAuth2 + PKCE

Key Changes:
- Replaced legacy session cookie strategy with PKCE OAuth2 flow
- Added refresh token rotation in AuthMiddleware.kt
- Wrote 18 integration tests covering token expiration edge cases

Testing Plan:
- [x] Verified unit tests pass locally (18/18)
- [x] E2E Auth flow validated on staging cluster`,
    },
    {
      title: 'Documentation',
      icon: FileText,
      promptText: 'Generate OpenAPI documentation for POST /v2/projects/create endpoint.',
      output: `/**
 * @openapi
 * /v2/projects/create:
 *   post:
 *     summary: Create new project workspace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Core API" }
 *               key: { type: string, example: "CORE" }
 */`,
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(aiPrompts[selectedPrompt].output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="ai-assistant" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI-POWERED DEVELOPER PLATFORM
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans mt-4">
            Your development workflow, with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-400">
              AI built in.
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            ProdHive AI assists your engineering team at every step — generating issues, drafting PR descriptions, writing documentation, and triaging blockers automatically.
          </p>
        </div>

        {/* Interactive AI Prompt Sandbox Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Preset Capabilities Switcher */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Select AI Capability
            </p>
            
            {aiPrompts.map((item, idx) => {
              const IconComp = item.icon;
              const isSelected = selectedPrompt === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedPrompt(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <IconComp className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">Automate developer tasks</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-400 translate-x-1' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Simulated AI Console Terminal */}
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4">
            
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">ProdHive AI Assistant Terminal</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 transition-colors border border-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Output'}</span>
              </button>
            </div>

            {/* Prompt Input Box */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-indigo-300 font-mono flex items-center gap-2">
              <span className="text-slate-500">PROMPT &gt;</span>
              <span className="text-slate-200">{aiPrompts[selectedPrompt].promptText}</span>
            </div>

            {/* AI Output Stream */}
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800/80 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto min-h-[180px]">
              <div className="text-slate-500 mb-2 font-sans text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI Generated Output:
              </div>
              <pre className="whitespace-pre-wrap font-mono">{aiPrompts[selectedPrompt].output}</pre>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
