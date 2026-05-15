import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { ComponentControlState } from '../../layout/ComponentControl/ComponentControl';
import TodoList from './TodoList';
import type {
  TodoListFailureSettings,
  TodoListSimulation,
} from './useTodoListSimulation';
import { useTodoListSimulation } from './useTodoListSimulation';

type TodoListContextValue = {
  todoList: TodoListSimulation;
};

type TodoListProviderProps = {
  children: ReactNode;
};

type TodoListControlStateProps = {
  children: (controlState: ComponentControlState) => ReactNode;
};

type TodoListFailureControl = {
  key: keyof TodoListFailureSettings;
  label: string;
};

const TodoListContext = createContext<TodoListContextValue | null>(null);

const failureControls: TodoListFailureControl[] = [
  {
    key: 'loadShouldFail',
    label: 'Load tasks fails',
  },
  {
    key: 'addShouldFail',
    label: 'Add task fails',
  },
  {
    key: 'editShouldFail',
    label: 'Edit task fails',
  },
  {
    key: 'toggleShouldFail',
    label: 'Toggle task fails',
  },
  {
    key: 'deleteShouldFail',
    label: 'Delete task fails',
  },
];

const useTodoListContext = () => {
  const context = useContext(TodoListContext);

  if (!context) {
    throw new Error(
      'TodoList components must be rendered inside TodoListProvider.',
    );
  }

  return context;
};

export function TodoListProvider(props: TodoListProviderProps) {
  const todoList = useTodoListSimulation();

  return (
    <TodoListContext.Provider value={{ todoList }}>
      {props.children}
    </TodoListContext.Provider>
  );
}

export function TodoListControls() {
  const { todoList } = useTodoListContext();

  return (
    <section
      className="component-control__section"
      aria-labelledby="todo-list-error-controls"
    >
      <h3
        className="component-control__section-title"
        id="todo-list-error-controls"
      >
        Simulate errors
      </h3>
      {failureControls.map(control => (
        <label className="component-control__option" key={control.key}>
          <input
            type="checkbox"
            checked={todoList.settings[control.key]}
            onChange={event =>
              todoList.setSetting(control.key, event.target.checked)
            }
          />
          {control.label}
        </label>
      ))}
    </section>
  );
}

export function TodoListControlState(props: TodoListControlStateProps) {
  const { todoList } = useTodoListContext();

  return props.children({
    latencyMs: todoList.latencyMs,
    onLatencyChange: todoList.setLatencyMs,
    onReload: todoList.reloadTasks,
  });
}

export default function TodoListWrapper() {
  const { todoList } = useTodoListContext();

  return (
    <TodoList
      errorMessage={todoList.errorMessage}
      isLoading={todoList.isLoading}
      items={todoList.items}
      onAdd={todoList.addTodo}
      onDelete={todoList.deleteTodo}
      onEdit={todoList.editTodo}
      onToggle={todoList.toggleTodo}
      mutations={{
        pendingDeleteIds: todoList.pendingDeleteIds,
        pendingEditIds: todoList.pendingEditIds,
        pendingToggleIds: todoList.pendingToggleIds,
      }}
      title="Todo List"
    />
  );
}
