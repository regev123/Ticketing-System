type CountdownCircleTimerProps = {
  secondsLeft: number;
  totalSeconds: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  hideWhenComplete?: boolean;
  textClassName?: string;
  trackColor?: string;
  activeRingColor?: string;
  expiredRingColor?: string;
};

function lerp(from: number, to: number, amount: number) {
  return Math.round(from + (to - from) * amount);
}

function countdownColor(ratio: number) {
  const transition = 1 - ratio;
  const start = { r: 59, g: 130, b: 246 }; // blue-500
  const end = { r: 148, g: 163, b: 184 }; // slate-400
  const r = lerp(start.r, end.r, transition);
  const g = lerp(start.g, end.g, transition);
  const b = lerp(start.b, end.b, transition);
  return `rgb(${r}, ${g}, ${b})`;
}

export function CountdownCircleTimer({
  secondsLeft,
  totalSeconds,
  size = 52,
  strokeWidth = 4,
  className = '',
  hideWhenComplete = true,
  textClassName = 'fill-slate-700',
  trackColor = '#e2e8f0',
  activeRingColor,
  expiredRingColor = '#94a3b8',
}: CountdownCircleTimerProps) {
  if (hideWhenComplete && secondsLeft <= 0) return null;

  const safeTotal = Math.max(1, totalSeconds);
  const clampedSeconds = Math.max(0, Math.min(secondsLeft, safeTotal));
  const ratio = clampedSeconds / safeTotal;
  const radius = Math.max(1, (size - strokeWidth * 2) / 2);
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);
  const ringColor = clampedSeconds <= 0
    ? expiredRingColor
    : (activeRingColor ?? countdownColor(ratio));

  return (
    <div className={`flex items-center text-xs text-slate-500 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Countdown timer">
        <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text x={center} y={center + 4} textAnchor="middle" className={`${textClassName} text-[11px] font-semibold`}>
          {clampedSeconds}
        </text>
      </svg>
    </div>
  );
}
