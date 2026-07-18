# Task 3: Display Mode and Sound Effects

**Files:**
- Create: `src/hooks/useDisplayMode.ts`, `src/hooks/useSoundEffects.ts`, `src/hooks/useConfetti.ts`
- Modify: None

**Interfaces:**
- Consumes: AppState, DisplaySettings
- Produces: Display mode, sound effects, and confetti hooks

- [ ] **Step 1: Create src/hooks/useDisplayMode.ts**

```typescript
import { useCallback, useEffect } from 'react';
import { state } from '../state';

export function useDisplayMode() {
  const enterDisplayMode = useCallback(() => {
    state.displayMode = true;
    document.body.classList.add('display-mode');
    
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('keydown', onDisplayKeydown);
    document.addEventListener('mousemove', resetCursorTimeout);
    resetCursorTimeout();
  }, []);

  const exitDisplayMode = useCallback(() => {
    state.displayMode = false;
    document.body.classList.remove('display-mode');
    showCursor();

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('keydown', onDisplayKeydown);
    document.removeEventListener('mousemove', resetCursorTimeout);
  }, []);

  const toggleDisplayMode = useCallback(() => {
    if (state.displayMode) {
      exitDisplayMode();
    } else {
      enterDisplayMode();
    }
  }, [enterDisplayMode, exitDisplayMode]);

  const onFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && state.displayMode) {
      exitDisplayMode();
    }
  }, [exitDisplayMode]);

  const onDisplayKeydown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && state.displayMode) {
      e.preventDefault();
      exitDisplayMode();
    }
  }, [exitDisplayMode]);

  let cursorTimeout: ReturnType<typeof setTimeout> | null = null;

  const resetCursorTimeout = useCallback(() => {
    showCursor();
    if (cursorTimeout) clearTimeout(cursorTimeout);
    if (state.displayMode) {
      cursorTimeout = setTimeout(() => {
        if (state.displayMode) document.body.classList.add('cursor-hidden');
      }, 3000);
    }
  }, []);

  const showCursor = useCallback(() => {
    document.body.classList.remove('cursor-hidden');
  }, []);

  useEffect(() => {
    return () => {
      if (cursorTimeout) clearTimeout(cursorTimeout);
    };
  }, []);

  return { enterDisplayMode, exitDisplayMode, toggleDisplayMode };
}
```

- [ ] **Step 2: Create src/hooks/useSoundEffects.ts**

```typescript
import { useCallback, useRef } from 'react';
import { state } from '../state';

export function useSoundEffects() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const spinTickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // audio not available
    }
  }, [getAudioContext]);

  const playSpinSound = useCallback(() => {
    playTone(220, 0.08, 'square', 0.06);
  }, [playTone]);

  const playWinnerChime = useCallback(() => {
    playTone(523, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 120);
    setTimeout(() => playTone(784, 0.25, 'sine', 0.15), 240);
    setTimeout(() => playTone(1047, 0.4, 'sine', 0.1), 400);
  }, [playTone]);

  const playRevealSound = useCallback(() => {
    playTone(440, 0.1, 'triangle', 0.1);
    setTimeout(() => playTone(880, 0.2, 'triangle', 0.08), 80);
  }, [playTone]);

  const startSpinTick = useCallback(() => {
    if (spinTickIntervalRef.current) return;
    spinTickIntervalRef.current = setInterval(() => playSpinSound(), 80);
  }, [playSpinSound]);

  const stopSpinTick = useCallback(() => {
    if (spinTickIntervalRef.current) {
      clearInterval(spinTickIntervalRef.current);
      spinTickIntervalRef.current = null;
    }
  }, []);

  const playWinnerFanfare = useCallback(() => {
    stopSpinTick();
    if (state.displaySettings.soundEnabled !== false) {
      playWinnerChime();
    }
  }, [stopSpinTick, playWinnerChime]);

  const playReveal = useCallback(() => {
    if (state.displaySettings.soundEnabled !== false) {
      playRevealSound();
    }
  }, [playRevealSound]);

  return { startSpinTick, stopSpinTick, playWinnerFanfare, playReveal };
}
```

- [ ] **Step 3: Create src/hooks/useConfetti.ts**

```typescript
import { useCallback } from 'react';
import { state } from '../state';

export function useConfetti() {
  const createConfettiPiece = useCallback((container: HTMLElement) => {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const colors = ['#6ee7b7', '#a78bfa', '#f472b6', '#fbbf24', '#60a5fa', '#fb923c', '#34d399'];
    piece.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
    piece.style.setProperty('--confetti-left', Math.random() * 100 + '%');
    piece.style.setProperty('--confetti-delay', Math.random() * 0.5 + 's');
    piece.style.setProperty('--confetti-duration', (1.5 + Math.random() * 1.5) + 's');
    piece.style.setProperty('--confetti-rotate', Math.random() * 360 + 'deg');
    piece.style.setProperty('--confetti-x', (Math.random() * 200 - 100) + 'px');
    container.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }, []);

  const launchConfetti = useCallback(() => {
    if (state.displaySettings.confettiEnabled === false) return;
    let container = document.getElementById('confetti-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'confetti-container';
      container.className = 'confetti-container';
      document.body.appendChild(container);
    }
    const count = 60;
    for (let i = 0; i < count; i++) {
      setTimeout(() => createConfettiPiece(container!), i * 15);
    }
  }, [createConfettiPiece]);

  const clearConfetti = useCallback(() => {
    const container = document.getElementById('confetti-container');
    if (container) container.remove();
  }, []);

  return { launchConfetti, clearConfetti };
}
```

- [ ] **Step 4: Commit**

```bash
mkdir -p src/hooks
git add src/hooks/useDisplayMode.ts src/hooks/useSoundEffects.ts src/hooks/useConfetti.ts
git commit -m "feat: add display mode, sound effects, and confetti hooks"
```