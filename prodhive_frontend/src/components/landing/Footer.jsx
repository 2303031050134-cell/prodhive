import React from 'react';
import { Link } from 'react-router-dom';
import { Box, GitBranch, Globe, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand Info (2 Columns wide on tablet/desktop) */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
                <Box className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Prod<span className="text-indigo-400">Hive</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The modern software development workspace. Plan, track, code, review, and ship faster with your entire team.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-300 font-semibold">
                All systems operational
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3 text-xs sm:text-sm">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#ai-assistant" className="hover:text-white transition-colors">AI Assistant</a></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Free Plan</Link></li>
            </ul>
          </div>

          {/* Resources & Docs */}
          <div className="space-y-3 text-xs sm:text-sm">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Resources</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#api" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#changelog" className="hover:text-white transition-colors">Changelog</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">GitHub <ArrowUpRight className="w-3 h-3" /></a></li>
              <li><a href="#community" className="hover:text-white transition-colors">Community Discord</a></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3 text-xs sm:text-sm">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 ProdHive Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <GitBranch className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a href="https://prodhive.dev" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>Global Community</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
