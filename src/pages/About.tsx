import React from 'react';
import { ShieldCheck, Globe, Cpu, Award, BookOpen, Mail } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { RiseShineLogo } from '../components/common/RiseShineLogo';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-brand-charcoal flex flex-col font-sans">
      <Header />
      <Navigation mobileOpen={false} onCloseMobile={() => {}} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-12">
        {/* Masthead Statement */}
        <div className="text-center space-y-4 border-b border-brand-border pb-10 mb-12">
          <RiseShineLogo size="lg" linkToHome={false} className="justify-center" />
          <h1 className="font-headline text-3xl sm:text-5xl font-black text-brand-blue tracking-tight max-w-2xl mx-auto leading-tight mt-4">
            Empowering Modern Society Through Autonomous Empirical Journalism
          </h1>
          <p className="text-sm sm:text-base text-brand-muted max-w-2xl mx-auto leading-relaxed">
            Rise ’n’ Shine – The AI Newspaper was conceived as an antidote to clickbait algorithms,
            shallow aggregations, and editorial opacity.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 rounded-xl border border-brand-border bg-white shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-xl font-bold text-brand-charcoal">
              True Multilingual Equality
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              We do not treat vernacular languages as second-class machine translations. Our English, Telugu,
              and Hindi desks operate independently with cultural nuance, local relevance, and bespoke broadsheet layouts.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-brand-border bg-white shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-emerald-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-xl font-bold text-brand-charcoal">
              AI Verification Protocols
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Every quantitative claim, computational forecast, and scientific summary undergoes rigorous
              adversarial verification to prevent algorithmic hallucination and maintain empirical fidelity.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-brand-border bg-white shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-xl font-bold text-brand-charcoal">
              Broadsheet Preservation
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              We believe in the cognitive power of the traditional newspaper broadsheet: visual hierarchy,
              deep column reading, and permanent archival editions stored securely directly in PostgreSQL.
            </p>
          </div>
        </div>

        {/* Editorial Standards Section */}
        <div className="border border-brand-border rounded-xl p-8 bg-gray-50/50 mb-16 space-y-6">
          <h2 className="font-headline text-2xl font-bold text-brand-blue">
            Editorial Charter & Code of Ethics
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-brand-charcoal leading-relaxed">
            <p>
              1. <strong>Verification First:</strong> No story is published solely on the basis of viral interest or synthetic speculation. All source data, government gazettes, and scientific benchmarks must be corroborative.
            </p>
            <p>
              2. <strong>Transparency of Synthesis:</strong> Whenever computational architectures generate visualizations, translations, or summaries, the algorithmic provenance is clearly attributed.
            </p>
            <p>
              3. <strong>Data Independence:</strong> Our publication operates without commercial tracker interference. We do not sell reader behavioural telemetry or compromise digital reading sanctity.
            </p>
          </div>
        </div>

        {/* Contact Block */}
        <div className="text-center p-8 border border-brand-border rounded-xl bg-white space-y-4">
          <h3 className="font-headline text-2xl font-bold text-brand-charcoal">
            Connect With the Editorial Board
          </h3>
          <p className="text-xs text-brand-muted max-w-md mx-auto">
            Questions, investigative leads, corrections, or inquiries regarding our multilingual publishing editions can be directed to our ombudsman.
          </p>
          <div className="pt-2">
            <a
              href="mailto:editorial@risenshine.com"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle"
            >
              <Mail className="w-4 h-4" />
              <span>editorial@risenshine.com</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
