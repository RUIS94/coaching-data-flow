import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  secondaryValue?: string;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  trendPositive?: boolean;
  onClick?: () => void;
  note?: string;
  noteSegments?: { text: string; tone?: 'default' | 'muted' | 'green' | 'amber' | 'red' }[];
  onNoteClick?: () => void;
}

export function KPICard({ label, value, secondaryValue, trend, trendLabel, trendPositive, onClick, note, noteSegments, onNoteClick }: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trendPositive
    ? 'text-status-green'
    : trend === 'flat'
      ? 'text-muted-foreground'
      : 'text-status-red';
  const toneClass = (tone?: 'default' | 'muted' | 'green' | 'amber' | 'red') =>
    tone === 'green'
      ? 'text-status-green'
      : tone === 'amber'
      ? 'text-status-amber'
      : tone === 'red'
      ? 'text-status-red'
      : 'text-muted-foreground';

  return (
    <div
      className={`flex flex-col justify-between rounded-lg border border-border bg-card p-4 min-h-[96px] transition-colors transition-transform duration-150 hover:shadow-sm hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' as const : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-baseline">
        <div className="relative inline-block pr-12">
          <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
          {secondaryValue && (
            <span className="absolute right-0 bottom-0 text-xs leading-none text-muted-foreground">
              {secondaryValue}
            </span>
          )}
        </div>
      </div>
      {noteSegments && noteSegments.length > 0 ? (
        <div
          className={`text-xs ${onNoteClick ? 'cursor-pointer' : ''}`}
          onClick={onNoteClick}
          role={onNoteClick ? 'button' as const : undefined}
          tabIndex={onNoteClick ? 0 : undefined}
        >
          {noteSegments.map((seg, idx) => (
            <span key={idx} className={toneClass(seg.tone)}>{seg.text}</span>
          ))}
        </div>
      ) : note ? (
        <div
          className={`text-xs text-muted-foreground ${onNoteClick ? 'cursor-pointer' : ''}`}
          onClick={onNoteClick}
          role={onNoteClick ? 'button' as const : undefined}
          tabIndex={onNoteClick ? 0 : undefined}
        >
          {note}
        </div>
      ) : trend ? (
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{trendLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
