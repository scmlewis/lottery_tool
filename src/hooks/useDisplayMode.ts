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
