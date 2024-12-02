import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { RootState } from '../app/store';
import {
  Task,
  addTask,
  editTask,
  deleteTask,
  toggleTaskComplete,
  setFilter,
  setSearchQuery,
  reorderTasks,
} from '../features/tasks/taskSlice';

export default function TaskDashboard() {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const filter = useSelector((state: RootState) => state.tasks.filter);
  const searchQuery = useSelector((state: RootState) => state.tasks.searchQuery);

  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const handleAddTask = () => {
    if (title && dueDate) {
      dispatch(
        addTask({
          title,
          description,
          dueDate: dueDate.toISOString(),
          completed: false,
        })
      );
      handleClose();
    }
  };

  const handleEditTask = () => {
    if (editingTask && title && dueDate) {
      dispatch(
        editTask({
          ...editingTask,
          title,
          description,
          dueDate: dueDate.toISOString(),
        })
      );
      handleClose();
    }
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      dispatch(deleteTask(taskToDelete));
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDueDate(null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    dispatch(
      reorderTasks({
        startIndex: result.source.index,
        endIndex: result.destination.index,
      })
    );
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (searchQuery) {
        return task.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      switch (filter) {
        case 'completed':
          return task.completed;
        case 'pending':
          return !task.completed;
        case 'overdue':
          return new Date(task.dueDate) < new Date() && !task.completed;
        default:
          return true;
      }
    })
    .sort((a, b) => a.order - b.order);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Task Dashboard
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Search tasks"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            sx={{ mb: 2 }}
          />

          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, value) => value && dispatch(setFilter(value))}
            aria-label="task filter"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="completed">Completed</ToggleButton>
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="overdue">Overdue</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ mb: 3 }}
        >
          Add Task
        </Button>

        <DragDropContext onDragEnd={handleDragEnd}>
          {filteredTasks.length > 0 && (
            <Droppable droppableId="tasks">
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ minHeight: '100px' }}
                >
                  {filteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{ mb: 2 }}
                        >
                          <CardContent>
                            <Typography
                              variant="h6"
                              sx={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Typography color="text.secondary">{task.description}</Typography>
                            <Typography color="text.secondary">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              onClick={() => dispatch(toggleTaskComplete(task.id))}
                            >
                              {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                            </Button>
                            <IconButton
                              onClick={() => {
                                setEditingTask(task);
                                setTitle(task.title);
                                setDescription(task.description);
                                setDueDate(new Date(task.dueDate));
                                setOpen(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setTaskToDelete(task.id);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          )}
        </DragDropContext>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={(newValue) => setDueDate(newValue)}
              sx={{ mt: 2, width: '100%' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={editingTask ? handleEditTask : handleAddTask}>
              {editingTask ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this task?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
