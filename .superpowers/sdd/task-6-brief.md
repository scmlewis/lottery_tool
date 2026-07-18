# Task 6: Wheel View Component

**Files:**
- Create: `src/components/WheelView.tsx`
- Modify: None

**Interfaces:**
- Consumes: Contestant, WinnerHistoryEntry, ActivityEntry, hooks
- Produces: Wheel view with SVG wheel, spin animation, and history

- [ ] **Step 1: Create src/components/WheelView.tsx**

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Contestant, WinnerHistoryEntry, ActivityEntry } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useConfetti } from '../hooks/useConfetti';

interface WheelViewProps {
  contestants: Contestant[];
  onAddContestant: (name: string) => void;
  onDeleteContestant: (id: string) => void;
  winnerHistory: WinnerHistoryEntry[];
  onAddWinner: (name: string) => void;
  onAddActivity: (activity: ActivityEntry) => void;
}

export default function WheelView({
  contestants,
  onAddContestant,
  onDeleteContestant,
  winnerHistory,
  onAddWinner,
  onAddActivity,
}: WheelViewProps) {
  const [newItemName, setNewItemName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [totalSpinsCount, setTotalSpinsCount] = useState(() => {
    const saved = localStorage.getItem('total_spins_count');
    return saved ? parseInt(saved, 10) : 1284;
  });

  const { startSpinTick, stopSpinTick, playWinnerFanfare } = useSoundEffects();
  const { launchConfetti, clearConfetti } = useConfetti();

  useEffect(() => {
    localStorage.setItem('total_spins_count', totalSpinsCount.toString());
  }, [totalSpinsCount]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddContestant(newItemName.trim());
    setNewItemName('');
  };

  const handleSpin = () => {
    if (isSpinning || contestants.length === 0) return;

    setIsSpinning(true);
    setSelectedWinner(null);

    const randomIndex = Math.floor(Math.random() * contestants.length);
    const winnerName = contestants[randomIndex].name;

    const sectorAngle = 360 / contestants.length;
    const targetAngleFromZero = randomIndex * sectorAngle + sectorAngle / 2;
    const extraSpins = 360 * 6;
    const newRotationValue = rotation + extraSpins + (360 - targetAngleFromZero);

    startSpinTick();
    setRotation(newRotationValue);

    setTimeout(() => {
      setIsSpinning(false);
      stopSpinTick();
      setSelectedWinner(winnerName);
      onAddWinner(winnerName);
      playWinnerFanfare();
      launchConfetti();
      setTotalSpinsCount((prev) => prev + 1);

      const randomCode = '#' + Math.floor(1000 + Math.random() * 9000);
      onAddActivity({
        id: 'act-' + Date.now(),
        title: `Spun "${winnerName}"`,
        subtitle: 'Wheel Mode',
        type: 'wheel',
        code: randomCode,
        timestamp: Date.now(),
      });
    }, 4000);
  };

  const getWedgeColor = (index: number) => {
    const isEven = index % 2 === 0;
    return isEven ? '#201f1f' : '#2a2a2a';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      <section className="lg:col-span-4 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary font-headline">Wheel Config</h2>
          <p className="text-on-surface-variant text-sm">Curate your pool of destiny.</p>
        </div>

        <div className="bg-surface-container rounded-lg p-6 space-y-6 shadow-xl border border-white/5">
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary">
              Active Contestants ({contestants.length})
            </label>
            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {contestants.length === 0 ? (
                <div className="text-sm text-on-surface-variant/40 py-4 text-center border border-dashed border-outline-variant/20 rounded-md">
                  No active contestants. Add one below.
                </div>
              ) : (
                contestants.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-container-lowest/80 rounded-md group border border-white/5 transition-all"
                  >
                    <span className="font-medium text-on-surface text-sm">{item.name}</span>
                    <button
                      onClick={() => onDeleteContestant(item.id)}
                      className="text-error opacity-70 hover:opacity-100 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded hover:bg-error/10"
                      title="Remove"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleAddItem} className="pt-2 border-t border-outline-variant/10">
            <div className="relative">
              <input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-md py-4 pl-5 pr-14 text-on-surface placeholder:text-on-surface-variant/35 focus:ring-1 focus:ring-primary/40 focus:border-primary/40 outline-none text-sm transition-all"
                placeholder="Add custom item..."
                type="text"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined font-bold text-lg">add</span>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-surface-container-low rounded-lg p-6 space-y-4 border border-white/5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Winner History</h3>
          <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {winnerHistory.length === 0 ? (
              <div className="text-xs text-on-surface-variant/40 py-2">No spins recorded in this session.</div>
            ) : (
              winnerHistory.map((h, i) => {
                const diffMs = Date.now() - h.timestamp;
                const minutesAgo = Math.max(1, Math.floor(diffMs / 60000));
                const timeStr =
                  minutesAgo < 60
                    ? `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`
                    : new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={h.id || i} className="flex items-center gap-4 border-b border-outline-variant/5 pb-2 last:border-b-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        i === 0 ? 'bg-secondary animate-pulse shadow-[0_0_8px_rgba(234,107,30,0.6)]' : 'bg-primary/40'
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-on-surface">{h.name}</p>
                      <p className="text-[10px] text-on-surface-variant/50">{timeStr}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="lg:col-span-8 flex flex-col items-center justify-center min-h-[600px] relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-primary/5 rounded-full blur-[140px]"></div>
        </div>

        <AnimatePresence>
          {selectedWinner && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute z-40 bg-[#131313]/95 backdrop-blur-md px-10 py-8 rounded-lg border-2 border-primary/20 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-sm w-full mx-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">The Gilded Selection</span>
              <h3 className="text-3xl font-black text-primary font-headline mt-1 tracking-tight">{selectedWinner}</h3>
              <p className="text-on-surface-variant text-xs mt-3 leading-relaxed">The wheel of destiny has settled.</p>
              <button
                onClick={() => {
                  setSelectedWinner(null);
                  clearConfetti();
                }}
                className="mt-6 px-6 py-2 bg-primary text-on-primary font-bold rounded-full text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Accept Outcome
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full mb-10 flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block">Live Session</span>
            <h3 className="text-4xl font-extrabold tracking-tighter text-on-surface font-headline">Midnight Spin</h3>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 rounded-full bg-surface-container-highest/80 text-[10px] font-bold uppercase tracking-widest border border-outline-variant/10 text-on-surface">
              {contestants.length} Entries
            </div>
            <div className="px-4 py-2 rounded-full bg-surface-container-highest/80 text-[10px] font-bold uppercase tracking-widest border border-outline-variant/10 text-primary">
              High Stakes
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center mb-16">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 text-primary drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] pointer-events-none">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              arrow_drop_down
            </span>
          </div>

          <div className="w-full h-full rounded-full border-[10px] border-surface-container shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden relative">
            <div
              className="w-full h-full rounded-full relative transition-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4000ms cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none',
              }}
            >
              {contestants.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-container">
                  <span className="text-on-surface-variant/40 font-bold uppercase tracking-widest">Empty Pool</span>
                </div>
              ) : (
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {contestants.map((item, index) => {
                    const count = contestants.length;
                    const angle = 360 / count;
                    const startAngle = index * angle;
                    const endAngle = (index + 1) * angle;

                    const radStart = (Math.PI * (startAngle - 90)) / 180;
                    const radEnd = (Math.PI * (endAngle - 90)) / 180;

                    const x1 = 200 + 200 * Math.cos(radStart);
                    const y1 = 200 + 200 * Math.sin(radStart);
                    const x2 = 200 + 200 * Math.cos(radEnd);
                    const y2 = 200 + 200 * Math.sin(radEnd);

                    const largeArcFlag = angle > 180 ? 1 : 0;
                    const pathData = `M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    const textAngle = startAngle + angle / 2;
                    const radText = (Math.PI * (textAngle - 90)) / 180;
                    const tx = 200 + 115 * Math.cos(radText);
                    const ty = 200 + 115 * Math.sin(radText);

                    return (
                      <g key={item.id}>
                        <path d={pathData} fill={getWedgeColor(index)} stroke="#131313" strokeWidth="2" />
                        <text
                          x={tx}
                          y={ty}
                          transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                          fill="#d0c5af"
                          fontSize={count > 8 ? '10' : '12'}
                          fontWeight="700"
                          letterSpacing="0.08em"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="select-none uppercase"
                        >
                          {item.name.length > 12 ? `${item.name.substring(0, 10)}..` : item.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-background border-4 border-surface-container-highest shadow-inner flex items-center justify-center z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f2ca50] to-[#d4af37] shadow-[0_0_20px_rgba(242,202,80,0.4)]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-7 z-30">
            <button
              onClick={handleSpin}
              disabled={isSpinning || contestants.length === 0}
              className={`px-10 py-4 rounded-xl text-on-primary font-bold text-base shadow-[0_15px_30px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer select-none bg-gradient-to-br from-primary to-primary-container disabled:opacity-40 disabled:pointer-events-none`}
            >
              <span className={`material-symbols-outlined text-lg ${isSpinning ? 'animate-spin' : ''}`}>autorenew</span>
              {isSpinning ? 'ALIGNING DESTINY...' : 'SPIN WHEEL'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full max-w-xl text-center border-t border-outline-variant/10 pt-10">
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1.5">Total Spins</p>
            <p className="text-2xl font-bold font-mono text-on-surface">{totalSpinsCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1.5">Luck Rate</p>
            <p className="text-2xl font-bold font-mono text-secondary">24%</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1.5">Recent Win</p>
            <p className="text-2xl font-bold text-on-surface truncate px-2" title={winnerHistory[0]?.name || 'None'}>
              {winnerHistory[0]?.name || 'N/A'}
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/WheelView.tsx
git commit -m "feat: add Wheel view component with spin animation"
```