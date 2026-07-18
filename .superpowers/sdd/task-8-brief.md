# Task 8: Group View Component

**Files:**
- Create: `src/components/GroupView.tsx`
- Modify: None

**Interfaces:**
- Consumes: GroupAssignment, ActivityEntry
- Produces: Group view with member management and CSV export

- [ ] **Step 1: Create src/components/GroupView.tsx**

```typescript
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GroupAssignment, ActivityEntry } from '../types';

const GROUP_NAME_TEMPLATES = [
  'Alpha Vanguard',
  'Onyx Collective',
  'Elysian Concord',
  'Obsidian Syndicate',
  'Valkyrie Assembly',
  'Midnight Order',
  'Gilded Assembly',
  'Sovereign Circle',
  'Zephyr Division',
  'Aether Cadre',
];

const ACCENT_COLORS = [
  'border-primary',
  'border-secondary-container',
  'border-emerald-500',
  'border-blue-500',
  'border-purple-500',
  'border-rose-500',
  'border-cyan-500',
  'border-amber-500',
];

const PRESET_MEMBERS = `Julian Thorne
Elena Vance
Marcus Chen
Sofia Rossi
Dominic Kaine
Arlo Sterling
Lydia Wells`;

interface GroupViewProps {
  onAddActivity: (activity: ActivityEntry) => void;
}

export default function GroupView({ onAddActivity }: GroupViewProps) {
  const [registryText, setRegistryText] = useState(PRESET_MEMBERS);
  const [strategy, setStrategy] = useState<'count' | 'size'>('count');
  const [strategyVal, setStrategyVal] = useState(4);
  const [groups, setGroups] = useState<GroupAssignment[]>([
    {
      id: 'g-1',
      name: 'Alpha Vanguard',
      members: ['Julian Thorne', 'Elena Vance', 'Marcus Chen', 'Sofia Rossi'],
      color: 'border-primary',
    },
    {
      id: 'g-2',
      name: 'Onyx Collective',
      members: ['Dominic Kaine', 'Arlo Sterling', 'Lydia Wells'],
      color: 'border-secondary-container',
    },
  ]);

  const handleOrganize = () => {
    const names = registryText
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length === 0) {
      alert('Please enter at least one member name.');
      return;
    }

    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let calculatedGroupCount = 4;
    if (strategy === 'count') {
      calculatedGroupCount = Math.min(strategyVal, shuffled.length);
    } else {
      calculatedGroupCount = Math.ceil(shuffled.length / Math.max(1, strategyVal));
    }

    const newGroups: GroupAssignment[] = Array.from({ length: calculatedGroupCount }, (_, i) => ({
      id: `group-assign-${i}-${Date.now()}`,
      name: GROUP_NAME_TEMPLATES[i % GROUP_NAME_TEMPLATES.length] || `Group ${i + 1}`,
      members: [],
      color: ACCENT_COLORS[i % ACCENT_COLORS.length],
    }));

    shuffled.forEach((name, index) => {
      const targetGroupIdx = index % calculatedGroupCount;
      newGroups[targetGroupIdx].members.push(name);
    });

    const filteredGroups = newGroups.filter((g) => g.members.length > 0);
    setGroups(filteredGroups);

    const randomCode = '#' + Math.floor(1000 + Math.random() * 9000);
    onAddActivity({
      id: 'act-' + Date.now(),
      title: `Organized ${filteredGroups.length} groups`,
      subtitle: 'Group Mode',
      type: 'group',
      code: randomCode,
      timestamp: Date.now(),
    });
  };

  const handleCopyLists = () => {
    if (groups.length === 0) return;
    const text = groups
      .map((g) => `${g.name} (${g.members.length} members):\n` + g.members.map((m) => ` - ${m}`).join('\n'))
      .join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Group lists copied to clipboard!');
  };

  const handleExportCSV = () => {
    if (groups.length === 0) return;
    const rows = [['Group', 'Member']];
    groups.forEach((g) => {
      g.members.forEach((m) => {
        rows.push([g.name, m]);
      });
    });
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'groups.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-12"
    >
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-2 font-headline">Group Mode</h2>
        <p className="text-on-surface-variant max-w-md text-sm md:text-base leading-relaxed">
          Orchestrate your assembly with tactical precision. Define your members and let the atelier weave the perfect synergy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-5 space-y-8">
          <div className="bg-surface-container rounded-lg p-8 shadow-xl border border-white/5">
            <label className="block text-xs font-bold tracking-widest text-primary uppercase mb-4 font-label">Member Registry</label>
            <textarea
              value={registryText}
              onChange={(e) => setRegistryText(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-md p-4 text-on-surface focus:ring-1 focus:ring-primary/40 focus:border-primary/40 min-h-[170px] placeholder:text-on-surface-variant/40 resize-none outline-none text-sm transition-all custom-scrollbar"
              placeholder="Enter names separated by commas or lines..."
            ></textarea>

            <div className="mt-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface">Grouping Strategy</span>
                <div className="flex bg-surface-container-lowest p-1 rounded-full border border-white/5">
                  <button
                    onClick={() => {
                      setStrategy('count');
                      setStrategyVal(4);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      strategy === 'count' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    By Count
                  </button>
                  <button
                    onClick={() => {
                      setStrategy('size');
                      setStrategyVal(3);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      strategy === 'size' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    By Size
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant/70">{strategy === 'count' ? 'Number of Groups' : 'Members per Group'}</span>
                  <span className="text-primary font-bold font-mono text-base">{strategyVal}</span>
                </div>
                <input
                  value={strategyVal}
                  onChange={(e) => setStrategyVal(parseInt(e.target.value, 10) || 2)}
                  className="w-full h-1.5 bg-surface-container-lowest rounded-lg appearance-none cursor-pointer accent-primary outline-none"
                  max={strategy === 'count' ? '10' : '8'}
                  min="2"
                  type="range"
                />
              </div>

              <button
                onClick={handleOrganize}
                className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-lg hover:brightness-105 active:scale-95 transition-all shadow-xl shadow-primary/15 mt-4 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>group_work</span>
                Organize Assembly
              </button>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`bg-surface-container-low rounded-lg p-6 border-l-4 ${group.color} border-t border-r border-b border-white/5 shadow-xl transition-all hover:scale-[1.02] duration-300`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-on-surface truncate pr-2 font-headline" title={group.name}>
                    {group.name}
                  </h3>
                  <span className="text-[10px] shrink-0 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary font-bold border border-primary/20 tracking-wider">
                    {group.members.length} MEMBERS
                  </span>
                </div>
                <ul className="space-y-4">
                  {group.members.map((member, mIdx) => (
                    <li key={mIdx} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold text-xs ring-2 ring-primary/20">
                        {getInitials(member)}
                      </div>
                      <span className="text-sm font-medium text-on-surface">{member}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={handleCopyLists}
              disabled={groups.length === 0}
              className="px-6 py-2.5 rounded-full border border-outline-variant/30 text-sm font-bold hover:bg-surface-container hover:text-on-surface disabled:opacity-40 transition-colors cursor-pointer select-none"
            >
              Copy Lists
            </button>
            <button
              onClick={handleExportCSV}
              disabled={groups.length === 0}
              className="px-6 py-2.5 rounded-full bg-surface-container-highest text-primary text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer border border-primary/10 select-none"
            >
              Export CSV
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GroupView.tsx
git commit -m "feat: add Group view component with CSV export"
```