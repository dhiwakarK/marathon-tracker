import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppContext } from '../context/AppContext';
import { TrainingGoal } from '../types';
import { generateId, formatDate } from '../utils';

const Goals: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetType: 'distance' as TrainingGoal['targetType'],
    targetDistance: '',
    targetTime: '',
    deadline: new Date()
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.deadline) return;

    const newGoal: TrainingGoal = {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      targetType: formData.targetType,
      targetDistance: formData.targetDistance ? parseFloat(formData.targetDistance) : undefined,
      targetTime: formData.targetTime || undefined,
      startDate: new Date(),
      deadline: formData.deadline,
      progress: 0,
      isCompleted: false
    };

    dispatch({ type: 'ADD_GOAL', payload: newGoal });
    setDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      targetType: 'distance',
      targetDistance: '',
      targetTime: '',
      deadline: new Date()
    });
  };

  const calculateProgress = (goal: TrainingGoal): number => {
    if (goal.targetType === 'distance' && goal.targetDistance) {
      const totalDistance = state.runs
        .filter(run => run.date >= goal.startDate && run.date <= goal.deadline)
        .reduce((sum, run) => sum + run.distance, 0);
      return Math.min((totalDistance / goal.targetDistance) * 100, 100);
    }
    return goal.progress;
  };

  const activeGoals = state.goals.filter(goal => !goal.isCompleted);
  const completedGoals = state.goals.filter(goal => goal.isCompleted);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Goal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Active Goals */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Active Goals
              </Typography>
              {activeGoals.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active goals. Create your first goal to start tracking your progress!
                </Typography>
              ) : (
                <List>
                  {activeGoals.map((goal) => {
                    const progress = calculateProgress(goal);
                    return (
                      <ListItem key={goal.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                        <Box width="100%">
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6">{goal.title}</Typography>
                            <Chip
                              label={goal.targetType}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          {goal.description && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {goal.description}
                            </Typography>
                          )}
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(progress)}%
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              Target: {goal.targetDistance ? `${goal.targetDistance} ${state.userProfile?.preferences.distanceUnit || 'miles'}` : goal.targetTime || 'Custom'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Due: {formatDate(goal.deadline)}
                            </Typography>
                          </Box>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Completed Goals */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Completed Goals
              </Typography>
              {completedGoals.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No completed goals yet.
                </Typography>
              ) : (
                <List>
                  {completedGoals.slice(0, 5).map((goal) => (
                    <ListItem key={goal.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={goal.title}
                        secondary={goal.completionDate ? formatDate(goal.completionDate) : 'Completed'}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Goal Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Goal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Goal Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Run 100 miles this month"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional description of your goal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Goal Type</InputLabel>
                <Select
                  value={formData.targetType}
                  label="Goal Type"
                  onChange={(e) => handleInputChange('targetType', e.target.value)}
                >
                  <MenuItem value="distance">Distance</MenuItem>
                  <MenuItem value="time">Time</MenuItem>
                  <MenuItem value="pace">Pace</MenuItem>
                  <MenuItem value="race">Race</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Deadline"
                  value={formData.deadline}
                  onChange={(date) => handleInputChange('deadline', date || new Date())}
                />
              </LocalizationProvider>
            </Grid>
            {formData.targetType === 'distance' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Distance"
                  value={formData.targetDistance}
                  onChange={(e) => handleInputChange('targetDistance', e.target.value)}
                  type="number"
                  helperText={`Distance in ${state.userProfile?.preferences.distanceUnit || 'miles'}`}
                />
              </Grid>
            )}
            {(formData.targetType === 'time' || formData.targetType === 'pace') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Time"
                  value={formData.targetTime}
                  onChange={(e) => handleInputChange('targetTime', e.target.value)}
                  placeholder="e.g., 4:00:00 for marathon"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title || !formData.deadline}
          >
            Add Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Goals;