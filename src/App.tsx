import { useState } from 'react';
import './App.scss';
import { ComponentControl } from './components/layout/ComponentControl/ComponentControl';
import { ComponentPreview } from './components/layout/ComponentPreview/ComponentPreview';
import { Sidebar } from './components/layout/Sidebar/Sidebar';
import {
  getLibraryComponent,
  libraryComponents,
  type LibraryComponentId,
} from './components/library/componentRegistry';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] =
    useState<LibraryComponentId>(libraryComponents[0].id);
  const selectedComponent = getLibraryComponent(selectedComponentId);
  const SelectedComponentControlState = selectedComponent.ControlState;
  const SelectedComponentControls = selectedComponent.Controls;
  const SelectedComponentPreview = selectedComponent.Preview;
  const SelectedComponentProvider = selectedComponent.Provider;

  return (
    <div className="app">
      <Sidebar
        components={libraryComponents}
        isOpen={isNavOpen}
        onOpen={() => setIsNavOpen(true)}
        onClose={() => setIsNavOpen(false)}
        onSelectComponent={componentId => {
          setSelectedComponentId(componentId);
          setIsNavOpen(false);
        }}
        selectedComponentId={selectedComponentId}
      />
      <SelectedComponentProvider>
        <main className="app__main">
          <ComponentPreview>
            <SelectedComponentPreview />
          </ComponentPreview>
          <SelectedComponentControlState>
            {controlState => (
              <ComponentControl
                latencyMs={controlState.latencyMs}
                onLatencyChange={controlState.onLatencyChange}
                onReload={controlState.onReload}
                title={selectedComponent.label}
              >
                <SelectedComponentControls />
              </ComponentControl>
            )}
          </SelectedComponentControlState>
        </main>
      </SelectedComponentProvider>
    </div>
  );
}

export default App;
