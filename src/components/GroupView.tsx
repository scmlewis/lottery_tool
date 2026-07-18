import { ActivityEntry } from '../types';

interface GroupViewProps {
  onAddActivity: (act: ActivityEntry) => void;
}

export default function GroupView(_props: GroupViewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Group Sort</h2>
      <p className="text-on-surface-variant text-sm">Group view — coming in Task 9</p>
    </div>
  );
}
