import React from 'react';

// Line Chart for Marks Trend
interface MarksTrendChartProps {
  data: { label: string; value: number; date?: string }[];
  targetValue?: number;
}

export const MarksTrendChart: React.FC<MarksTrendChartProps> = ({ data, targetValue = 80 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
        <p className="text-sm">No exam marks recorded yet</p>
        <span className="text-xs text-slate-400 mt-1">Log test scores in Performance Tracker to view trend</span>
      </div>
    );
  }

  const height = 200;
  const width = 500;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = Math.min(100, Math.max(100, ...data.map(d => d.value)));
  const minVal = Math.max(0, Math.min(...data.map(d => d.value)) - 10);
  const valRange = Math.max(20, maxVal - minVal);

  const getY = (val: number) => height - paddingY - ((val - minVal) / valRange) * (height - 2 * paddingY);
  const getX = (idx: number) =>
    data.length === 1 ? width / 2 : paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const targetY = getY(targetValue);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 select-none font-sans text-xs">
        {/* Subtle grid lines */}
        {[0, 25, 50, 75, 100].map(tick => {
          const y = getY(tick);
          if (y < paddingY || y > height - paddingY) return null;
          return (
            <g key={tick}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
              <text x={paddingX - 8} y={y + 4} textAnchor="end" fill="#94A3B8" fontSize="10">
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Target goal line */}
        {targetY >= paddingY && targetY <= height - paddingY && (
          <g>
            <line
              x1={paddingX}
              y1={targetY}
              x2={width - paddingX}
              y2={targetY}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            <text x={width - paddingX} y={targetY - 5} textAnchor="end" fill="#D97706" fontSize="10" fontWeight="500">
              Target ({targetValue}%)
            </text>
          </g>
        )}

        {/* Gradient fill under curve */}
        {data.length > 1 && (
          <defs>
            <linearGradient id="marksGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        )}

        {data.length > 1 && (
          <polygon
            points={`${paddingX},${height - paddingY} ${points} ${width - paddingX},${height - paddingY}`}
            fill="url(#marksGrad)"
          />
        )}

        {/* The trend line */}
        {data.length > 1 && (
          <polyline
            fill="none"
            stroke="#9333EA"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        )}

        {/* Data points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.value);
          return (
            <g key={i} className="group">
              <circle cx={cx} cy={cy} r="5" fill="#FFFFFF" stroke="#9333EA" strokeWidth="2.5" />
              <text
                x={cx}
                y={cy - 9}
                textAnchor="middle"
                fill="#4B5563"
                fontSize="10"
                fontWeight="600"
              >
                {Math.round(d.value)}%
              </text>
              <text
                x={cx}
                y={height - 10}
                textAnchor="middle"
                fill="#64748B"
                fontSize="9"
              >
                {d.label.length > 10 ? d.label.substring(0, 9) + '…' : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Bar Chart for Study Hours or Subject Marks
interface BarChartProps {
  data: { label: string; value: number; secondaryValue?: number; color?: string }[];
  maxValue?: number;
  valueLabel?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, maxValue, valueLabel = 'hrs' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
        <p className="text-sm">No activity data logged yet</p>
      </div>
    );
  }

  const calculatedMax = maxValue || Math.max(5, ...data.map(d => d.value * 1.2));

  return (
    <div className="space-y-3 py-2">
      {data.map((item, idx) => {
        const percent = Math.min(100, (item.value / calculatedMax) * 100);
        const pastelBg = item.color || '#BFDBFE'; // pastel blue default
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-700 truncate max-w-[200px]">{item.label}</span>
              <span className="text-slate-500 font-semibold">
                {item.value} {valueLabel}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: pastelBg }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Gauge / Ring Chart for Attendance
export const AttendanceGauge: React.FC<{ percentage: number; threshold?: number }> = ({
  percentage,
  threshold = 75
}) => {
  const radius = 42;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

  const isSafe = percentage >= threshold;
  const strokeColor = isSafe ? '#10B981' : '#F59E0B'; // Pastel emerald or amber

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative flex items-center justify-center">
        <svg width="110" height="110" className="transform -rotate-90">
          <circle
            cx="55"
            cy="55"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="55"
            cy="55"
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-xl font-bold text-slate-800">{Math.round(percentage)}%</span>
          <span className="block text-[10px] text-slate-500">Overall</span>
        </div>
      </div>
      <div className="mt-2 text-center text-xs">
        {isSafe ? (
          <span className="text-emerald-700 font-medium">Above {threshold}% min. requirement</span>
        ) : (
          <span className="text-amber-700 font-medium">Below {threshold}% attendance target</span>
        )}
      </div>
    </div>
  );
};

// Doughnut Chart for Completed vs Pending Tasks
export const TasksRatioDoughnut: React.FC<{ completed: number; pending: number }> = ({
  completed,
  pending
}) => {
  const total = completed + pending;
  if (total === 0) {
    return (
      <div className="h-36 flex flex-col items-center justify-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
        <p className="text-xs">No study tasks planned</p>
      </div>
    );
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const completedOffset = circumference - (completed / total) * circumference;

  return (
    <div className="flex items-center justify-around py-2">
      <div className="relative flex items-center justify-center">
        <svg width="96" height="96" className="transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#FEF08A" // pastel amber/yellow for pending
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#BBF7D0" // pastel green for completed
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={completedOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-base font-bold text-slate-800">{Math.round((completed / total) * 100)}%</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-slate-600">Completed:</span>
          <span className="font-semibold text-slate-800">{completed}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="text-slate-600">Pending:</span>
          <span className="font-semibold text-slate-800">{pending}</span>
        </div>
        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          Total: {total} task{total !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
