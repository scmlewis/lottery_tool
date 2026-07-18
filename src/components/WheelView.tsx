import { Contestant, WinnerHistoryEntry, ActivityEntry } from '../types';

interface WheelViewProps {
  contestants: Contestant[];
  onAddContestant: (name: string) => void;
  onDeleteContestant: (id: string) => void;
  winnerHistory: WinnerHistoryEntry[];
  onAddWinner: (name: string) => void;
  onAddActivity: (act: ActivityEntry) => void;
}

export default function WheelView(_props: WheelViewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Wheel</h2>
      <p className="text-on-surface-variant text-sm">Wheel view — coming in Task 7</p>
    </div>
  );
}
