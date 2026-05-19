import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * TodaysWire Component — News feed panel
 * Fetches and displays today's top headlines from /api/wire
 */
export default function TodaysWire() {
  const [headlines, setHeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWire = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/wire');
        setHeadlines(response.data.data || []);
      } catch (err) {
        setError('Failed to load news wire');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWire();
  }, []);

  return (
    <div className="glass-card p-6 sm:p-8 flex flex-col max-h-[500px] lg:max-h-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-red shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse shrink-0"></div>
          <h2 className="font-serif text-xl font-bold tracking-[0.1em] uppercase text-ink leading-none mt-1">
            Today's Wire
          </h2>
        </div>
        {!isLoading && headlines.length > 0 && (
          <span className="text-[10px] font-mono font-bold text-cream bg-ink px-2.5 py-1 rounded-full shadow-sm shrink-0">
            {headlines.length}
          </span>
        )}
      </div>

      <hr className="newspaper-rule-thick mb-6" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-cream-dark rounded w-20 mb-2"></div>
                <div className="h-4 bg-cream-dark rounded w-full mb-1"></div>
                <div className="h-4 bg-cream-dark rounded w-4/5"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-xs text-accent-red">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink underline"
            >
              Retry
            </button>
          </div>
        ) : headlines.length === 0 ? (
          <p className="text-xs text-ink-muted italic text-center py-8">No headlines available right now.</p>
        ) : (
          <ul className="space-y-5">
            {headlines.map((item, index) => (
              <li key={index} className="group">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-ink-muted border border-border px-1.5 py-0.5 rounded-sm group-hover:border-ink group-hover:text-ink transition-colors">
                    {item.source}
                  </span>
                  <span className="text-[9px] font-mono text-ink-faint">
                    {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group-hover:text-gold transition-colors"
                >
                  <h3 className="text-sm font-serif font-bold text-ink leading-tight flex items-start gap-1">
                    {item.title}
                    <svg className="w-3 h-3 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </h3>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
