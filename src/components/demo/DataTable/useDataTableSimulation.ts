import { useState } from 'react';
import type { DataColumn, DataItem, DataTableSortState } from './DataTable';
import { defaultSimulationLatencyMs } from '../simulationSettings';

export type DataTableFailureSettings = {
  filterShouldFail: boolean;
  loadShouldFail: boolean;
};

export type DataTableSimulation = {
  columns: DataColumn[];
  errorMessage: string | null;
  isLoading: boolean;
  items: DataItem[];
  latencyMs: number;
  page: number;
  pageSize: number;
  query: string;
  selectedRowIds: string[];
  settings: DataTableFailureSettings;
  sort: DataTableSortState;
  total: number;
  reloadData: () => void;
  setLatencyMs: (latencyMs: number) => void;
  setSetting: (key: keyof DataTableFailureSettings, value: boolean) => void;
  onSort: (columnKey: keyof DataItem) => void;
  onFilter: (query: string) => void;
  onSelectRow: (id: string) => void;
  onPageChange: (page: number) => void;
};

const initialDataTableFailureSettings: DataTableFailureSettings = {
  filterShouldFail: false,
  loadShouldFail: false,
};

const initialData: DataItem[] = [
  {
    id: 'acct-1048',
    account: 'Northstar Supply',
    owner: 'Maya Chen',
    status: 'Active',
    seats: 42,
    value: 18400,
  },
  {
    id: 'acct-1092',
    account: 'Brightline Health',
    owner: 'Jon Bell',
    status: 'At risk',
    seats: 18,
    value: 7200,
  },
  {
    id: 'acct-1127',
    account: 'Canyon Labs',
    owner: 'Priya Shah',
    status: 'Onboarding',
    seats: 31,
    value: 12600,
  },
  {
    id: 'acct-1184',
    account: 'Harbor Freight Co.',
    owner: 'Elliot Park',
    status: 'Active',
    seats: 64,
    value: 29200,
  },
  {
    id: 'acct-1216',
    account: 'Meridian Studio',
    owner: 'Nora Ortiz',
    status: 'Active',
    seats: 12,
    value: 5100,
  },
  {
    id: 'acct-1265',
    account: 'Summit Foods',
    owner: 'Theo Wright',
    status: 'At risk',
    seats: 27,
    value: 9800,
  },
  {
    id: 'acct-1303',
    account: 'Orbit Analytics',
    owner: 'Maya Chen',
    status: 'Active',
    seats: 55,
    value: 24100,
  },
  {
    id: 'acct-1349',
    account: 'Keystone Capital',
    owner: 'Jon Bell',
    status: 'Onboarding',
    seats: 23,
    value: 11600,
  },
  {
    id: 'acct-1395',
    account: 'Redwood Logistics',
    owner: 'Priya Shah',
    status: 'Active',
    seats: 76,
    value: 33800,
  },
  {
    id: 'acct-1431',
    account: 'Bluebird Retail',
    owner: 'Nora Ortiz',
    status: 'At risk',
    seats: 9,
    value: 3900,
  },
];

const dataTableColumns: DataColumn[] = [
  { key: 'account', label: 'Account', width: 220 },
  { key: 'owner', label: 'Owner', width: 150 },
  { key: 'status', label: 'Status', width: 120 },
  { key: 'seats', label: 'Seats', width: 90 },
  { key: 'value', label: 'ARR', width: 110 },
];

type SimulatedDataTableRequestOptions = {
  latencyMs: number;
  shouldFail: boolean;
};

const simulateDataTableRequest = (options: SimulatedDataTableRequestOptions) =>
  new Promise<void>((resolve, reject) => {
    window.setTimeout(() => {
      if (options.shouldFail) {
        reject(new Error('Request failed'));
        return;
      }

      resolve();
    }, options.latencyMs);
  });

const getFilteredItems = (query: string) => {
  const normalizedQuery = query.toLowerCase();

  if (!normalizedQuery) {
    return initialData;
  }

  return initialData.filter(item =>
    [
      item.id,
      item.account,
      item.owner,
      item.status,
      String(item.seats),
      String(item.value),
    ].some(value => value.toLowerCase().includes(normalizedQuery)),
  );
};

const getSortedItems = (items: DataItem[], sort: DataTableSortState) => {
  if (!sort) {
    return items;
  }

  return [...items].sort((firstItem, secondItem) => {
    const firstValue = firstItem[sort.columnKey];
    const secondValue = secondItem[sort.columnKey];
    const directionMultiplier = sort.direction === 'ascending' ? 1 : -1;

    if (typeof firstValue === 'number' && typeof secondValue === 'number') {
      return (firstValue - secondValue) * directionMultiplier;
    }

    return (
      String(firstValue).localeCompare(String(secondValue)) *
      directionMultiplier
    );
  });
};

const getNextSortState = (
  currentSort: DataTableSortState,
  columnKey: keyof DataItem,
): DataTableSortState => {
  if (currentSort?.columnKey !== columnKey) {
    return {
      columnKey,
      direction: 'ascending',
    };
  }

  return {
    columnKey,
    direction:
      currentSort.direction === 'ascending' ? 'descending' : 'ascending',
  };
};

export function useDataTableSimulation(): DataTableSimulation {
  const [filteredItems, setFilteredItems] = useState(initialData);
  const [query, setQuery] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [sort, setSort] = useState<DataTableSortState>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState(defaultSimulationLatencyMs);
  const [settings, setSettings] = useState(initialDataTableFailureSettings);
  const pageSize = 5;

  const onSelectRow = (id: string) => {
    setSelectedRowIds(currentIds =>
      currentIds.includes(id)
        ? currentIds.filter(currentId => currentId !== id)
        : [...currentIds, id],
    );
  };

  const loadQuery = (
    nextQuery: string,
    shouldFail: boolean,
    failureMessage: string,
  ) => {
    setErrorMessage(null);
    setIsLoading(true);

    simulateDataTableRequest({
      latencyMs,
      shouldFail,
    })
      .then(() => {
        setFilteredItems(getFilteredItems(nextQuery));
        setQuery(nextQuery);
        setPage(1);
      })
      .catch(() => {
        setFilteredItems([]);
        setQuery(nextQuery);
        setPage(1);
        setErrorMessage(failureMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onPageChange = (newPage: number) => {
    setErrorMessage(null);
    setIsLoading(true);

    simulateDataTableRequest({
      latencyMs,
      shouldFail: false,
    })
      .then(() => {
        setPage(newPage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const reloadData = () => {
    loadQuery(query, settings.loadShouldFail, 'Accounts could not be loaded.');
  };

  const onFilter = (nextQuery: string) => {
    loadQuery(
      nextQuery,
      settings.filterShouldFail,
      'Search is temporarily unavailable. Try again in a moment.',
    );
  };

  const onSort = (columnKey: keyof DataItem) => {
    setErrorMessage(null);
    setIsLoading(true);

    simulateDataTableRequest({
      latencyMs,
      shouldFail: false,
    })
      .then(() => {
        setSort(currentSort => getNextSortState(currentSort, columnKey));
        setPage(1);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const sortedItems = getSortedItems(filteredItems, sort);
  const startIndex = (page - 1) * pageSize;
  const displayedItems = sortedItems.slice(startIndex, startIndex + pageSize);

  return {
    columns: dataTableColumns,
    errorMessage,
    isLoading,
    items: displayedItems,
    latencyMs,
    page,
    pageSize,
    query,
    selectedRowIds,
    settings,
    sort,
    total: filteredItems.length,
    reloadData,
    setLatencyMs,
    setSetting: (key, value) =>
      setSettings(currentSettings => ({
        ...currentSettings,
        [key]: value,
      })),
    onFilter,
    onSort,
    onSelectRow,
    onPageChange,
  };
}
