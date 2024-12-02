import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  order: number;
}

interface TaskState {
  tasks: Task[];
  filter: 'all' | 'completed' | 'pending' | 'overdue';
  searchQuery: string;
}

const initialState: TaskState = {
  tasks: [],
  filter: 'all',
  searchQuery: '',
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Omit<Task, 'id' | 'order'>>) => {
      const newTask = {
        ...action.payload,
        id: Date.now().toString(),
        order: state.tasks.length,
      };
      state.tasks.push(newTask);
    },
    editTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    toggleTaskComplete: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    setFilter: (state, action: PayloadAction<TaskState['filter']>) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    reorderTasks: (state, action: PayloadAction<{ startIndex: number; endIndex: number }>) => {
      const [removed] = state.tasks.splice(action.payload.startIndex, 1);
      state.tasks.splice(action.payload.endIndex, 0, removed);
      state.tasks.forEach((task, index) => {
        task.order = index;
      });
    },
  },
});

export const {
  addTask,
  editTask,
  deleteTask,
  toggleTaskComplete,
  setFilter,
  setSearchQuery,
  reorderTasks,
} = taskSlice.actions;

export default taskSlice.reducer;
