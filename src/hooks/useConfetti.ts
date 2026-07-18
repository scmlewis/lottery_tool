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
