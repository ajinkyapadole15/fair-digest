/* eslint-disable */
import BiasMeter from './BiasMeter';
import SourceIntelCard from './SourceIntelCard';

/**
 * ResultsCard Component — Main analysis results display
 * Sections: Summary, Bias Meter, Sentiment, Fact Signals, Counterpoints, Source Intel
 */
export default function ResultsCard({ data }) {
  if (!data) return null;

  const { title, summary, keyTakeaways, fakeNewsFactors, bias, sentiment, factSignals, counterpoints, sourceIntel, model, modelComparison, analyzedAt, executionMetrics } = data;

  const sentimentConfig = {
    Positive: { color: 'bg-green-100 text-green-700 border-green-300', icon: '😊' },
    Negative: { color: 'bg-red-100 text-red-700 border-red-300', icon: '😟' },
    Neutral: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '😐' },
    Mixed: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🤔' }
  };

  const getSentimentConfig = (label) => sentimentConfig[label] || sentimentConfig['Neutral'];

  return (
    <div className="h-full flex flex-col">
      {/* 1. Header & Summary */}
      <div className="glass-card p-6 sm:p-8 mb-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-ink-muted uppercase border border-border px-2 py-0.5 rounded-sm bg-white">
            {model === 'claude-sonnet-4-5' ? 'Claude 4.5' : model === 'gemini-3-flash' ? 'Gemini 3' : 'Ensemble Analysis'}
          </span>
          <span className="text-[10px] font-mono text-ink-faint">
            {new Date(analyzedAt).toLocaleTimeString()}
          </span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-ink leading-tight mb-4">
          {title}
        </h2>
        <div className="text-sm text-ink-light leading-relaxed font-serif first-letter:text-4xl first-letter:font-black first-letter:mr-1 first-letter:float-left first-letter:text-gold first-line:tracking-widest whitespace-pre-wrap">
          {summary}
        </div>
        
        {keyTakeaways && keyTakeaways.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border-light">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-3">Key Takeaways</h3>
            <ul className="space-y-2">
              {keyTakeaways.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-light">
                  <span className="text-gold font-bold mt-0.5">•</span>
                  <p>{point}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 2. Bias Meter */}
        <div className="glass-card p-5 sm:p-6 animate-fade-in-up delay-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono text-gold tracking-widest">02</span>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
              Political Bias
            </h3>
          </div>
          <BiasMeter score={bias.score} label={bias.label} />
        </div>

        {/* 3. Sentiment */}
        <div className="glass-card p-5 sm:p-6 animate-fade-in-up delay-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono text-gold tracking-widest">03</span>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
              Emotional Tone
            </h3>
          </div>
          <div className="flex items-center justify-center h-24">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${getSentimentConfig(sentiment.label).color}`}>
              <span className="text-3xl">{getSentimentConfig(sentiment.label).icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold uppercase tracking-wider">{sentiment.label}</span>
                <span className="text-[10px] opacity-80">Confidence: {sentiment.score}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Fact-Check Signals */}
      <div className="glass-card p-5 sm:p-6 mb-4 animate-fade-in-up delay-400">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-gold tracking-widest">04</span>
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
            Fact-Check Signals
          </h3>
        </div>
        {factSignals && factSignals.length > 0 ? (
          <ul className="space-y-2.5">
            {factSignals.map((signal, i) => (
              <li key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-border-light">
                <div className="mt-0.5">
                  {signal.checkable ? (
                    <div className="w-4 h-4 rounded border-2 border-gold flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-sm bg-gold"></div>
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded border-2 border-ink-faint"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ink leading-relaxed">{signal.claim}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-cream-dark rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-blue to-blue-400 transition-all duration-700"
                        style={{ width: `${signal.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-mono text-ink-muted">
                      {signal.confidence}% conf.
                    </span>
                    {signal.checkable && (
                      <span className="text-[8px] font-semibold uppercase tracking-wider text-accent-blue bg-blue-50 px-1.5 py-0.5 rounded">
                        Checkable
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink-muted italic">No specific fact-check signals identified.</p>
        )}
      </div>

      {/* 5. Counterpoints */}
      <div className="glass-card p-5 sm:p-6 mb-4 animate-fade-in-up delay-500">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-gold tracking-widest">05</span>
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
            Counterpoints
          </h3>
        </div>
        {counterpoints && counterpoints.length > 0 ? (
          <ul className="space-y-2">
            {counterpoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink-light">
                <span className="text-gold font-serif font-bold text-lg leading-none mt-0.5">»</span>
                <p className="leading-relaxed">{point}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink-muted italic">No counterpoints generated.</p>
        )}
      </div>



      {/* 6. Model Comparison (if applicable) */}
      {modelComparison && (
        <div className="glass-card p-5 sm:p-6 mb-4 animate-fade-in-up delay-[600ms]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono text-gold tracking-widest">06</span>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
              AI Model Comparison
            </h3>
          </div>
          <div className="p-4 bg-cream-dark/50 rounded-lg border border-border-light text-sm text-ink-light leading-relaxed whitespace-pre-wrap">
            {modelComparison}
          </div>
        </div>
      )}

      {/* 7. Source Intelligence */}
      {sourceIntel && (
        <div className="glass-card p-5 sm:p-6 mb-4">
          <SourceIntelCard sourceIntel={sourceIntel} />
        </div>
      )}



      {/* 9. Original Article Text */}
      {data.articleText && (
        <div className="glass-card p-5 sm:p-6 mb-4 animate-fade-in-up delay-[800ms]">
          <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={(e) => {
             const content = e.currentTarget.nextElementSibling;
             content.classList.toggle('hidden');
          }}>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
              Original Article Content
            </h3>
            <span className="text-xs text-gold underline">Show/Hide</span>
          </div>
          <div className="hidden mt-4 pt-4 border-t border-border-light">
            <div className="text-xs text-ink-light leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-4 custom-scrollbar">
              {data.articleText}
            </div>
          </div>
        </div>
      )}

      {/* Footer meta */}
      <div className="text-center py-3">
        <span className="text-[9px] font-mono text-ink-faint">
          Analyzed at {analyzedAt ? new Date(analyzedAt).toLocaleString() : new Date().toLocaleString()} · Powered by AI
        </span>
      </div>
    </div>
  );
}
