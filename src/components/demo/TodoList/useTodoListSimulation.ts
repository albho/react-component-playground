import { useRef, useState } from 'react';
import type { TodoItem } from './TodoList';

export type TodoListFailureSettings = {
  addShouldFail: boolean;
  deleteShouldFail: boolean;
  editShouldFail: boolean;
  loadShouldFail: boolean;
  toggleShouldFail: boolean;
};

export type TodoListSimulation = {
  errorMessage: string | null;
  isLoading: boolean;
  items: TodoItem[];
  latencyMs: number;
  pendingDeleteIds: string[];
  pendingEditIds: string[];
  pendingToggleIds: string[];
  settings: TodoListFailureSettings;
  addTodo: (label: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, label: string) => void;
  reloadTasks: () => void;
  setLatencyMs: (latencyMs: number) => void;
  setSetting: (
    key: keyof TodoListFailureSettings,
    shouldFail: boolean,
  ) => void;
  toggleTodo: (id: string) => void;
};

const defaultTodoListLatencyMs = 700;

const initialTodoListFailureSettings: TodoListFailureSettings = {
  addShouldFail: false,
  deleteShouldFail: false,
  editShouldFail: false,
  loadShouldFail: false,
  toggleShouldFail: false,
};

const initialTodoItems: TodoItem[] = [
  {
    id: 'todo-1',
    label: 'Review component API',
    completed: true,
  },
  {
    id: 'todo-2',
    label: 'Document accessibility states',
    completed: false,
  },
  {
    id: 'todo-3',
    label: 'Prepare release notes',
    completed: false,
  },
];

type SimulatedRequestOptions = {
  latencyMs: number;
  shouldFail: boolean;
};

const createOptimisticTodo = (id: number, label: string): TodoItem => ({
  id: `todo-${id}`,
  label,
  completed: false,
});

const getEditedTodoItems = (items: TodoItem[], id: string, label: string) =>
  items.map(item => (item.id === id ? { ...item, label } : item));

const getToggledTodoItems = (items: TodoItem[], id: string) =>
  items.map(item =>
    item.id === id ? { ...item, completed: !item.completed } : item,
  );

const simulateTodoListRequest = (options: SimulatedRequestOptions) =>
  new Promise<void>((resolve, reject) => {
    window.setTimeout(() => {
      if (options.shouldFail) {
        reject(new Error('Request failed'));
        return;
      }

      resolve();
    }, options.latencyMs);
  });

export function useTodoListSimulation(): TodoListSimulation {
  const [items, setItems] = useState(initialTodoItems);
  const [settings, setSettings] = useState(initialTodoListFailureSettings);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [latencyMs, setLatencyMs] = useState(defaultTodoListLatencyMs);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [pendingEditIds, setPendingEditIds] = useState<string[]>([]);
  const [pendingToggleIds, setPendingToggleIds] = useState<string[]>([]);
  const nextIdRef = useRef(initialTodoItems.length + 1);

  const setSetting = (
    key: keyof TodoListFailureSettings,
    shouldFail: boolean,
  ) => {
    setSettings(currentSettings => ({
      ...currentSettings,
      [key]: shouldFail,
    }));
  };

  const reloadTasks = () => {
    setErrorMessage(null);
    setIsLoading(true);

    simulateTodoListRequest({
      latencyMs,
      shouldFail: settings.loadShouldFail,
    })
      .then(() => {
        setItems(initialTodoItems);
      })
      .catch(() => {
        setItems([]);
        setErrorMessage('Tasks could not be loaded.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const addTodo = (label: string) => {
    const optimisticTodo = createOptimisticTodo(nextIdRef.current, label);

    nextIdRef.current += 1;
    setErrorMessage(null);
    setItems(currentItems => [...currentItems, optimisticTodo]);

    simulateTodoListRequest({
      latencyMs,
      shouldFail: settings.addShouldFail,
    }).catch(() => {
      setItems(currentItems =>
        currentItems.filter(item => item.id !== optimisticTodo.id),
      );
      setErrorMessage('Task could not be added.');
    });
  };

  const deleteTodo = (id: string) => {
    const deletedItem = items.find(item => item.id === id);

    if (!deletedItem) {
      return;
    }

    setErrorMessage(null);
    setPendingDeleteIds(currentIds => [...currentIds, id]);
    setItems(currentItems => currentItems.filter(item => item.id !== id));

    simulateTodoListRequest({
      latencyMs,
      shouldFail: settings.deleteShouldFail,
    })
      .catch(() => {
        setItems(currentItems => [...currentItems, deletedItem]);
        setErrorMessage('Task could not be deleted.');
      })
      .finally(() => {
        setPendingDeleteIds(currentIds =>
          currentIds.filter(currentId => currentId !== id),
        );
      });
  };

  const editTodo = (id: string, label: string) => {
    const trimmedLabel = label.trim();
    const existingItem = items.find(item => item.id === id);

    if (!existingItem || !trimmedLabel || existingItem.label === trimmedLabel) {
      return;
    }

    setErrorMessage(null);
    setPendingEditIds(currentIds => [...currentIds, id]);
    setItems(currentItems =>
      getEditedTodoItems(currentItems, id, trimmedLabel),
    );

    simulateTodoListRequest({
      latencyMs,
      shouldFail: settings.editShouldFail,
    })
      .catch(() => {
        setItems(currentItems =>
          currentItems.map(item => (item.id === id ? existingItem : item)),
        );
        setErrorMessage('Task could not be edited.');
      })
      .finally(() => {
        setPendingEditIds(currentIds =>
          currentIds.filter(currentId => currentId !== id),
        );
      });
  };

  const toggleTodo = (id: string) => {
    const existingItem = items.find(item => item.id === id);

    if (!existingItem) {
      return;
    }

    setErrorMessage(null);
    setPendingToggleIds(currentIds => [...currentIds, id]);
    setItems(currentItems => getToggledTodoItems(currentItems, id));

    simulateTodoListRequest({
      latencyMs,
      shouldFail: settings.toggleShouldFail,
    })
      .catch(() => {
        setItems(currentItems =>
          currentItems.map(item => (item.id === id ? existingItem : item)),
        );
        setErrorMessage('Task could not be updated.');
      })
      .finally(() => {
        setPendingToggleIds(currentIds =>
          currentIds.filter(currentId => currentId !== id),
        );
      });
  };

  return {
    addTodo,
    deleteTodo,
    editTodo,
    errorMessage,
    isLoading,
    items,
    latencyMs,
    pendingDeleteIds,
    pendingEditIds,
    pendingToggleIds,
    reloadTasks,
    setLatencyMs,
    setSetting,
    settings,
    toggleTodo,
  };
}
