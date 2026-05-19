/* eslint-disable */
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import InputPanel from '../components/InputPanel';
import RecentBriefs from '../components/RecentBriefs';
import ResultsCard from '../components/ResultsCard';
import TodaysWire from '../components/TodaysWire';
import api from '../api/axios';

export default function Home({ user, onLogout }) {
  const [briefs, setBriefs] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const fetchBriefs = async () => {
    try {
      const res = await api.get('/briefs');
      if (res.data && res.data.data) {
        setBriefs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch briefs', err);
    }
  };

  // Fetch recent briefs on load
  useEffect(() => {
    fetchBriefs();
  }, [user]);

  const handleAnalyze = async (payload) => {
    setIsAnalyzing(true);
    setError(null);
    setCurrentResult(null);

    try {
      const res = await api.post('/analyze', payload);
      setCurrentResult(res.data.data);
      // Refresh briefs list to show the new one
      fetchBriefs();
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectBrief = (brief) => {
    // If it's just a summary from the list, we might need to fetch full details
    // But for this MVP, we assume the list has enough or we just display what we have
    // Actually, the backend /briefs returns a lean version.
    // If we want full details, we'd need a GET /api/briefs/:id.
    // For now, let's just show a simplified version or fetch if we add that endpoint.
    // Let's implement a quick mock set or full data if it was returned.
    if (brief.summary) {
      setCurrentResult(brief);
    } else {
       setError("Full brief details loading not fully implemented in this version.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-3 animate-fade-in">
            <span className="text-xl leading-none">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Input & History (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <InputPanel onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
            <RecentBriefs briefs={briefs} onSelect={handleSelectBrief} />
          </div>

          {/* Middle/Right Column: Results or Hero (6 cols) */}
          <div className="lg:col-span-6">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center p-12 glass-card">
                <div className="w-16 h-16 border-4 border-cream-dark border-t-gold rounded-full animate-spin mb-6"></div>
                <h3 className="font-serif text-xl font-bold text-ink mb-2">Analyzing Article</h3>
                <p className="text-sm text-ink-muted text-center max-w-sm">
                  Our AI is currently reading the article, extracting facts, assessing bias, and gathering source intelligence...
                </p>
              </div>
            ) : currentResult ? (
              <ResultsCard data={currentResult} />
            ) : (
              <div className="h-full flex flex-col relative overflow-hidden rounded-xl bg-navy border border-navy-light text-cream group min-h-[500px]">
                {/* Decorative background gears/pattern could go here via CSS or SVG */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 mb-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <span className="text-3xl">⚖️</span>
                  </div>
                  <h2 className="font-serif text-4xl sm:text-5xl font-black mb-4 leading-tight">
                    Read the news,<br/>
                    <span className="text-gold italic">and the bias too.</span>
                  </h2>
                  <p className="text-cream/70 text-sm max-w-md mx-auto mb-8">
                    Paste an article URL or text to generate a neutral summary, detect political bias, verify facts, and uncover source credibility.
                  </p>
                </div>

                {/* Bottom Features */}
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 border-t border-cream/10 bg-black/20">
                  <FeatureLabel num="01" label="BIAS METER" />
                  <FeatureLabel num="02" label="SENTIMENT" />
                  <FeatureLabel num="03" label="FACT SIGNALS" />
                  <FeatureLabel num="04" label="COUNTERPOINTS" />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Today's Wire (3 cols) */}
          <div className="lg:col-span-3">
            <TodaysWire />
          </div>

        </div>
      </main>
    </div>
  );
}

function FeatureLabel({ num, label }) {
  return (
    <div className="p-4 border-r border-cream/10 last:border-r-0 flex flex-col items-center justify-center text-center">
      <span className="text-[10px] font-mono text-gold mb-1">{num}</span>
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-cream/90">
        {label}
      </span>
    </div>
  );
}
