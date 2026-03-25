import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { flashlightOutline } from 'ionicons/icons';
import { rollDice, isDiceReady, clearDice } from '../../services/dice/dice-engine';
import { useTheme } from '../../state/ThemeContext';

interface LightDef {
  dx: number; dy: number; dz: number;
  px?: number; py?: number; pz?: number;
  int: number;
}

interface LightConfig {
  top: LightDef;
  hemi: LightDef;
  right: LightDef;
  left: LightDef;
  front: LightDef;
  back: LightDef;
}

const DEFAULT_CONFIG: LightConfig = {
  top:   { dx: -0.3, dy: -0.9, dz: 0.4, px: -50, py: 65, pz: -50, int: 0.2 },
  hemi:  { dx: 0, dy: 0, dz: 1, int: 0.3 },
  right: { dx: 1, dy: 0, dz: 0, px: 100, py: 5, pz: 0, int: 15 },
  left:  { dx: -1, dy: 0, dz: 0, px: -100, py: 5, pz: 0, int: 15 },
  front: { dx: 0, dy: 0, dz: -1, px: 0, py: 5, pz: 100, int: 10 },
  back:  { dx: 0, dy: 0, dz: 1, px: 0, py: 5, pz: -100, int: 10 },
};

const STORAGE_KEY = 'jj-light-config';

function loadConfig(): LightConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_CONFIG;
}

function saveConfig(cfg: LightConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  (window as any).__jjLightConfig = cfg;
}

function applyToLive(cfg: LightConfig) {
  const lights = (window as any).__jjDiceLights;
  if (!lights) return;
  const { M, baseIntensity: bi } = lights;

  const applyDir = (light: any, def: LightDef) => {
    light.direction = new M(def.dx, def.dy, def.dz);
    if (def.px !== undefined) light.position = new M(def.px, def.py, def.pz);
    light.intensity = def.int * bi;
  };

  applyDir(lights.top, cfg.top);
  applyDir(lights.right, cfg.right);
  applyDir(lights.left, cfg.left);
  applyDir(lights.front, cfg.front);
  applyDir(lights.back, cfg.back);

  lights.hemi.direction = new M(cfg.hemi.dx, cfg.hemi.dy, cfg.hemi.dz);
  lights.hemi.intensity = cfg.hemi.int * bi;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color?: string;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step, onChange, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
    <span style={{ fontSize: '0.7rem', color: color || '#aaa', width: 65, flexShrink: 0 }}>{label}</span>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ flex: 1, accentColor: color || '#e94560', height: 14 }}
    />
    <span style={{ fontSize: '0.7rem', color: '#888', width: 38, textAlign: 'right' }}>
      {value.toFixed(step < 1 ? 1 : 0)}
    </span>
  </div>
);

interface LightGroupProps {
  name: string;
  def: LightDef;
  hasPosition: boolean;
  color: string;
  onChange: (def: LightDef) => void;
}

const LightGroup: React.FC<LightGroupProps> = ({ name, def, hasPosition, color, onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const update = (key: keyof LightDef, val: number) => onChange({ ...def, [key]: val });

  return (
    <div style={{
      background: '#0a0a1a',
      borderRadius: 6,
      padding: '6px 8px',
      marginBottom: 4,
      border: `1px solid ${color}33`,
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }}
      >
        <span style={{ fontSize: '0.8rem', color, fontWeight: 'bold' }}>{name}</span>
        <span style={{ fontSize: '0.75rem', color: '#888' }}>
          intensity: {def.int.toFixed(1)} {expanded ? '▾' : '▸'}
        </span>
      </div>
      {expanded && (
        <div style={{ marginTop: 4 }}>
          <SliderRow label="Intensity" value={def.int} min={0} max={30} step={0.5} onChange={(v) => update('int', v)} color={color} />
          <SliderRow label="Dir X" value={def.dx} min={-1} max={1} step={0.1} onChange={(v) => update('dx', v)} color={color} />
          <SliderRow label="Dir Y" value={def.dy} min={-1} max={1} step={0.1} onChange={(v) => update('dy', v)} color={color} />
          <SliderRow label="Dir Z" value={def.dz} min={-1} max={1} step={0.1} onChange={(v) => update('dz', v)} color={color} />
          {hasPosition && (
            <>
              <SliderRow label="Pos X" value={def.px || 0} min={-150} max={150} step={5} onChange={(v) => update('px', v)} color={color} />
              <SliderRow label="Pos Y" value={def.py || 0} min={0} max={100} step={5} onChange={(v) => update('py', v)} color={color} />
              <SliderRow label="Pos Z" value={def.pz || 0} min={-150} max={150} step={5} onChange={(v) => update('pz', v)} color={color} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

const LightingConfig: React.FC = () => {
  const [config, setConfig] = useState<LightConfig>(loadConfig);
  const [open, setOpen] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const { theme } = useTheme();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drop persistent preview dice when panel opens
  const spawnPreviewDice = useCallback(async () => {
    if (!isDiceReady()) return;
    clearDice();
    try {
      await rollDice([{ sides: 4 }, { sides: 20 }], theme.diceColor);
      setPreviewActive(true);
    } catch {}
  }, [theme.diceColor]);

  // Re-drop dice on slider change (debounced)
  const respawnPreview = useCallback(() => {
    if (!previewActive) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!isDiceReady()) return;
      clearDice();
      try {
        await rollDice([{ sides: 4 }, { sides: 20 }], theme.diceColor);
      } catch {}
    }, 400);
  }, [previewActive, theme.diceColor]);

  const updateLight = useCallback((key: keyof LightConfig, def: LightDef) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: def };
      saveConfig(next);
      applyToLive(next);
      return next;
    });
  }, []);

  // After updating a light, respawn the preview dice so they re-render with new lighting
  const handleLightChange = useCallback((key: keyof LightConfig, def: LightDef) => {
    updateLight(key, def);
    respawnPreview();
  }, [updateLight, respawnPreview]);

  const resetDefaults = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    saveConfig(DEFAULT_CONFIG);
    applyToLive(DEFAULT_CONFIG);
    respawnPreview();
  }, [respawnPreview]);

  // When panel opens, spawn preview dice. When it closes, clear them.
  useEffect(() => {
    if (open) {
      spawnPreviewDice();
    } else {
      setPreviewActive(false);
      clearDice();
    }
  }, [open]);

  // Apply saved config on mount
  useEffect(() => {
    (window as any).__jjLightConfig = config;
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div style={{
      background: theme.surfaceDeep,
      borderRadius: 8,
      padding: 12,
      border: `1px solid ${theme.border}`,
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontSize: '0.75rem',
          color: theme.textMuted,
          textTransform: 'uppercase',
        }}
      >
        <IonIcon icon={flashlightOutline} />
        Lighting Config {open ? '▾' : '▸'}
      </div>

      {open && (
        <div style={{ marginTop: 8 }}>
          {/* Preview info */}
          <div style={{
            display: 'flex',
            gap: 6,
            marginBottom: 8,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
              {previewActive ? 'd4 + d20 visible — adjust sliders to see changes' : 'Opening will spawn preview dice'}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <IonButton size="small" onClick={spawnPreviewDice} style={{ '--background': theme.primary } as any}>
                Re-roll
              </IonButton>
              <IonButton size="small" fill="outline" color="medium" onClick={resetDefaults}>
                Reset
              </IonButton>
            </div>
          </div>

          <LightGroup name="Top Light" def={config.top} hasPosition={true} color="#ffeb3b" onChange={(d) => handleLightChange('top', d)} />
          <LightGroup name="Ambient (Hemi)" def={config.hemi} hasPosition={false} color="#90caf9" onChange={(d) => handleLightChange('hemi', d)} />
          <LightGroup name="Right Light" def={config.right} hasPosition={true} color="#4caf50" onChange={(d) => handleLightChange('right', d)} />
          <LightGroup name="Left Light" def={config.left} hasPosition={true} color="#f44336" onChange={(d) => handleLightChange('left', d)} />
          <LightGroup name="Front Light" def={config.front} hasPosition={true} color="#ce93d8" onChange={(d) => handleLightChange('front', d)} />
          <LightGroup name="Back Light" def={config.back} hasPosition={true} color="#ff9800" onChange={(d) => handleLightChange('back', d)} />
        </div>
      )}
    </div>
  );
};

export default LightingConfig;
