import type { ThemePreference } from '../../../usePreviewTheme';
import './ComponentControl.scss';

type ComponentControlProps = {
  themePreference: ThemePreference;
  onThemePreferenceChange: (themePreference: ThemePreference) => void;
};

const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];

export function ComponentControl(props: ComponentControlProps) {
  return (
    <aside className="component-control">
      <div className="component-control__theme" aria-label="Preview theme">
        {themeOptions.map(themeOption => (
          <button
            className="component-control__theme-button"
            type="button"
            aria-pressed={props.themePreference === themeOption}
            key={themeOption}
            onClick={() => props.onThemePreferenceChange(themeOption)}
          >
            {themeOption}
          </button>
        ))}
      </div>
    </aside>
  );
}
