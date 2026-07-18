import { AppMode, ActivityEntry } from '../types';

interface DashboardViewProps {
  onNavigate: (mode: AppMode) => void;
  activities: ActivityEntry[];
  lastWinnerName: string;
  lastWinnerCode: string;
}

export default function DashboardView({ onNavigate, activities, lastWinnerName, lastWinnerCode }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Dashboard</h2>
      <p className="text-on-surface-variant">Last winner: {lastWinnerName} ({lastWinnerCode})</p>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNavigate('wheel')} className="p-4 bg-surface-container rounded-lg">Wheel</button>
        <button onClick={() => onNavigate('number')} className="p-4 bg-surface-container rounded-lg">Number</button>
        <button onClick={() => onNavigate('group')} className="p-4 bg-surface-container rounded-lg">Group</button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Recent Activity</h3>
        {activities.map(a => (
          <div key={a.id} className="p-3 bg-surface-container rounded text-sm text-on-surface-variant">
            {a.title} — {a.subtitle}
          </div>
        ))}
        {activities.length === 0 && <p className="text-xs text-on-surface-variant/50">No activity yet</p>}
      </div>
    </div>
  );
}
