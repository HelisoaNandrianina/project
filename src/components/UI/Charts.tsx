interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showValues?: boolean;
  maxValue?: number;
}

export function BarChart({ data, height = 140, showValues = true, maxValue }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map(d => d.value)) * 1.15;
  const barWidth = 100 / (data.length * 2 - 1);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 200 ${height}`} className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * (height - 30);
          const x = i * (barWidth * 2) * 2;
          const y = height - 20 - barH;
          const color = d.color || '#2563EB';
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth * 2}
                height={barH}
                rx="3"
                fill={color}
                opacity="0.85"
                className="hover:opacity-100 transition-opacity cursor-pointer"
              />
              {showValues && (
                <text x={x + barWidth} y={y - 4} textAnchor="middle" className="fill-neutral-500 dark:fill-neutral-400" style={{ fontSize: 8, fontFamily: 'Inter' }}>
                  {d.value}
                </text>
              )}
              <text x={x + barWidth} y={height - 4} textAnchor="middle" style={{ fontSize: 7, fontFamily: 'Inter', fill: '#9CA3AF' }}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  filled?: boolean;
}

export function LineChart({ data, height = 120, color = '#2563EB', filled = true }: LineChartProps) {
  const values = data.map(d => d.value);
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.1;
  const w = 200;
  const h = height - 20;
  const step = w / (data.length - 1);

  const points = data.map((d, i) => ({
    x: i * step,
    y: h - ((d.value - min) / (max - min)) * h,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 200 ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {filled && <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} className="cursor-pointer" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={i * step} y={height - 2} textAnchor="middle" style={{ fontSize: 7, fontFamily: 'Inter', fill: '#9CA3AF' }}>
          {d.label}
        </text>
      ))}
    </svg>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function DonutChart({ data, size = 120 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 40;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const segments = data.map(d => {
    const pct = d.value / total;
    const dashArray = pct * circumference;
    const dashOffset = -(cumulative * circumference);
    cumulative += pct;
    return { ...d, dashArray, dashOffset, pct };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${seg.dashArray} ${circumference - seg.dashArray}`}
            strokeDashoffset={seg.dashOffset + circumference / 4}
            className="cursor-pointer hover:opacity-90 transition-opacity"
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 700, fill: '#111827' }} className="dark:fill-neutral-200">
          {total}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" style={{ fontSize: 7, fontFamily: 'Inter', fill: '#9CA3AF' }}>
          Total
        </text>
      </svg>
      <div className="space-y-2 min-w-0">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-neutral-600 dark:text-dark-muted truncate">{d.label}</span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-dark-text ml-auto">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MiniSparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function MiniSparkline({ data, color = '#10B981', width = 80, height = 32 }: MiniSparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const step = width / (data.length - 1);
  const points = data.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / (max - min || 1)) * (height - 4) - 2,
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return (
    <svg width={width} height={height}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
