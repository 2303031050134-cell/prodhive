import React, { useState } from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import WorkflowSection from '../components/landing/WorkflowSection';
import ProductShowcase from '../components/landing/ProductShowcase';
import AiAssistantSection from '../components/landing/AiAssistantSection';
import AnalyticsSection from '../components/landing/AnalyticsSection';
import PricingSection from '../components/landing/PricingSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/landing/Footer';
import DemoModal from '../components/landing/DemoModal';

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-500/20">
      {/* Sticky Navbar */}
      <Navbar onOpenDemo={() => setDemoOpen(true)} />

      {/* Hero Section */}
      <HeroSection onOpenDemo={() => setDemoOpen(true)} />

      {/* Features Overview */}
      <FeaturesGrid />

      {/* Product Capabilities Workflow */}
      <WorkflowSection />

      {/* Product Showcase Deep Dive */}
      <ProductShowcase />

      {/* AI Assistant Dedicated Feature */}
      <AiAssistantSection />

      {/* Analytics & Metrics */}
      <AnalyticsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Final Call to Action */}
      <CtaSection />

      {/* Comprehensive Footer */}
      <Footer />

      {/* Demo Video Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
