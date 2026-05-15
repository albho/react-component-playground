import type { ReactNode } from 'react';
import './ComponentControl.scss';

export type ComponentControlState = {
  latencyMs: number;
  onLatencyChange: (latencyMs: number) => void;
  onReload: () => void;
};

type ComponentControlProps = ComponentControlState & {
  children: ReactNode;
  title: string;
};

const RestartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20px"
    height="20px"
    viewBox="0 -960 960 960"
    fill="currentColor"
  >
    <path d="M444-144q-107-14-179.5-94.5T192-430q0-61 23-113.5t63-91.5l51 51q-30 29-47.5 69T264-430q0 81 51.5 140T444-217v73Zm72 0v-73q77-13 128.5-72.5T696-430q0-90-63-153t-153-63h-7l46 46-51 50-132-132 132-132 51 51-45 45h6q120 0 204 84t84 204q0 111-72.5 192T516-144Z" />
  </svg>
);

export function ComponentControl(props: ComponentControlProps) {
  return (
    <aside className="component-control">
      <div className="component-control__card">
        <header className="component-control__header">
          <h2 className="component-control__title">{props.title}</h2>
        </header>
        <div className="component-control__body">{props.children}</div>
        <div className="component-control__actions">
          <label className="component-control__range">
            <span>Latency: {props.latencyMs}ms</span>
            <input
              type="range"
              min="0"
              max="2000"
              step="100"
              value={props.latencyMs}
              onChange={event =>
                props.onLatencyChange(Number(event.target.value))
              }
            />
          </label>
          <button
            className="component-control__button"
            type="button"
            onClick={props.onReload}
          >
            <RestartIcon />
            Reload Component
          </button>
        </div>
        <footer className="component-control__footer">
          <button className="component-control__source-button" type="button">
            View Source
          </button>
        </footer>
      </div>
    </aside>
  );
}
