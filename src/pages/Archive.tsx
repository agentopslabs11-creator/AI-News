import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Archive as ArchiveIcon, Calendar, BookOpen, ChevronRight, Filter, Search, Clock } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { LanguageBadge } from '../components/common/LanguageBadge';
import { newspaperService } from '../services/newspaper';
import { ArchiveTreeResponse, ArchiveYear, LanguageCode } from '../types';
import { isTodayDate } from '../utils/date';

export const Archive: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [archiveData, setArchiveData] = useState<ArchiveTreeResponse | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Search date
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    async function loadArchive() {
      try {
        setLoading(true);
        const data = await newspaperService.getArchiveTree(
          (selectedLanguage as LanguageCode) || undefined
        );
        setArchiveData(data);
      } catch (err) {
        console.error('Failed to load archive:', err);
      } finally {
        setLoading(false);
      }
    }
    loadArchive();
  }, [selectedLanguage]);

  // Check if today's edition is already published
  const hasTodayEdition = Boolean(
    archiveData?.years?.some((y) =>
      y.months?.some((m) =>
        m.days?.some((d) => isTodayDate(d.date))
      )
    )
  );

  return (
    <div className="min-h-screen bg-white text-brand-charcoal flex flex-col font-sans">
      <Header
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
      />
      <Navigation
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <main className="flex-1 w-full px-4 sm:px-8 py-8">
        {/* Archive Title */}
        <div className="border-b border-brand-border pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brand-green/30 border border-brand-green text-brand-charcoal text-xs font-black uppercase tracking-wider mb-2">
              <ArchiveIcon className="w-3.5 h-3.5 text-brand-blue" />
              <span>Previous Papers & Broadsheets</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl font-black text-brand-charcoal tracking-tight">
              Previous Papers
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-2">
              Browse and read all previous newspaper editions across English, తెలుగు, and हिंदी by publication year, month, and date.
            </p>
          </div>

          {/* Language filter pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setSelectedLanguage('')}
              className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                selectedLanguage === ''
                  ? 'bg-brand-charcoal text-white shadow-sm'
                  : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
              }`}
            >
              All Languages
            </button>
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                selectedLanguage === 'en'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('te')}
              className={`px-3 py-1.5 rounded-full font-bold transition-colors font-telugu ${
                selectedLanguage === 'te'
                  ? 'bg-brand-green text-brand-charcoal shadow-sm'
                  : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setSelectedLanguage('hi')}
              className={`px-3 py-1.5 rounded-full font-bold transition-colors font-hindi ${
                selectedLanguage === 'hi'
                  ? 'bg-brand-yellow text-brand-charcoal shadow-sm'
                  : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* If Today's Edition is Not Yet Uploaded, show reassurance banner */}
        {!loading && !hasTodayEdition && (
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-amber-800 animate-pulse" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-brand-charcoal">
                  Today's Edition Not Yet Uploaded
                </p>
                <p className="text-xs text-brand-muted">
                  Our editorial desk is currently assembling today’s broadsheet. In the meantime, browse and read all previous newspaper editions below.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md self-start sm:self-auto flex-shrink-0">
              In Production
            </span>
          </div>
        )}

        {/* Archive Hierarchy Display */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-brand-blue border-t-brand-green rounded-full animate-spin" />
            <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Compiling Historical Editions Tree...
            </p>
          </div>
        ) : archiveData && archiveData.years.length > 0 ? (
          <div className="space-y-12">
            {archiveData.years.map((yearGroup) => (
              <div key={yearGroup.year} className="border border-brand-border rounded-xl p-6 bg-white shadow-subtle">
                {/* Year Header */}
                <div className="flex items-center gap-3 border-b-2 border-brand-charcoal pb-4 mb-6">
                  <span className="font-headline text-3xl sm:text-4xl font-black text-brand-blue">
                    {yearGroup.year}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                    Annual Volume
                  </span>
                </div>

                {/* Months Grid */}
                <div className="space-y-8">
                  {yearGroup.months.map((monthGroup) => (
                    <div key={monthGroup.month_num} className="space-y-4">
                      {/* Month Banner */}
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow" />
                        <h3 className="font-headline text-xl sm:text-2xl font-bold text-brand-charcoal">
                          {monthGroup.month_name}
                        </h3>
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {monthGroup.days.map((dayGroup) => (
                          <div
                            key={dayGroup.date}
                            className="border border-brand-border rounded-lg p-4 bg-gray-50/50 hover:bg-white hover:border-brand-blue/50 transition-all shadow-subtle flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2 text-xs font-bold text-brand-charcoal mb-3">
                                <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                                <span>
                                  {new Date(dayGroup.date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>

                              {/* Available Editions on this Date */}
                              <div className="space-y-2">
                                {dayGroup.editions.map((ed) => (
                                  <Link
                                    key={ed.id}
                                    to={`/epaper?lang=${ed.language}&date=${ed.publication_date}`}
                                    className="group flex items-center justify-between p-2 rounded border border-brand-border bg-white hover:border-brand-blue hover:shadow-sm transition-all"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                      <LanguageBadge language={ed.language} size="sm" />
                                      <span className="text-xs font-semibold text-brand-charcoal group-hover:text-brand-blue truncate">
                                        {ed.language === 'en'
                                          ? 'English Edition'
                                          : ed.language === 'te'
                                          ? 'తెలుగు ఎడిషన్'
                                          : 'हिंदी संस्करण'}
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-bold text-brand-blue group-hover:translate-x-0.5 transition-transform flex-shrink-0 flex items-center">
                                      Read <ChevronRight className="w-3.5 h-3.5" />
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-brand-border/60 text-[10px] text-brand-muted">
                              {dayGroup.editions.length} edition(s) published
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-brand-border rounded-xl bg-gray-50/50">
            <ArchiveIcon className="w-12 h-12 text-brand-muted mx-auto mb-3" />
            <h3 className="font-headline text-xl font-bold text-brand-charcoal">
              No historical editions found
            </h3>
            <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
              As daily editions are published through the admin dashboard, they will automatically appear here.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
