import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { NumberBatchEntry, ActivityEntry } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { createActivity } from '../utils';

interface NumberViewProps {
  batches: NumberBatchEntry[];
  onAddBatch: (batch: NumberBatchEntry) => void;
  onAddActivity: (activity: ActivityEntry) => void;
}

export default function NumberView({ batches, onAddBatch, onAddActivity }: NumberViewProps) {
  const [minVal, setMinVal] = useState(1);
  const [maxVal, setMaxVal] = useState(99);
  const [quantity, setQuantity] = useState(6);
  const [latestDraw, setLatestDraw] = useState<number[]>([24, 7, 89, 12, 45, 33]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [excludeDrawn, setExcludeDrawn] = useState(false);
  const [drawnNumbers, setDrawnNumbers] = useState<Set<number>>(new Set());

  const { playReveal } = useSoundEffects();

  const calculateProbability = useMemo(() => {
    const n = Math.max(1, maxVal - minVal + 1);
    const k = Math.min(n, quantity);
    if (k <= 0 || n < k) return '0.000000%';
    let combinations = 1;
    for (let i = 1; i <= k; i++) {
      combinations *= (n - i + 1) / i;
    }
    const prob = 1 / combinations;
    if (prob === 1) return '100.000000%';
    return (prob * 100).toFixed(8) + '%';
  }, [minVal, maxVal, quantity]);

  const handleDrawNumbers = () => {
    if (isDrawing) return;
    setIsDrawing(true);

    const rangeStart = Math.min(minVal, maxVal);
    const rangeEnd = Math.max(minVal, maxVal);
    const poolSize = rangeEnd - rangeStart + 1;
    const drawSize = Math.min(poolSize, quantity);

    let available = Array.from({ length: poolSize }, (_, i) => rangeStart + i);
    
    if (excludeDrawn) {
      available = available.filter((num) => !drawnNumbers.has(num));
    }

    const drawn: number[] = [];

    for (let i = 0; i < Math.min(drawSize, available.length); i++) {
      const idx = Math.floor(Math.random() * available.length);
      drawn.push(available[idx]);
      available.splice(idx, 1);
    }

    drawn.sort((a, b) => a - b);

    setTimeout(() => {
      setLatestDraw(drawn);
      setIsDrawing(false);
      playReveal();

      if (excludeDrawn) {
        setDrawnNumbers((prev) => {
          const newSet = new Set(prev);
          drawn.forEach((num) => newSet.add(num));
          return newSet;
        });
      }

      onAddActivity(createActivity('number', `Drew numbers: [${drawn.join(', ')}]`, 'Number Mode'));
    }, 800);
  };

  const handleSaveBatch = () => {
    const nextBatchNum = batches.length > 0 ? batches[0].batchNumber + 1 : 403;
    const newBatch: NumberBatchEntry = {
      id: 'batch-' + Date.now(),
      batchNumber: nextBatchNum,
      timestamp: Date.now(),
      numbers: latestDraw,
      min: minVal,
      max: maxVal,
    };
    onAddBatch(newBatch);

    onAddActivity(createActivity('number', `Saved Batch #${nextBatchNum}`, 'Number Mode'));
  };

  const handleCopyAll = () => {
    const text = latestDraw.join(', ');
    navigator.clipboard.writeText(text);
    alert('Numbers copied to clipboard: ' + text);
  };

  const handleClearHistory = () => {
    setDrawnNumbers(new Set());
    setLatestDraw([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-16"
    >
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container p-8 rounded-lg shadow-xl border border-white/5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Parameters</h2>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Min Value</label>
                  <input
                    value={minVal}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || val === '-') {
                        setMinVal(val === '-' ? -0 : 0);
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) setMinVal(parsed);
                      }
                    }}
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-md p-4 text-primary font-mono focus:ring-1 focus:ring-primary/40 focus:border-primary/40 outline-none text-sm transition-all"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Max Value</label>
                  <input
                    value={maxVal}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || val === '-') {
                        setMaxVal(val === '-' ? -0 : 0);
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) setMaxVal(parsed);
                      }
                    }}
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-md p-4 text-primary font-mono focus:ring-1 focus:ring-primary/40 focus:border-primary/40 outline-none text-sm transition-all"
                    type="number"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Quantity</label>
                  <span className="text-primary font-bold font-mono">{quantity.toString().padStart(2, '0')}</span>
                </div>
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full h-1 bg-surface-container-lowest rounded-full appearance-none cursor-pointer accent-primary focus:outline-none"
                  max="20"
                  min="1"
                  type="range"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-on-surface">Exclude Drawn Numbers</label>
                <button
                  type="button"
                  onClick={() => setExcludeDrawn(!excludeDrawn)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    excludeDrawn ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-on-primary transition-transform ${
                      excludeDrawn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-on-surface-variant/60">Prevent previously drawn numbers from being selected again</p>

              <button
                onClick={handleDrawNumbers}
                disabled={isDrawing}
                className="w-full py-5 bg-gradient-to-br from-primary to-primary-container hover:brightness-110 disabled:opacity-50 text-on-primary font-bold rounded-xl active:scale-95 transition-all shadow-xl shadow-primary/15 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
                {isDrawing ? 'DISPENSING CHANCE...' : 'Draw Numbers'}
              </button>
            </div>
          </div>

          <div className="bg-surface-container-high p-8 rounded-lg relative overflow-hidden group border border-white/5 shadow-lg">
            <div className="relative z-10">
              <p className="text-on-surface-variant/70 text-xs font-bold uppercase tracking-widest mb-1.5">Total Pool Probability</p>
              <h3 className="text-3xl font-bold font-headline text-primary font-mono">{calculateProbability}</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none">
              <span className="material-symbols-outlined text-[120px] text-primary">calculate</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-surface-container-low rounded-lg p-1 text-center border border-white/5 shadow-2xl">
            <div className="py-12 px-4 rounded-[1.75rem] bg-[#131313] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-12 relative z-10">Latest Draw Result</h2>

              <div className="flex flex-wrap justify-center gap-6 relative z-10">
                {latestDraw.map((num, i) => (
                  <motion.div
                    key={`${num}-${i}`}
                    initial={{ scale: 0.3, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 100, delay: i * 0.1 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary text-3xl md:text-4xl font-extrabold shadow-2xl shadow-primary/20 border-t-2 border-white/20 select-none"
                  >
                    {num.toString().padStart(2, '0')}
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 flex justify-center gap-4 relative z-10">
                <button
                  onClick={handleSaveBatch}
                  className="px-6 py-3 rounded-full bg-surface-container-highest text-primary text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-colors border border-primary/10 cursor-pointer"
                >
                  Save to Batch
                </button>
                <button
                  onClick={handleCopyAll}
                  className="px-6 py-3 rounded-full bg-transparent border-2 border-outline-variant/30 text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:border-primary/50 transition-colors cursor-pointer"
                >
                  Copy All
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-bold text-on-surface font-headline">Batch History</h2>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 rounded-full border border-outline-variant/30 text-xs font-bold uppercase tracking-widest hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              >
                Clear History
              </button>
            </div>
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {batches.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant/40 bg-surface-container rounded-lg border border-dashed border-outline-variant/15">
                  No batches saved yet.
                </div>
              ) : (
                batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center justify-between p-6 bg-surface-container hover:bg-surface-container-high rounded-lg group border border-white/5 transition-colors shadow-md"
                  >
                    <div className="flex items-center gap-8">
                      <div className="text-left">
                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Batch #{batch.batchNumber}</p>
                        <p className="text-sm font-bold text-on-surface">
                          {new Date(batch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {batch.numbers.map((num, idx) => (
                          <span
                            key={idx}
                            className="w-8 h-8 rounded-full bg-surface-container-lowest border border-white/5 flex items-center justify-center text-xs text-primary font-bold shadow-sm"
                          >
                            {num.toString().padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors cursor-pointer">
                      chevron_right
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
