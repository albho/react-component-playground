import { useState } from 'react';
import './App.scss';
import { ComponentControl } from './components/layout/ComponentControl/ComponentControl';
import { ComponentPreview } from './components/layout/ComponentPreview/ComponentPreview';
import { Sidebar } from './components/layout/Sidebar/Sidebar';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar
        isOpen={isNavOpen}
        onOpen={() => setIsNavOpen(true)}
        onClose={() => setIsNavOpen(false)}
      />
      <main className="app__main">
        <ComponentPreview>
          <div></div>
        </ComponentPreview>
        <ComponentControl />
      </main>
    </div>
  );
}

export default App;
