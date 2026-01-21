import { memo } from 'react';

interface MetricRowProps {
  label: string;
  value: string | number;
  unit: string;
  percent: number;
  gradient: string;
  extra?: React.ReactNode;
}

function MetricRowComponent({ label, value, unit, percent, gradient, extra }: MetricRowProps) {
  return (
    <div className="py-1.5">
      <div className="flex items-center gap-3">
        <div className="w-28 shrink-0">
          <div className="text-muted-foreground text-xs uppercase">{label}</div>
          <div className="text-muted-foreground text-xs flex items-center gap-1">
            {value} {unit} {extra && <span className="text-muted-foreground flex items-center gap-0.5">{extra}</span>}
          </div>
        </div>
        <div className="w-32 h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded transition-all duration-300"
            style={{
              width: `${Math.max(percent, 3)}%`,
              background: gradient,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export const MetricRow = memo(MetricRowComponent);
