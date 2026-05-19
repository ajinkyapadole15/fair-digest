import { useState } from 'react';

/**
 * InputPanel Component — Left sidebar for article input
 * Toggle: [URL] [PASTE TEXT] tabs
 * Article URL input
 * Model selector: [CLAUDE SONNET 4.5] [GEMINI 3 FLASH]
 * CTA: ✦ GENERATE ETHICAL BRIEF
 */
export default function InputPanel({ onAnalyze, isLoading }) {
  const [inputMode, setInputMode] = useState('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-5');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    const payload = { model };
    if (inputMode === 'url') {
      if (!url.trim()) return;
      payload.url = url.trim();
    } else {
      if (!text.trim()) return;
      payload.text = text.trim();
    }
    
    onAnalyze(payload);
  };

  return (
    <div className="glass-card p-6 sm:p-8 animate-fade-in-up">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(201,168,76,0.5)]"></div>
        <h2 className="font-serif text-base font-bold tracking-[0.15em] uppercase text-ink">
          Article Input
        </h2>
      </div>

      <hr className="newspaper-rule mb-6" />

      {/* Input mode toggle */}
      <div className="flex bg-cream-dark/50 p-1.5 rounded-xl border border-border/60 mb-6">
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
            inputMode === 'url'
              ? 'bg-ink text-cream shadow-md'
              : 'text-ink-muted hover:text-ink hover:bg-cream-dark'
          }`}
        >
          ◇ URL
        </button>
        <button
          type="button"
          onClick={() => setInputMode('text')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
            inputMode === 'text'
              ? 'bg-ink text-cream shadow-md'
              : 'text-ink-muted hover:text-ink hover:bg-cream-dark'
          }`}
        >
          ◇ Paste Text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        {inputMode === 'url' && (
          <div className="animate-fade-in space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-ink-muted">
              Article URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.reuters.com/..."
              className="w-full px-4 py-3.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-ink-faint transition-all font-mono text-ink shadow-sm"
              disabled={isLoading}
              id="article-url-input"
            />
          </div>
        )}

        {/* Text Input */}
        {inputMode === 'text' && (
          <div className="animate-fade-in space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-ink-muted">
              Article Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full article text here..."
              rows={6}
              className="w-full px-4 py-3.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-ink-faint transition-all resize-none text-ink shadow-sm"
              disabled={isLoading}
              id="article-text-input"
            />
          </div>
        )}

        {/* Model selector */}
        <div className="space-y-2 pt-2">
          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-ink-muted">
            Analysis Model
          </label>
          <div className="flex bg-cream-dark/50 p-1 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setModel('claude-sonnet-4-5')}
              className={`flex-1 py-2 px-2 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                model === 'claude-sonnet-4-5'
                  ? 'bg-white text-ink shadow-sm border border-border-light'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Claude 4.5
            </button>
            <button
              type="button"
              onClick={() => setModel('gemini-3-flash')}
              className={`flex-1 py-2 px-2 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                model === 'gemini-3-flash'
                  ? 'bg-white text-ink shadow-sm border border-border-light'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Gemini 3
            </button>
            <button
              type="button"
              onClick={() => setModel('compare-all')}
              className={`flex-1 py-2 px-2 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                model === 'compare-all'
                  ? 'bg-white text-ink shadow-sm border border-border-light'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Compare All
            </button>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || (inputMode === 'url' ? !url.trim() : !text.trim())}
            className={`w-full py-4 px-6 rounded-xl text-sm font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer ${
              isLoading
                ? 'bg-ink-muted text-cream-dark cursor-wait shadow-inner'
                : 'bg-ink text-cream hover:bg-black hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            id="generate-brief-btn"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              '✦ Generate Ethical Brief'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
