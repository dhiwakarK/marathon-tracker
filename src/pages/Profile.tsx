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
  Divider
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { UserProfile } from '../types';

const Profile: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [formData, setFormData] = useState({
    displayName: state.userProfile?.displayName || '',
    email: state.userProfile?.email || '',
    height: state.userProfile?.height?.toString() || '',
    weight: state.userProfile?.weight?.toString() || '',
    distanceUnit: state.userProfile?.preferences.distanceUnit || 'miles',
    temperatureUnit: state.userProfile?.preferences.temperatureUnit || 'fahrenheit',
    theme: state.userProfile?.preferences.theme || 'light'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!state.userProfile) return;

    const updatedProfile: UserProfile = {
      ...state.userProfile,
      displayName: formData.displayName,
      email: formData.email || undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      preferences: {
        ...state.userProfile.preferences,
        distanceUnit: formData.distanceUnit as 'miles' | 'kilometers',
        temperatureUnit: formData.temperatureUnit as 'fahrenheit' | 'celsius',
        theme: formData.theme as 'light' | 'dark' | 'system'
      }
    };

    dispatch({ type: 'UPDATE_PROFILE', payload: updatedProfile });
  };

  // Calculate statistics
  const totalRuns = state.runs.length;
  const totalDistance = state.runs.reduce((sum, run) => sum + run.distance, 0);
  const averageDistance = totalRuns > 0 ? totalDistance / totalRuns : 0;
  
  const currentYear = new Date().getFullYear();
  const thisYearRuns = state.runs.filter(run => run.date.getFullYear() === currentYear);
  const thisYearDistance = thisYearRuns.reduce((sum, run) => sum + run.distance, 0);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile & Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Running Statistics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Runs
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {totalRuns}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Distance
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {totalDistance.toFixed(1)} {formData.distanceUnit}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Average Distance
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {averageDistance.toFixed(1)} {formData.distanceUnit}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  This Year
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {thisYearDistance.toFixed(1)} {formData.distanceUnit}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    helperText="inches"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    helperText="pounds"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" component="h2" gutterBottom>
                Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Distance Unit</InputLabel>
                    <Select
                      value={formData.distanceUnit}
                      label="Distance Unit"
                      onChange={(e) => handleInputChange('distanceUnit', e.target.value)}
                    >
                      <MenuItem value="miles">Miles</MenuItem>
                      <MenuItem value="kilometers">Kilometers</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Temperature Unit</InputLabel>
                    <Select
                      value={formData.temperatureUnit}
                      label="Temperature Unit"
                      onChange={(e) => handleInputChange('temperatureUnit', e.target.value)}
                    >
                      <MenuItem value="fahrenheit">Fahrenheit (°F)</MenuItem>
                      <MenuItem value="celsius">Celsius (°C)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={formData.theme}
                      label="Theme"
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;