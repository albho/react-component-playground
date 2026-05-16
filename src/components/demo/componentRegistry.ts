import DataTableWrapper, {
  DataTableControlState,
  DataTableControls,
  DataTableProvider,
} from './DataTable/DataTableWrapper';
import TodoListWrapper, {
  TodoListControlState,
  TodoListControls,
  TodoListProvider,
} from './TodoList/TodoListWrapper';

export const demoComponents = [
  {
    id: 'data-table',
    label: 'Data Table',
    ControlState: DataTableControlState,
    Controls: DataTableControls,
    Preview: DataTableWrapper,
    Provider: DataTableProvider,
  },
  {
    id: 'todo-list',
    label: 'Todo List',
    ControlState: TodoListControlState,
    Controls: TodoListControls,
    Preview: TodoListWrapper,
    Provider: TodoListProvider,
  },
] as const;

export type DemoComponentId = (typeof demoComponents)[number]['id'];

export const getDemoComponent = (id: DemoComponentId) =>
  demoComponents.find(component => component.id === id) ?? demoComponents[0];
