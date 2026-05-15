import TodoListWrapper, {
  TodoListControlState,
  TodoListControls,
  TodoListProvider,
} from './TodoList/TodoListWrapper';

export const libraryComponents = [
  {
    id: 'todo-list',
    label: 'Todo List',
    ControlState: TodoListControlState,
    Controls: TodoListControls,
    Preview: TodoListWrapper,
    Provider: TodoListProvider,
  },
] as const;

export type LibraryComponentId = (typeof libraryComponents)[number]['id'];

export const getLibraryComponent = (id: LibraryComponentId) =>
  libraryComponents.find(component => component.id === id) ??
  libraryComponents[0];
