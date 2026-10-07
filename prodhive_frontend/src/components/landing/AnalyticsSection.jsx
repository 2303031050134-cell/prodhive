import React from 'react';
import { Users, Shield, FolderGit2, Zap, ArrowUpRight, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function AnalyticsSection() {
  const metrics = [
    {
      icon: Users,
      value: '10K+',
      label: 'Active Developers',
      change: '+24% this month',
    },
    {
      icon: Shield,
      value: '2K+',
      label: 'Engineering Teams',
      change: 'Worldwide adoption',
    },
    {
      icon: FolderGit2,
      value: '50K+',
      label: 'Projects Managed',
      change: 'Over 2.4M issues closed',
    },
    {
      icon: Zap,
      value: '99.9%',
      label: 'Uptime SLA',
      change: 'Enterprise Grade Reliability',
    },
  ];

  return (
    <section id="analytics" className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bottom Metric Cards Row Matching Reference Image Footer Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 flex items-center gap-4 hover:border-indigo-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <IconComponent className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                    {item.value}
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
