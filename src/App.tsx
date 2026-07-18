import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppMode, Contestant, WinnerHistoryEntry, NumberBatchEntry, ActivityEntry } from './types';
import { useDisplayMode } from './hooks/useDisplayMode';
import DashboardView from './components/DashboardView';
import WheelView from './components/WheelView';
import NumberView from './components/NumberView';
import GroupView from './components/GroupView';

export default function App() {
  const [mode, setMode] = useState<AppMode>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [contestants, setContestants] = useState<Contestant[]>([
    { id: '1', name: 'Apple' },
    { id: '2', name: 'Banana' },
    { id: '3', name: 'Cherry' },
    { id: '4', name: 'Date' },
  ]);
  const [winnerHistory, setWinnerHistory] = useState<WinnerHistoryEntry[]>([]);
  const [numberBatches, setNumberBatches] = useState<NumberBatchEntry[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [lastWinnerName, setLastWinnerName] = useState('Sarah Jenkins');
  const [lastWinnerCode, setLastWinnerCode] = useState('GOLD-774-LX');

  const { toggleDisplayMode } = useDisplayMode();

  const handleAddContestant = (name: string) => {
    const newContestant: Contestant = {
      id: 'item-' + Date.now(),
      name,
    };
    setContestants((prev) => [...prev, newContestant]);
  };

  const handleDeleteContestant = (id: string) => {
    setContestants((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddWinner = (name: string) => {
    const newEntry: WinnerHistoryEntry = {
      id: 'win-' + Date.now(),
      name,
      timestamp: Date.now(),
    };
    setWinnerHistory((prev) => [newEntry, ...prev]);
    setLastWinnerName(name);
    const codeSegment = Math.floor(100 + Math.random() * 900);
    const suffix = name.substring(0, 2).toUpperCase();
    setLastWinnerCode(`GOLD-${codeSegment}-${suffix}`);
  };

  const handleAddBatch = (batch: NumberBatchEntry) => {
    setNumberBatches((prev) => [batch, ...prev]);
  };

  const handleAddActivity = (act: ActivityEntry) => {
    setActivities((prev) => [act, ...prev].slice(0, 50));
  };

  const handleResetPresets = () => {
    if (confirm('Are you sure you want to reset all data?')) {
      setContestants([
        { id: '1', name: 'Apple' },
        { id: '2', name: 'Banana' },
        { id: '3', name: 'Cherry' },
        { id: '4', name: 'Date' },
      ]);
      setWinnerHistory([]);
      setNumberBatches([]);
      setActivities([]);
      setLastWinnerName('Sarah Jenkins');
      setLastWinnerCode('GOLD-774-LX');
      setMode('dashboard');
      setShowSettings(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear winner log, batch log, and recent activities?')) {
      setWinnerHistory([]);
      setNumberBatches([]);
      setActivities([]);
      setShowSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans pb-36 select-none relative">
      <header className="fixed top-0 w-full z-40 bg-[#131313]/90 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-6 h-16 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMode('dashboard')}
            className="text-primary hover:opacity-85 transition-opacity active:scale-95 cursor-pointer flex items-center justify-center p-1 rounded"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <h1
            onClick={() => setMode('dashboard')}
            className="text-xl font-bold tracking-tighter text-primary font-headline cursor-pointer select-none"
          >
            Lucky Draw
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDisplayMode}
            className="text-primary hover:opacity-85 transition-opacity active:scale-95 cursor-pointer flex items-center justify-center p-1 rounded"
            title="Display Mode"
          >
            <span className="material-symbols-outlined text-2xl">fullscreen</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`text-primary hover:opacity-85 transition-opacity active:scale-95 cursor-pointer flex items-center justify-center p-1 rounded ${showSettings ? 'rotate-45' : ''} transition-transform duration-300`}
          >
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {mode === 'dashboard' && (
            <DashboardView
              key="dashboard"
              onNavigate={(dest) => setMode(dest)}
              activities={activities}
              lastWinnerName={lastWinnerName}
              lastWinnerCode={lastWinnerCode}
            />
          )}
          {mode === 'wheel' && (
            <WheelView
              key="wheel"
              contestants={contestants}
              onAddContestant={handleAddContestant}
              onDeleteContestant={handleDeleteContestant}
              winnerHistory={winnerHistory}
              onAddWinner={handleAddWinner}
              onAddActivity={handleAddActivity}
            />
          )}
          {mode === 'number' && (
            <NumberView
              key="number"
              batches={numberBatches}
              onAddBatch={handleAddBatch}
              onAddActivity={handleAddActivity}
            />
          )}
          {mode === 'group' && (
            <GroupView
              key="group"
              onAddActivity={handleAddActivity}
            />
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-4 pb-8 bg-[#131313]/90 backdrop-blur-xl z-40 rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.6)] border-t border-white/5">
        {(['dashboard', 'wheel', 'number', 'group'] as AppMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
              mode === m
                ? 'bg-gradient-to-br from-[#f2ca50] to-[#d4af37] text-[#131313] rounded-full px-5 py-2 active:scale-95 shadow-md shadow-primary/10'
                : 'text-[#d0c5af] opacity-65 hover:text-[#f2ca50] hover:opacity-100'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: mode === m ? "'FILL' 1" : "'FILL' 0" }}
            >
              {m === 'dashboard' ? 'dashboard' : m === 'wheel' ? 'casino' : m === 'number' ? 'filter_7' : 'group'}
            </span>
            <span className="font-sans text-[9px] uppercase tracking-wider font-extrabold mt-0.5">
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </span>
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {showSettings && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-6 top-20 w-64 bg-surface-container rounded-lg border border-white/5 shadow-2xl z-50 p-4 space-y-3 text-sm"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary border-b border-outline-variant/10 pb-2">
                Settings
              </p>
              <button
                onClick={handleResetPresets}
                className="w-full text-left py-2 px-3 hover:bg-surface-container-high hover:text-primary rounded text-on-surface-variant transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
                Reset Factory Presets
              </button>
              <button
                onClick={handleClearHistory}
                className="w-full text-left py-2 px-3 hover:bg-surface-container-high hover:text-error rounded text-on-surface-variant transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">delete_sweep</span>
                Clear Session Logs
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
