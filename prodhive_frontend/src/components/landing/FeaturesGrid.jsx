import React from 'react';
import { 
  LayoutGrid, AlertCircle, Zap, Map, GitBranch, 
  GitPullRequest, BarChart2, Sparkles 
} from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    {
      icon: LayoutGrid,
      title: 'Kanban Boards',
      description: 'Visualize your work with intuitive drag & drop boards.',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      icon: AlertCircle,
      title: 'Issues',
      description: 'Track, prioritize and resolve issues efficiently.',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      icon: Zap,
      title: 'Sprints',
      description: 'Stay on schedule with iterative development.',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      icon: Map,
      title: 'Roadmaps',
      description: 'Plan for the future with long-term vision.',
      color: 'text-violet-600 bg-violet-50 border-violet-100',
    },
    {
      icon: GitBranch,
      title: 'GitHub Integration',
      description: 'Sync your code and manage repositories.',
      color: 'text-slate-800 bg-slate-100 border-slate-200',
    },
    {
      icon: GitPullRequest,
      title: 'Pull Requests',
      description: 'Review and merge with confidence.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      icon: BarChart2,
      title: 'Analytics',
      description: 'Measure progress with real insights.',
      color: 'text-sky-600 bg-sky-50 border-sky-100',
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'Work smarter with AI-powered help.',
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
  ];

  return (
    <section id="features" className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Everything your team needs to deliver
          </h2>
          <p className="mt-3 text-base text-slate-600">
            A cohesive suite of developer tools designed for velocity, clarity, and collaboration.
          </p>
        </div>

        {/* 8 Feature Items Grid (Flat, minimal, line icon styling as in reference bottom row) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-3">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col items-start justify-between min-h-[160px]"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${feature.color}`}>
                  <IconComponent className="w-5 h-5 stroke-[2]" />
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-snug line-clamp-3">
                    {feature.description}
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
