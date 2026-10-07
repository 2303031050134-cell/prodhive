import React from 'react';
import { X, Play, CheckCircle2, Sparkles, Box } from 'lucide-react';

export default function DemoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Box className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm sm:text-base">ProdHive Platform Demo (2 mins)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Simulation Canvas */}
        <div className="bg-slate-950 aspect-video relative flex items-center justify-center group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-slate-900 to-violet-950/40" />
          
          <div className="relative z-10 text-center space-y-4 max-w-md px-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30 group-hover:scale-110 transition-transform cursor-pointer">
              <Play className="w-7 h-7 fill-white ml-1" />
            </div>
            <h3 className="text-xl font-bold text-white">Watch ProdHive in Action</h3>
            <p className="text-xs text-slate-400">
              See how modern dev teams plan, sprint, link GitHub PRs, and utilize AI assistance in one unified platform.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Full HD 1080p
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Interactive Sandbox
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
