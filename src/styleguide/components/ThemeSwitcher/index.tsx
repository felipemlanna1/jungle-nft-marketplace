import { Compass, Palette } from 'lucide-react';
import { useThemeSwitcher } from './useThemeSwitcher';
import './styles.css';

export function ThemeSwitcher() {
  const { options, selectedTheme, selectTheme } = useThemeSwitcher();
  return (
    <div className="theme-switcher" role="group" aria-label="Tema visual">
      {options.map((option) => {
        const Icon = option.value === 'expedition' ? Compass : Palette;
        return (
          <button
            key={option.value}
            type="button"
            className="theme-switcher-option"
            aria-label={option.label}
            title={option.label}
            aria-pressed={selectedTheme === option.value}
            onClick={() => selectTheme(option.value)}
          >
            <Icon size={14} aria-hidden="true" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
