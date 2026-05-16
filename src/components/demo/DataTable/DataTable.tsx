import type { CSSProperties, SyntheticEvent } from 'react';
import { useState } from 'react';
import './DataTable.scss';

export type DataItem = {
  id: string;
  account: string;
  owner: string;
  status: 'Active' | 'At risk' | 'Onboarding';
  seats: number;
  value: number;
};

export type DataTableSortDirection = 'ascending' | 'descending';

export type DataTableSortState = {
  columnKey: keyof DataItem;
  direction: DataTableSortDirection;
} | null;

export type DataColumn = {
  key: keyof DataItem;
  label: string;
  width?: number;
};

type DataTableProps = {
  errorMessage: string | null;
  items: DataItem[];
  columns: DataColumn[];
  isLoading: boolean;
  onSort: (columnKey: keyof DataItem) => void;
  onFilter: (query: string) => void;
  onSelectRow: (id: string) => void;
  selectedRowIds: string[];
  page: number;
  pageSize: number;
  query: string;
  sort: DataTableSortState;
  total: number;
  onPageChange: (page: number) => void;
  title: string;
};

const loadingRowIndexes = Array.from({ length: 5 }, (_, index) => index);

const getCellValue = (item: DataItem, columnKey: keyof DataItem) => {
  if (columnKey === 'value') {
    return new Intl.NumberFormat('en-US', {
      currency: 'USD',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(item[columnKey]);
  }

  return String(item[columnKey]);
};

const getSortLabel = (column: DataColumn, sort: DataTableSortState) => {
  if (sort?.columnKey !== column.key) {
    return `Sort by ${column.label}`;
  }

  return `Sort by ${column.label}, currently ${
    sort.direction === 'ascending' ? 'ascending' : 'descending'
  }`;
};

const getSortIndicator = (column: DataColumn, sort: DataTableSortState) => {
  const isNumericColumn = column.key === 'seats' || column.key === 'value';

  if (sort?.columnKey !== column.key) {
    return isNumericColumn ? '1-9' : 'A-Z';
  }

  if (isNumericColumn) {
    return sort.direction === 'ascending' ? '1-9' : '9-1';
  }

  return sort.direction === 'ascending' ? 'A-Z' : 'Z-A';
};

function DataTableLoadingRows(props: { columns: DataColumn[]; rows: number }) {
  return (
    <tbody aria-label="Loading rows" aria-busy="true">
      {loadingRowIndexes.slice(0, props.rows).map(rowIndex => (
        <tr
          className="data-table__row data-table__row--placeholder"
          key={rowIndex}
        >
          {props.columns.map(column => (
            <td
              className="data-table__cell data-table__cell--placeholder"
              key={column.key}
            >
              <span className="data-table__placeholder" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function DataTableEmptyRows(props: { columns: DataColumn[] }) {
  return (
    <tbody>
      <tr className="data-table__row data-table__row--empty">
        <td className="data-table__cell" colSpan={props.columns.length}>
          No accounts found.
        </td>
      </tr>
    </tbody>
  );
}

export default function DataTable(props: DataTableProps) {
  const [filterInput, setFilterInput] = useState(props.query);
  const tableStyle = {
    '--data-table-min-width': `${props.columns.reduce(
      (totalWidth, column) => totalWidth + (column.width ?? 0),
      0,
    )}px`,
  } as CSSProperties;

  const handleFilterSubmit = (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();

    if (filterInput.trim() === '') {
      return;
    }

    props.onFilter(filterInput.trim());
  };

  const pageCount = Math.max(1, Math.ceil(props.total / props.pageSize));

  return (
    <section className="data-table">
      <header className="data-table__header">
        <div>
          <h2 className="data-table__title">{props.title}</h2>
          <p className="data-table__summary">
            {props.total} accounts · {props.selectedRowIds.length} selected
          </p>
        </div>
        <form className="data-table__filter" onSubmit={handleFilterSubmit}>
          <label
            className="data-table__filter-label"
            htmlFor="data-table-filter"
          >
            Filter accounts
          </label>
          <input
            id="data-table-filter"
            className="data-table__filter-input"
            type="search"
            placeholder="Search company, owner, status..."
            value={filterInput}
            disabled={props.isLoading}
            onChange={event => setFilterInput(event.target.value)}
          />
          <button
            className="data-table__filter-button"
            type="submit"
            disabled={props.isLoading}
          >
            Apply
          </button>
        </form>
      </header>

      {props.errorMessage && (
        <p className="data-table__error" role="alert">
          {props.errorMessage}
        </p>
      )}

      <div className="data-table__table-scroll">
        <table
          className="data-table__table"
          aria-busy={props.isLoading}
          style={tableStyle}
        >
          <thead>
            <tr>
              {props.columns.map(column => (
                <th
                  key={column.key}
                  style={{ minWidth: column.width }}
                  className="data-table__header-cell"
                  aria-sort={
                    props.sort?.columnKey === column.key
                      ? props.sort.direction
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className="data-table__sort-button"
                    disabled={props.isLoading}
                    aria-label={getSortLabel(column, props.sort)}
                    onClick={() => props.onSort(column.key)}
                  >
                    <span>{column.label}</span>
                    <span
                      className="data-table__sort-indicator"
                      aria-hidden="true"
                    >
                      {getSortIndicator(column, props.sort)}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          {props.isLoading ? (
            <DataTableLoadingRows
              columns={props.columns}
              rows={props.pageSize}
            />
          ) : props.items.length === 0 ? (
            <DataTableEmptyRows columns={props.columns} />
          ) : (
            <tbody>
              {props.items.map(item => (
                <tr
                  key={item.id}
                  className={`data-table__row${
                    props.selectedRowIds.includes(item.id)
                      ? ' data-table__row--selected'
                      : ''
                  }`}
                  onClick={() => props.onSelectRow(item.id)}
                >
                  {props.columns.map(column => (
                    <td
                      key={column.key}
                      className="data-table__cell"
                      data-column-key={column.key}
                    >
                      {getCellValue(item, column.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      <div className="data-table__pagination">
        <button
          className="data-table__page-button"
          type="button"
          disabled={props.isLoading || props.page <= 1}
          onClick={() => props.onPageChange(props.page - 1)}
        >
          Prev
        </button>
        <span className="data-table__page-info">
          Page {props.page} of {pageCount}
        </span>
        <button
          className="data-table__page-button"
          type="button"
          disabled={props.isLoading || props.page >= pageCount}
          onClick={() => props.onPageChange(props.page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
