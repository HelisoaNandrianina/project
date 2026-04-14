import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
  subtitle?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-primary-500', border: 'border-blue-100 dark:border-blue-800/30' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-success', border: 'border-green-100 dark:border-green-800/30' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: 'text-warning', border: 'border-yellow-100 dark:border-yellow-800/30' },
  red: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-danger', border: 'border-red-100 dark:border-red-800/30' },
};

export default function KPICard({ label, value, change, icon, color, subtitle }: KPICardProps) {
  const c = colorMap[color];
  const positive = change >= 0;

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-neutral-500 dark:text-dark-muted uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-dark-text leading-none">{value}</p>
          {subtitle && <p className="text-xs text-neutral-400 dark:text-dark-muted mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0 ${c.icon}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-dark-border flex items-center gap-1">
        {positive ? (
          <TrendingUp size={13} className="text-success shrink-0" />
        ) : (
          <TrendingDown size={13} className="text-danger shrink-0" />
        )}
        <span className={`text-xs font-semibold ${positive ? 'text-success' : 'text-danger'}`}>
          {positive ? '+' : ''}{change}%
        </span>
        <span className="text-xs text-neutral-400 dark:text-dark-muted">vs mois précédent</span>
      </div>
    </div>
  );
}
