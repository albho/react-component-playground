import { useEffect, useState } from 'react';
import './App.scss';
import {
  getDemoComponent,
  demoComponents,
  type DemoComponentId,
} from './components/demo/componentRegistry';
import { ComponentControl } from './components/layout/ComponentControl/ComponentControl';
import { ComponentPreview } from './components/layout/ComponentPreview/ComponentPreview';
import { Sidebar } from './components/layout/Sidebar/Sidebar';

const getComponentIdFromHash = (): DemoComponentId => {
  const hashComponentId = window.location.hash.slice(1);
  const component = demoComponents.find(
    demoComponent => demoComponent.id === hashComponentId,
  );

  return component?.id ?? demoComponents[0].id;
};

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] =
    useState<DemoComponentId>(getComponentIdFromHash);
  const selectedComponent = getDemoComponent(selectedComponentId);
  const SelectedComponentControlState = selectedComponent.ControlState;
  const SelectedComponentControls = selectedComponent.Controls;
  const SelectedComponentPreview = selectedComponent.Preview;
  const SelectedComponentProvider = selectedComponent.Provider;

  useEffect(() => {
    const handleHashChange = () => {
      setSelectedComponentId(getComponentIdFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="app">
      <Sidebar
        components={demoComponents}
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
