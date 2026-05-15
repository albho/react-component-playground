import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import './TodoList.scss';
import { AddIcon, CloseIcon } from './TodoListIcons';

export type TodoItem = {
  completed: boolean;
  id: string;
  label: string;
};

type TodoListMutationState = {
  pendingDeleteIds: string[];
  pendingEditIds: string[];
  pendingToggleIds: string[];
};

type TodoListFormProps = {
  isLoading: boolean;
  onAdd: (label: string) => void;
};

type TodoListItemsProps = {
  items: TodoItem[];
  mutations: TodoListMutationState;
  onDelete: (id: string) => void;
  onEdit: (id: string, label: string) => void;
  onToggle: (id: string) => void;
};

type TodoListItemProps = {
  item: TodoItem;
  isDisabled: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, label: string) => void;
  onToggle: (id: string) => void;
};

type TodoListProps = {
  errorMessage: string | null;
  items: TodoItem[];
  onAdd: (label: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, label: string) => void;
  onToggle: (id: string) => void;
  isLoading: boolean;
  mutations: TodoListMutationState;
  title: string;
};

const loadingPlaceholderItems = Array.from({ length: 3 }, (_, index) => index);

function TodoListForm(props: TodoListFormProps) {
  const inputId = 'todo-add-task';
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();

    const trimmedTodo = newTodo.trim();

    if (!trimmedTodo) {
      return;
    }

    props.onAdd(trimmedTodo);
    setNewTodo('');
  };

  return (
    <form className="todo-list__form" onSubmit={handleSubmit}>
      <label className="todo-list__label" htmlFor={inputId}>
        Add task
      </label>
      <div className="todo-list__entry">
        <input
          className="todo-list__input"
          id={inputId}
          type="text"
          value={newTodo}
          placeholder="Update README.md..."
          autoComplete="off"
          disabled={props.isLoading}
          onChange={event => setNewTodo(event.target.value)}
        />
        <button
          className="todo-list__add-button"
          type="submit"
          aria-label="Add task"
          disabled={props.isLoading}
        >
          <AddIcon />
        </button>
      </div>
    </form>
  );
}

function TodoListLoadingItems() {
  return (
    <ul
      className="todo-list__items"
      aria-label="Loading tasks"
      aria-busy="true"
    >
      {loadingPlaceholderItems.map(itemIndex => (
        <li
          className="todo-list__item todo-list__item--placeholder"
          key={itemIndex}
        >
          <span className="todo-list__placeholder-checkbox" />
          <span className="todo-list__placeholder-text" />
        </li>
      ))}
    </ul>
  );
}

function TodoListItem(props: TodoListItemProps) {
  return (
    <li
      className="todo-list__item"
      data-is-completed={props.item.completed}
      key={props.item.id}
    >
      <div className="todo-list__task">
        <label className="todo-list__check-label">
          <input
            className="todo-list__checkbox"
            type="checkbox"
            checked={props.item.completed}
            disabled={props.isDisabled}
            aria-label={`${props.item.completed ? 'Mark incomplete' : 'Mark complete'}: ${props.item.label}`}
            onChange={() => props.onToggle(props.item.id)}
          />
          <span className="todo-list__custom-checkbox" aria-hidden="true" />
        </label>
        <input
          className="todo-list__item-input"
          key={props.item.label}
          type="text"
          defaultValue={props.item.label}
          disabled={props.isDisabled}
          aria-label={`Edit task: ${props.item.label}`}
          onBlur={event => props.onEdit(props.item.id, event.target.value)}
        />
      </div>
      <button
        className="todo-list__delete-button"
        type="button"
        aria-label={`Delete task: ${props.item.label}`}
        disabled={props.isDisabled}
        onClick={() => props.onDelete(props.item.id)}
      >
        <CloseIcon />
      </button>
    </li>
  );
}

function TodoListItems(props: TodoListItemsProps) {
  if (props.items.length === 0) {
    return (
      <p className="todo-list__empty" role="status">
        No tasks yet.
      </p>
    );
  }

  return (
    <ul className="todo-list__items" aria-label="Tasks">
      {props.items.map(item => {
        const isDeleting = props.mutations.pendingDeleteIds.includes(item.id);
        const isEditing = props.mutations.pendingEditIds.includes(item.id);
        const isToggling = props.mutations.pendingToggleIds.includes(item.id);

        return (
          <TodoListItem
            isDisabled={isDeleting || isEditing || isToggling}
            item={item}
            key={item.id}
            onDelete={props.onDelete}
            onEdit={props.onEdit}
            onToggle={props.onToggle}
          />
        );
      })}
    </ul>
  );
}

export default function TodoList(props: TodoListProps) {
  return (
    <section className="todo-list">
      <header className="todo-list__header">
        <h2 className="todo-list__title">{props.title}</h2>
      </header>

      {props.errorMessage && (
        <p className="todo-list__error" role="alert">
          {props.errorMessage}
        </p>
      )}

      <TodoListForm isLoading={props.isLoading} onAdd={props.onAdd} />

      {props.isLoading ? (
        <TodoListLoadingItems />
      ) : (
        <TodoListItems
          items={props.items}
          mutations={props.mutations}
          onDelete={props.onDelete}
          onEdit={props.onEdit}
          onToggle={props.onToggle}
        />
      )}
    </section>
  );
}
