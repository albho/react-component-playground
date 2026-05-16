import type { DemoComponentId } from '../../demo/componentRegistry';
import './Sidebar.scss';

type SidebarComponent = {
  id: DemoComponentId;
  label: string;
};

type SidebarProps = {
  components: readonly SidebarComponent[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelectComponent: (componentId: DemoComponentId) => void;
  selectedComponentId: DemoComponentId;
};

const SidebarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20px"
    height="20px"
    viewBox="0 -960 960 960"
    fill="currentColor"
  >
    <path d="M211-144q-27.64 0-47.32-19.68T144-211v-538q0-27.64 19.68-47.32T211-816h538q27.64 0 47.32 19.68T816-749v538q0 27.64-19.68 47.32T749-144H211Zm125-72v-528H216v528h120Zm72 0h336v-528H408v528Zm-72 0H216h120Z" />
  </svg>
);

export function Sidebar(props: SidebarProps) {
  return (
    <>
      <button
        className={`sidebar__toggle${props.isOpen ? ' sidebar__toggle--hidden' : ''}`}
        type="button"
        aria-controls="site-nav"
        aria-expanded={props.isOpen}
        aria-label="Open navigation"
        onClick={props.onOpen}
      >
        <SidebarIcon />
      </button>
      {props.isOpen && (
        <button
          className="sidebar__backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={props.onClose}
        />
      )}
      <nav
        id="site-nav"
        className={`sidebar${props.isOpen ? ' sidebar--open' : ''}`}
      >
        <div className="sidebar__header">
          <h1 className="sidebar__title">React Component Playground</h1>
          <button
            className="sidebar__icon-button"
            type="button"
            aria-label="Close navigation"
            onClick={props.onClose}
          >
            <SidebarIcon />
          </button>
        </div>
        <ul className="sidebar__nav" aria-label="Components">
          {props.components.map(component => (
            <li className="sidebar__nav-item" key={component.id}>
              <a
                className="sidebar__nav-link"
                href={`#${component.id}`}
                aria-current={
                  props.selectedComponentId === component.id
                    ? 'page'
                    : undefined
                }
                onClick={() => {
                  props.onSelectComponent(component.id);
                }}
              >
                {component.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
