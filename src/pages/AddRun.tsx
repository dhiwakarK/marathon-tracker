import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppContext } from '../context/AppContext';
import { MarathonRun } from '../types';
import { generateId, calculatePace, parseDuration, calculateCalories } from '../utils';
import { useNavigate } from 'react-router-dom';

const steps = ['Basic Info', 'Details', 'Review'];

const AddRun: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    date: new Date(),
    distance: '',
    duration: '',
    location: '',
    type: 'training' as MarathonRun['type'],
    notes: '',
    difficulty: 3 as 1 | 2 | 3 | 4 | 5,
    enjoyment: 3 as 1 | 2 | 3 | 4 | 5,
    weather: {
      temperature: '',
      humidity: '',
      conditions: 'Clear'
    },
    heartRate: {
      avg: '',
      max: ''
    },
    elevation: ''
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    setError('');
    
    switch (step) {
      case 0: // Basic Info
        if (!formData.distance || !formData.duration || !formData.location) {
          setError('Please fill in all required fields: distance, duration, and location.');
          return false;
        }
        if (parseFloat(formData.distance) <= 0) {
          setError('Distance must be greater than 0.');
          return false;
        }
        if (!formData.duration.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
          setError('Duration must be in MM:SS or HH:MM:SS format.');
          return false;
        }
        break;
      case 1: // Details - optional fields, so no validation needed
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(0)) return;

    const durationSeconds = parseDuration(formData.duration);
    const distance = parseFloat(formData.distance);
    const pace = calculatePace(distance, durationSeconds, state.userProfile?.preferences.distanceUnit || 'miles');
    
    const newRun: MarathonRun = {
      id: generateId(),
      date: formData.date,
      distance,
      duration: formData.duration,
      pace,
      location: formData.location,
      weather: {
        temperature: parseFloat(formData.weather.temperature) || 70,
        humidity: parseFloat(formData.weather.humidity) || 50,
        conditions: formData.weather.conditions
      },
      heartRate: {
        avg: parseFloat(formData.heartRate.avg) || 0,
        max: parseFloat(formData.heartRate.max) || 0
      },
      elevation: parseFloat(formData.elevation) || 0,
      calories: calculateCalories(distance, state.userProfile?.weight),
      notes: formData.notes,
      difficulty: formData.difficulty,
      enjoyment: formData.enjoyment,
      type: formData.type,
      splits: [] // Can be enhanced later
    };

    dispatch({ type: 'ADD_RUN', payload: newRun });
    navigate('/');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(date) => handleInputChange('date', date || new Date())}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Distance"
                value={formData.distance}
                onChange={(e) => handleInputChange('distance', e.target.value)}
                helperText={`Distance in ${state.userProfile?.preferences.distanceUnit || 'miles'}`}
                type="number"
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="HH:MM:SS or MM:SS"
                helperText="Format: HH:MM:SS or MM:SS"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Park, neighborhood, track, etc."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Run Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Run Type"
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="race">Race</MenuItem>
                  <MenuItem value="long-run">Long Run</MenuItem>
                  <MenuItem value="tempo">Tempo</MenuItem>
                  <MenuItem value="interval">Interval</MenuItem>
                  <MenuItem value="recovery">Recovery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Temperature"
                value={formData.weather.temperature}
                onChange={(e) => handleInputChange('weather.temperature', e.target.value)}
                type="number"
                helperText={state.userProfile?.preferences.temperatureUnit === 'celsius' ? '°C' : '°F'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Humidity"
                value={formData.weather.humidity}
                onChange={(e) => handleInputChange('weather.humidity', e.target.value)}
                type="number"
                inputProps={{ min: 0, max: 100 }}
                helperText="%"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Weather</InputLabel>
                <Select
                  value={formData.weather.conditions}
                  label="Weather"
                  onChange={(e) => handleInputChange('weather.conditions', e.target.value)}
                >
                  <MenuItem value="Clear">Clear</MenuItem>
                  <MenuItem value="Cloudy">Cloudy</MenuItem>
                  <MenuItem value="Rainy">Rainy</MenuItem>
                  <MenuItem value="Snowy">Snowy</MenuItem>
                  <MenuItem value="Windy">Windy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Average Heart Rate"
                value={formData.heartRate.avg}
                onChange={(e) => handleInputChange('heartRate.avg', e.target.value)}
                type="number"
                helperText="bpm"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Heart Rate"
                value={formData.heartRate.max}
                onChange={(e) => handleInputChange('heartRate.max', e.target.value)}
                type="number"
                helperText="bpm"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Elevation Gain"
                value={formData.elevation}
                onChange={(e) => handleInputChange('elevation', e.target.value)}
                type="number"
                helperText="feet"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography component="legend">Difficulty</Typography>
                <Rating
                  value={formData.difficulty}
                  onChange={(_, value) => handleInputChange('difficulty', value || 3)}
                  max={5}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography component="legend">Enjoyment</Typography>
                <Rating
                  value={formData.enjoyment}
                  onChange={(_, value) => handleInputChange('enjoyment', value || 3)}
                  max={5}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="How did the run feel? Any observations?"
              />
            </Grid>
          </Grid>
        );
      
      case 2:
        const distance = parseFloat(formData.distance) || 0;
        const durationSeconds = parseDuration(formData.duration);
        const calculatedPace = calculatePace(distance, durationSeconds, state.userProfile?.preferences.distanceUnit || 'miles');
        
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Review Your Run</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Date:</strong> {formData.date.toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Distance:</strong> {formData.distance} {state.userProfile?.preferences.distanceUnit || 'miles'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Duration:</strong> {formData.duration}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Pace:</strong> {calculatedPace}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Location:</strong> {formData.location}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Type:</strong> {formData.type}</Typography>
            </Grid>
            {formData.notes && (
              <Grid item xs={12}>
                <Typography><strong>Notes:</strong> {formData.notes}</Typography>
              </Grid>
            )}
          </Grid>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Add New Run
      </Typography>
      
      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                >
                  Add Run
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddRun;