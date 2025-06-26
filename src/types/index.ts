// Data Models for Marathon Tracker Application

export interface MarathonRun {
  id: string;
  date: Date;
  distance: number;
  duration: string;  // Format: "HH:MM:SS"
  pace: string;      // Format: "MM:SS /mile or /km"
  location: string;
  route?: { name?: string, gpxData?: string };
  
  // Weather conditions during run
  weather: {
    temperature: number;  // in degrees (C/F based on user setting)
    humidity: number;     // percentage
    windSpeed?: number;   // in mph or kph
    conditions: string;   // e.g., "Sunny", "Rainy", "Cloudy"
  };
  
  // Heart rate data if available
  heartRate: {
    avg: number;
    max: number;
    zones?: Array<{ zone: number, minutes: number }>;
  };
  
  elevation: number;     // total elevation gain in feet/meters
  calories: number;      // estimated calories burned
  notes: string;         // personal notes about the run
  
  // Rating fields
  difficulty: 1 | 2 | 3 | 4 | 5;  // perceived effort
  enjoyment?: 1 | 2 | 3 | 4 | 5;  // how enjoyable was the run
  
  // Run categorization
  type: 'training' | 'race' | 'long-run' | 'tempo' | 'interval' | 'recovery';
  tags?: string[];       // custom tags for filtering
  
  // Split data for pace analysis
  splits: Array<{
    mile: number;        // or kilometer based on preference
    time: string;        // Format: "MM:SS"
    pace: string;        // Format: "MM:SS /mile or /km"
    elevation?: number;  // elevation gain in this split
  }>;
  
  // Equipment used
  equipmentId?: string;  // reference to shoes/gear used
}

export interface TrainingGoal {
  id: string;
  title: string;
  description?: string;
  
  // Goal metrics
  targetType: 'distance' | 'time' | 'pace' | 'race' | 'custom';
  targetDistance?: number;
  targetTime?: string;
  targetPace?: string;
  
  // Time frame
  startDate: Date;
  deadline: Date;
  recurringType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  // Progress tracking
  progress: number;     // percentage complete 0-100
  currentValue?: number;  // current progress value
  isCompleted: boolean;
  completionDate?: Date;
  
  // Related runs
  associatedRunIds?: string[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  goalRaceDate?: Date;
  goalRaceDistance?: number;
  targetTime?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Plan structure
  startDate: Date;
  endDate: Date;
  weeks: Array<{
    weekNumber: number;
    weeklyDistance: number;
    workouts: Array<{
      day: number; // 0-6, where 0 is Sunday
      workoutType: 'rest' | 'easy' | 'tempo' | 'interval' | 'long' | 'recovery' | 'race';
      distance?: number;
      duration?: string;
      description: string;
      isCompleted: boolean;
      associatedRunId?: string;
    }>;
  }>;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'shoes' | 'watch' | 'apparel' | 'other';
  brand?: string;
  model?: string;
  dateAdded: Date;
  isRetired: boolean;
  retirementDate?: Date;
  notes?: string;
  
  // Usage tracking
  totalMileage: number;
  maxRecommendedMileage?: number;
  associatedRunIds: string[];
}

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: string;
  height?: number;
  weight?: number;
  
  // Preferences
  preferences: {
    distanceUnit: 'miles' | 'kilometers';
    temperatureUnit: 'fahrenheit' | 'celsius';
    theme: 'light' | 'dark' | 'system';
    dashboardLayout?: any;
  };
  
  // Performance metrics
  personalBests: {
    fiveK?: { time: string, date: Date, runId?: string };
    tenK?: { time: string, date: Date, runId?: string };
    halfMarathon?: { time: string, date: Date, runId?: string };
    marathon?: { time: string, date: Date, runId?: string };
    // other custom distances
  };
  
  // Stats
  totalLifetimeMiles: number;
  longestRun?: { distance: number, date: Date, runId: string };
  yearToDateStats: { distance: number, runs: number, hours: number };
}

// Action types for useReducer
export type AppAction = 
  | { type: 'ADD_RUN'; payload: MarathonRun }
  | { type: 'UPDATE_RUN'; payload: MarathonRun }
  | { type: 'DELETE_RUN'; payload: string }
  | { type: 'ADD_GOAL'; payload: TrainingGoal }
  | { type: 'UPDATE_GOAL'; payload: TrainingGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'SET_RUNS'; payload: MarathonRun[] }
  | { type: 'SET_GOALS'; payload: TrainingGoal[] };

// Application state
export interface AppState {
  runs: MarathonRun[];
  goals: TrainingGoal[];
  trainingPlans: TrainingPlan[];
  equipment: Equipment[];
  userProfile: UserProfile | null;
}