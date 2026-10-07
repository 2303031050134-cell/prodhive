import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Sparkles, Building2 } from 'lucide-react';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Free Forever',
      badge: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'Essential planning and tracking tools for small developer teams.',
      features: [
        'Up to 5 team members',
        'Unlimited Kanban boards',
        'Basic issue tracking & labels',
        'GitHub repository sync (1 repo)',
        'Community Discord support',
      ],
      ctaText: 'Get Started Free',
      highlight: false,
    },
    {
      name: 'Pro Team',
      badge: 'Most Popular',
      price: isAnnual ? '$12' : '$15',
      period: 'per user / month',
      description: 'Complete development lifecycle automation for growing teams.',
      features: [
        'Unlimited team members',
        'Unlimited GitHub & GitLab repos',
        'Full AI Assistant suite (2,000 prompt runs/mo)',
        'Sprint analytics & velocity burndown',
        'Custom workflow automation rules',
        'Priority 24/7 support',
      ],
      ctaText: 'Start 14-Day Free Trial',
      highlight: true,
    },
    {
      name: 'Enterprise',
      badge: 'Security & Scale',
      price: 'Custom',
      period: 'tailored billing',
      description: 'Dedicated cloud instances, SSO, audit logs, and SLA guarantees.',
      features: [
        'SAML / Okta / Azure AD Single Sign-On',
        'Dedicated isolated database instance',
        'Unlimited AI Assistant runs & fine-tuning',
        'Custom SOC2 compliance & data residency',
        'Dedicated solutions engineer',
        '99.99% Uptime SLA',
      ],
      ctaText: 'Contact Enterprise Sales',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans mt-3">
            Simple plans for teams of any size
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Start for free with your whole team. Upgrade only when you need advanced AI and enterprise security.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 bg-slate-200/80 rounded-full text-xs font-bold">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                !isAnnual ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                isAnnual ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Annual Billing
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-extrabold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-6 sm:p-8 border transition-all duration-200 flex flex-col justify-between relative ${
                plan.highlight
                  ? 'border-indigo-600 shadow-2xl ring-2 ring-indigo-600/10 scale-[1.02]'
                  : 'border-slate-200 shadow-sm hover:border-indigo-300'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md">
                  Most Popular Choice
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {plan.badge}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    / {plan.period}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Includes:</p>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/register"
                  className={`w-full inline-flex items-center justify-center py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    plan.highlight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {plan.ctaText}
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
