import React, { useEffect, useRef } from 'react';
import { initDiceEngine } from '../../services/dice/dice-engine';

const STYLE_ID = 'dice-canvas-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #dice-canvas {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
    }
    #dice-canvas canvas,
    #dice-canvas .dice-box-canvas {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
  `;
  document.head.appendChild(style);
}

const DiceCanvas: React.FC<{ visible: boolean }> = ({ visible }) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      injectStyles();
      // Delay to ensure DOM element has full viewport dimensions
      setTimeout(() => {
        initDiceEngine('#dice-canvas').then(() => {
          // After init, force a resize by triggering a window resize event
          window.dispatchEvent(new Event('resize'));
        }).catch((err) => {
          console.error('Dice canvas init failed:', err);
        });
      }, 500);
    }
  }, []);

  return (
    <div
      id="dice-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        background: visible ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
      }}
    />
  );
};

export default DiceCanvas;
