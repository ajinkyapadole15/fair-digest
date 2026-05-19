import { useEffect, useState } from 'react';

/**
 * BiasMeter Component — Horizontal bias bar visualization
 * Shows: Far Left → Left → Center-Left → Center → Center-Right → Right → Far Right
 * Score: -100 (far left) to +100 (far right)
 * Animated marker at detected position
 */
export default function BiasMeter({ score = 0, label = 'Center' }) {
  const [animatedPosition, setAnimatedPosition] = useState(50);

  // Convert score (-100 to 100) to percentage (0 to 100)
  const position = ((score + 100) / 200) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPosition(position), 100);
    return () => clearTimeout(timer);
  }, [position]);

  const segments = [
    { label: 'Far Left', color: '#1d4ed8', range: [-100, -60] },
    { label: 'Left', color: '#3b82f6', range: [-60, -20] },
    { label: 'Center', color: '#6b7280', range: [-20, 20] },
    { label: 'Right', color: '#ef4444', range: [20, 60] },
    { label: 'Far Right', color: '#991b1b', range: [60, 100] },
  ];

  return (
    <div className="animate-fade-in-up delay-200">
      {/* Label Pill */}
      <div className="flex justify-end mb-1">
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-ink text-cream">
          {label}
        </span>
      </div>

      {/* Gradient bar */}
      <div className="relative mt-4 mb-2">
        {/* Track */}
        <div className="h-3 rounded-full overflow-hidden flex">
          <div className="flex-1 bg-gradient-to-r from-blue-800 to-blue-500"></div>
          <div className="flex-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
          <div className="flex-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300"></div>
          <div className="flex-1 bg-gradient-to-r from-red-300 to-red-500"></div>
          <div className="flex-1 bg-gradient-to-r from-red-500 to-red-800"></div>
        </div>

        {/* Animated marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ left: `${animatedPosition}%` }}
        >
          <div className="relative -translate-x-1/2">
            {/* Arrow */}
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-ink mx-auto -mb-[1px]"></div>
            {/* Dot */}
            <div className="w-5 h-5 rounded-full bg-ink border-2 border-cream shadow-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1">
        {segments.map((seg) => (
          <span
            key={seg.label}
            className={`text-[8px] sm:text-[9px] uppercase tracking-wider font-medium ${
              seg.label === label || 
              (label.includes('Center') && seg.label === 'Center') ||
              (label === 'Center-Left' && seg.label === 'Left') ||
              (label === 'Center-Right' && seg.label === 'Right')
                ? 'text-ink font-bold' 
                : 'text-ink-faint'
            }`}
          >
            {seg.label}
          </span>
        ))}
      </div>

      {/* Score display */}
      <div className="mt-3 text-center">
        <span className="text-[10px] font-mono text-ink-muted">
          Bias Score: <span className="font-bold text-ink">{score > 0 ? '+' : ''}{score}</span> / 100
        </span>
      </div>
    </div>
  );
}
