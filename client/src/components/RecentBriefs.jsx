/**
 * RecentBriefs Component — Shows history of past analysis briefs
 * Displays title + model badge, clickable to reload
 */
export default function RecentBriefs({ briefs, onSelect }) {
  return (
    <div className="glass-card p-6 sm:p-8 mt-6 animate-fade-in-up delay-200">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(201,168,76,0.5)]"></div>
          <h3 className="font-serif text-base font-bold tracking-[0.15em] uppercase text-ink">
            Recent Briefs
          </h3>
        </div>
        {briefs.length > 0 && (
          <span className="text-[10px] font-mono text-cream bg-ink px-2.5 py-1 rounded-full shadow-sm">
            {briefs.length}
          </span>
        )}
      </div>

      <hr className="newspaper-rule mb-5" />

      {briefs.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-2xl mb-2 opacity-30">📰</div>
          <p className="text-xs text-ink-faint italic">
            No briefs yet. Analyze an article to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
          {briefs.map((brief, index) => (
            <li key={brief._id || index}>
              <button
                onClick={() => onSelect(brief)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-cream-dark transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink truncate group-hover:text-gold transition-colors">
                      {brief.title || 'Untitled Brief'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono text-ink-faint uppercase tracking-wider">
                        {brief.model === 'claude-sonnet-4-5' ? 'Claude' : brief.model}
                      </span>
                      {brief.bias?.label && (
                        <>
                          <span className="text-border">·</span>
                          <span className="text-[9px] text-ink-faint">
                            {brief.bias.label}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg className="w-3.5 h-3.5 text-ink-faint group-hover:text-gold mt-0.5 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
