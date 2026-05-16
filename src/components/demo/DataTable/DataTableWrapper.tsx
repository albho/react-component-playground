import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { ComponentControlState } from '../../layout/ComponentControl/ComponentControl';
import DataTable from './DataTable';
import type {
  DataTableFailureSettings,
  DataTableSimulation,
} from './useDataTableSimulation';
import { useDataTableSimulation } from './useDataTableSimulation';

type DataTableContextValue = {
  simulation: DataTableSimulation;
};

type DataTableProviderProps = {
  children: ReactNode;
};

type DataTableControlStateProps = {
  children: (state: ComponentControlState) => ReactNode;
};

type DataTableFailureControl = {
  key: keyof DataTableFailureSettings;
  label: string;
};

const DataTableContext = createContext<DataTableContextValue | null>(null);

const failureControls: DataTableFailureControl[] = [
  {
    key: 'loadShouldFail',
    label: 'Load accounts fails',
  },
  {
    key: 'filterShouldFail',
    label: 'Filter search fails',
  },
];

const useDataTableContext = () => {
  const context = useContext(DataTableContext);

  if (!context) {
    throw new Error(
      'DataTable components must be rendered within DataTableProvider.',
    );
  }

  return context;
};

export function DataTableProvider(props: DataTableProviderProps) {
  const simulation = useDataTableSimulation();

  return (
    <DataTableContext.Provider value={{ simulation }}>
      {props.children}
    </DataTableContext.Provider>
  );
}

export function DataTableControlState(props: DataTableControlStateProps) {
  const { simulation } = useDataTableContext();

  return props.children({
    latencyMs: simulation.latencyMs,
    onLatencyChange: simulation.setLatencyMs,
    onReload: simulation.reloadData,
  });
}

export function DataTableControls() {
  const { simulation } = useDataTableContext();

  return (
    <section
      className="component-control__section"
      aria-labelledby="data-table-error-controls"
    >
      <h3
        className="component-control__section-title"
        id="data-table-error-controls"
      >
        Simulate errors
      </h3>
      {failureControls.map(control => (
        <label className="component-control__option" key={control.key}>
          <input
            type="checkbox"
            checked={simulation.settings[control.key]}
            onChange={event =>
              simulation.setSetting(control.key, event.target.checked)
            }
          />
          {control.label}
        </label>
      ))}
    </section>
  );
}

export default function DataTableWrapper() {
  const { simulation } = useDataTableContext();

  return (
    <DataTable
      errorMessage={simulation.errorMessage}
      isLoading={simulation.isLoading}
      items={simulation.items}
      columns={simulation.columns}
      selectedRowIds={simulation.selectedRowIds}
      page={simulation.page}
      pageSize={simulation.pageSize}
      query={simulation.query}
      sort={simulation.sort}
      total={simulation.total}
      onSort={simulation.onSort}
      onFilter={simulation.onFilter}
      onSelectRow={simulation.onSelectRow}
      onPageChange={simulation.onPageChange}
      title="Data Table"
    />
  );
}
