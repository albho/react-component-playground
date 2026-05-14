import { useState } from 'react';
import './App.scss';
import { ComponentControl } from './components/layout/ComponentControl/ComponentControl';
import { ComponentPreview } from './components/layout/ComponentPreview/ComponentPreview';
import { Sidebar } from './components/layout/Sidebar/Sidebar';
import { usePreviewTheme } from './usePreviewTheme';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { themePreference, resolvedTheme, setThemePreference } =
    usePreviewTheme();

  return (
    <div className="app">
      <Sidebar
        isOpen={isNavOpen}
        onOpen={() => setIsNavOpen(true)}
        onClose={() => setIsNavOpen(false)}
      />
      <main className="app__main">
        <ComponentPreview theme={resolvedTheme}>
          <div></div>
        </ComponentPreview>
        <ComponentControl
          themePreference={themePreference}
          onThemePreferenceChange={setThemePreference}
        />
      </main>
    </div>
  );
}

export default App;
