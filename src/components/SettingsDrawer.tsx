import { motion, AnimatePresence } from 'motion/react';

interface Settings {
  removeWinnerAfterDraw: boolean;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  autoAdvanceSeconds: number;
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onResetPresets: () => void;
  onClearHistory: () => void;
}

export default function SettingsDrawer({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onResetPresets,
  onClearHistory,
}: SettingsDrawerProps) {
  const handleToggle = (key: keyof Settings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleNumberChange = (key: keyof Settings, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-surface-container-high z-50 shadow-2xl border-l border-white/5 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
              <h2 className="text-xl font-bold text-on-surface font-headline">Settings</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Wheel</h3>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-on-surface">Remove winner after draw</label>
                  <button
                    type="button"
                    onClick={() => handleToggle('removeWinnerAfterDraw')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      settings.removeWinnerAfterDraw ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-on-primary transition-transform ${
                        settings.removeWinnerAfterDraw ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant/60">Winner is removed from the wheel after being selected</p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Display</h3>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-on-surface">Sound Effects</label>
                  <button
                    type="button"
                    onClick={() => handleToggle('soundEnabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      settings.soundEnabled ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-on-primary transition-transform ${
                        settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-on-surface">Confetti</label>
                  <button
                    type="button"
                    onClick={() => handleToggle('confettiEnabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      settings.confettiEnabled ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-on-primary transition-transform ${
                        settings.confettiEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-on-surface">Auto-advance timer</label>
                    <span className="text-primary font-bold font-mono">{settings.autoAdvanceSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={settings.autoAdvanceSeconds}
                    onChange={(e) => handleNumberChange('autoAdvanceSeconds', parseInt(e.target.value, 10))}
                    className="w-full h-1 bg-surface-container-lowest rounded-full appearance-none cursor-pointer accent-primary focus:outline-none"
                  />
                  <p className="text-xs text-on-surface-variant/60">Seconds between draws (0 = off)</p>
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-outline-variant/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Data</h3>
                <button
                  onClick={() => {
                    onResetPresets();
                    onClose();
                  }}
                  className="w-full text-left py-3 px-4 hover:bg-surface-container-lowest rounded-lg text-on-surface-variant transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">restart_alt</span>
                  Reset Factory Presets
                </button>
                <button
                  onClick={() => {
                    onClearHistory();
                    onClose();
                  }}
                  className="w-full text-left py-3 px-4 hover:bg-surface-container-lowest rounded-lg text-error transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">delete_sweep</span>
                  Clear Session Logs
                </button>
              </section>

              <section className="space-y-4 pt-4 border-t border-outline-variant/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Source</h3>
                <a
                  href="https://github.com/scmlewis/lottery_tool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left py-3 px-4 hover:bg-surface-container-lowest rounded-lg text-on-surface-variant transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">code</span>
                  View on GitHub — @scmlewis
                </a>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
