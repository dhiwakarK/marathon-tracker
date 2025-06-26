import { format } from 'date-fns';

// Format duration from seconds to HH:MM:SS
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Parse duration string (HH:MM:SS) to seconds
export const parseDuration = (duration: string): number => {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

// Calculate pace from distance and duration
export const calculatePace = (distance: number, durationSeconds: number, unit: 'miles' | 'kilometers' = 'miles'): string => {
  if (distance === 0) return '00:00';
  
  const paceSeconds = durationSeconds / distance;
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.floor(paceSeconds % 60);
  
  const unitSuffix = unit === 'miles' ? '/mi' : '/km';
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}${unitSuffix}`;
};

// Convert miles to kilometers
export const milesToKm = (miles: number): number => miles * 1.60934;

// Convert kilometers to miles
export const kmToMiles = (km: number): number => km / 1.60934;

// Convert distance based on unit preference
export const convertDistance = (distance: number, fromUnit: 'miles' | 'kilometers', toUnit: 'miles' | 'kilometers'): number => {
  if (fromUnit === toUnit) return distance;
  
  if (fromUnit === 'miles' && toUnit === 'kilometers') {
    return milesToKm(distance);
  } else if (fromUnit === 'kilometers' && toUnit === 'miles') {
    return kmToMiles(distance);
  }
  
  return distance;
};

// Format date for display
export const formatDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

// Format date and time for display
export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM dd, yyyy HH:mm');
};

// Calculate total distance for an array of runs
export const calculateTotalDistance = (runs: { distance: number }[]): number => {
  return runs.reduce((total, run) => total + run.distance, 0);
};

// Calculate average pace for an array of runs
export const calculateAveragePace = (runs: { distance: number; duration: string }[], unit: 'miles' | 'kilometers' = 'miles'): string => {
  if (runs.length === 0) return '00:00';
  
  const totalDistance = calculateTotalDistance(runs);
  const totalSeconds = runs.reduce((total, run) => total + parseDuration(run.duration), 0);
  
  return calculatePace(totalDistance, totalSeconds, unit);
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Calculate calories burned (rough estimation)
export const calculateCalories = (distance: number, weight: number = 150, unit: 'miles' | 'kilometers' = 'miles'): number => {
  // Rough calculation: ~100 calories per mile for average person
  const distanceInMiles = unit === 'kilometers' ? kmToMiles(distance) : distance;
  const weightFactor = weight / 150; // Adjust for weight (150 lbs baseline)
  return Math.round(distanceInMiles * 100 * weightFactor);
};

// Format number with one decimal place
export const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals);
};

// Get run type color for UI
export const getRunTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    'training': '#2196F3',
    'race': '#F44336',
    'long-run': '#4CAF50',
    'tempo': '#FF9800',
    'interval': '#9C27B0',
    'recovery': '#607D8B'
  };
  return colors[type] || '#757575';
};

// Get difficulty color for UI
export const getDifficultyColor = (difficulty: number): string => {
  const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
  return colors[difficulty - 1] || '#757575';
};