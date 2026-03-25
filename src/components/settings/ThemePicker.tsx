import React, { useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { colorPaletteOutline } from 'ionicons/icons';
import { useTheme, THEME_PRESETS, ThemeColors } from '../../state/ThemeContext';

const COLOR_FIELDS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'primary', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Panels' },
  { key: 'surfaceDeep', label: 'Deep Panels' },
  { key: 'text', label: 'Text' },
  { key: 'textMuted', label: 'Muted Text' },
  { key: 'border', label: 'Borders' },
  { key: 'diceColor', label: 'Dice' },
];

const ThemePicker: React.FC = () => {
  const { theme, presetName, setPreset, setCustomTheme } = useTheme();
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div style={{
      background: theme.surfaceDeep,
      borderRadius: 8,
      padding: 12,
      border: `1px solid ${theme.border}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        fontSize: '0.75rem',
        color: theme.textMuted,
        textTransform: 'uppercase',
      }}>
        <IonIcon icon={colorPaletteOutline} />
        Theme
      </div>

      {/* Preset buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {THEME_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setPreset(p.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
              border: presetName === p.name ? `2px solid ${p.colors.primary}` : '1px solid #444',
              background: p.colors.background,
              color: p.colors.text,
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: presetName === p.name ? 'bold' : 'normal',
            }}
          >
            <span style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: p.colors.primary,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            {p.name}
          </button>
        ))}
      </div>

      {/* Custom toggle */}
      <IonButton
        size="small"
        fill="outline"
        color="medium"
        onClick={() => setShowCustom(!showCustom)}
        style={{ marginBottom: showCustom ? 8 : 0 }}
      >
        {showCustom ? 'Hide Custom Colors' : 'Customize Colors'}
      </IonButton>

      {/* Custom color pickers */}
      {showCustom && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 8,
          marginTop: 4,
        }}>
          {COLOR_FIELDS.map(({ key, label }) => (
            <label key={key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8rem',
              color: theme.text,
              cursor: 'pointer',
            }}>
              <input
                type="color"
                value={theme[key]}
                onChange={(e) => setCustomTheme({ [key]: e.target.value })}
                style={{ width: 28, height: 28, border: 'none', cursor: 'pointer', background: 'none' }}
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
