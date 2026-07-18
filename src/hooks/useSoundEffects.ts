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
