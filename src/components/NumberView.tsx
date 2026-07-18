import { NumberBatchEntry, ActivityEntry } from '../types';

interface NumberViewProps {
  batches: NumberBatchEntry[];
  onAddBatch: (batch: NumberBatchEntry) => void;
  onAddActivity: (act: ActivityEntry) => void;
}

export default function NumberView(_props: NumberViewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Number Draw</h2>
      <p className="text-on-surface-variant text-sm">Number view — coming in Task 8</p>
    </div>
  );
}
