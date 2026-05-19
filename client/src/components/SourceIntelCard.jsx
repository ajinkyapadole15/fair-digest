import { useEffect, useState } from 'react';

/**
 * SourceIntelCard Component — Source Intelligence display
 * Shows: domain, IP, geolocation, ISP, threat level badge, risk gauge, signals
 */
export default function SourceIntelCard({ sourceIntel }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (sourceIntel?.riskScore != null) {
      const timer = setTimeout(() => setAnimatedScore(sourceIntel.riskScore), 200);
      return () => clearTimeout(timer);
    }
  }, [sourceIntel?.riskScore]);

  if (!sourceIntel) return null;

  const { domain, ip, country, city, isp, org, asn, threatLevel, riskScore, scoreBreakdown, signals, isHttps, credibilityNotes } = sourceIntel;

  const threatColors = {
    GREEN: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', label: 'Trusted Source', dot: 'bg-green-500' },
    YELLOW: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', label: 'Moderate Risk', dot: 'bg-yellow-500' },
    ORANGE: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', label: 'High Bias — Caution', dot: 'bg-orange-500' },
    RED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', label: 'Disinformation Risk', dot: 'bg-red-500' }
  };

  const threat = threatColors[threatLevel] || threatColors.YELLOW;

  // SVG circular gauge
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const gaugeColor = threatLevel === 'GREEN' ? '#22c55e' : 
                     threatLevel === 'YELLOW' ? '#eab308' : 
                     threatLevel === 'ORANGE' ? '#f97316' : '#ef4444';

  return (
    <div className="animate-fade-in-up delay-500">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-mono text-gold tracking-widest">06</span>
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
          Source Intelligence
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Score Gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-border-light">
          <div className="relative flex items-center justify-center w-28 h-28">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              {/* Score arc */}
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={gaugeColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="relative flex flex-col items-center mt-1">
              <span className="text-3xl font-bold font-mono text-ink leading-none">{animatedScore}</span>
              <span className="text-[9px] uppercase tracking-wider text-ink-muted mt-1">Risk Score</span>
            </div>
          </div>
          
          {/* Threat badge */}
          <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${threat.bg} ${threat.text} ${threat.border}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${threat.dot} mr-1.5`}></span>
            {threat.label}
          </div>

          {/* Score Breakdown */}
          {scoreBreakdown && (
            <div className="w-full mt-5 pt-4 border-t border-border-light space-y-2.5">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] uppercase tracking-wider text-ink-muted">
                  <span>Domain Reputation</span>
                  <span className="font-mono">{scoreBreakdown.domainReputation}</span>
                </div>
                <div className="h-1 bg-cream-dark rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: `${scoreBreakdown.domainReputation}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] uppercase tracking-wider text-ink-muted">
                  <span>Content Bias Risk</span>
                  <span className="font-mono">{scoreBreakdown.contentBias}</span>
                </div>
                <div className="h-1 bg-cream-dark rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400" style={{ width: `${scoreBreakdown.contentBias}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] uppercase tracking-wider text-ink-muted">
                  <span>Factuality Penalty</span>
                  <span className="font-mono">{scoreBreakdown.factuality}</span>
                </div>
                <div className="h-1 bg-cream-dark rounded-full overflow-hidden">
                  <div className="h-full bg-red-400" style={{ width: `${scoreBreakdown.factuality}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info table */}
        <div className="md:col-span-2 bg-white rounded-xl border border-border-light overflow-hidden">
          <table className="w-full text-xs">
            <tbody>
              <InfoRow label="Domain" value={domain} />
              <InfoRow label="IP Address" value={ip} mono />
              <InfoRow label="Country" value={country} />
              <InfoRow label="City" value={city} />
              <InfoRow label="ISP" value={isp} />
              <InfoRow label="Organization" value={org} />
              <InfoRow label="ASN" value={asn} mono />
              <InfoRow label="HTTPS" value={isHttps ? '✓ Secure' : '✗ Not Secure'} highlight={!isHttps} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Signals */}
      {signals && signals.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-xl border border-border-light">
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted mb-2">
            Threat Signals Detected
          </h4>
          <ul className="space-y-1.5">
            {signals.map((signal, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ink">
                {threatLevel === 'GREEN' ? (
                  <svg className="mt-0.5 w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <span className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${threat.dot}`}></span>
                )}
                {signal}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Credibility notes */}
      {credibilityNotes && (
        <div className="mt-3 p-3 bg-cream-dark rounded-lg">
          <p className="text-xs text-ink-muted italic">
            <span className="font-semibold not-italic text-ink">AI Assessment:</span> {credibilityNotes}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono = false, highlight = false }) {
  return (
    <tr className="border-b border-border-light last:border-0">
      <td className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-muted bg-cream/50 w-28">
        {label}
      </td>
      <td className={`px-4 py-2 ${mono ? 'font-mono' : ''} ${highlight ? 'text-accent-red font-semibold' : 'text-ink'}`}>
        {value || 'N/A'}
      </td>
    </tr>
  );
}
