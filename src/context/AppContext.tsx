import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction } from '../types';

// Initial state
const initialState: AppState = {
  runs: [],
  goals: [],
  trainingPlans: [],
  equipment: [],
  userProfile: {
    id: '1',
    displayName: 'Marathon Runner',
    preferences: {
      distanceUnit: 'miles',
      temperatureUnit: 'fahrenheit',
      theme: 'light'
    },
    personalBests: {},
    totalLifetimeMiles: 0,
    yearToDateStats: { distance: 0, runs: 0, hours: 0 }
  }
};

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_RUN':
      const newRuns = [...state.runs, action.payload];
      return {
        ...state,
        runs: newRuns,
        userProfile: state.userProfile ? {
          ...state.userProfile,
          totalLifetimeMiles: newRuns.reduce((total, run) => total + run.distance, 0),
          yearToDateStats: {
            ...state.userProfile.yearToDateStats,
            distance: newRuns.reduce((total, run) => total + run.distance, 0),
            runs: newRuns.length
          }
        } : state.userProfile
      };
    
    case 'UPDATE_RUN':
      const updatedRuns = state.runs.map(run => 
        run.id === action.payload.id ? action.payload : run
      );
      return {
        ...state,
        runs: updatedRuns,
        userProfile: state.userProfile ? {
          ...state.userProfile,
          totalLifetimeMiles: updatedRuns.reduce((total, run) => total + run.distance, 0),
          yearToDateStats: {
            ...state.userProfile.yearToDateStats,
            distance: updatedRuns.reduce((total, run) => total + run.distance, 0),
            runs: updatedRuns.length
          }
        } : state.userProfile
      };
    
    case 'DELETE_RUN':
      const filteredRuns = state.runs.filter(run => run.id !== action.payload);
      return {
        ...state,
        runs: filteredRuns,
        userProfile: state.userProfile ? {
          ...state.userProfile,
          totalLifetimeMiles: filteredRuns.reduce((total, run) => total + run.distance, 0),
          yearToDateStats: {
            ...state.userProfile.yearToDateStats,
            distance: filteredRuns.reduce((total, run) => total + run.distance, 0),
            runs: filteredRuns.length
          }
        } : state.userProfile
      };
    
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload]
      };
    
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal => 
          goal.id === action.payload.id ? action.payload : goal
        )
      };
    
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload)
      };
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        userProfile: action.payload
      };
    
    case 'SET_RUNS':
      return {
        ...state,
        runs: action.payload
      };
    
    case 'SET_GOALS':
      return {
        ...state,
        goals: action.payload
      };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRuns = localStorage.getItem('marathon-runs');
    const savedGoals = localStorage.getItem('marathon-goals');
    const savedProfile = localStorage.getItem('marathon-profile');

    if (savedRuns) {
      try {
        const runs = JSON.parse(savedRuns).map((run: any) => ({
          ...run,
          date: new Date(run.date)
        }));
        dispatch({ type: 'SET_RUNS', payload: runs });
      } catch (error) {
        console.error('Error loading runs from localStorage:', error);
      }
    }

    if (savedGoals) {
      try {
        const goals = JSON.parse(savedGoals).map((goal: any) => ({
          ...goal,
          startDate: new Date(goal.startDate),
          deadline: new Date(goal.deadline),
          completionDate: goal.completionDate ? new Date(goal.completionDate) : undefined
        }));
        dispatch({ type: 'SET_GOALS', payload: goals });
      } catch (error) {
        console.error('Error loading goals from localStorage:', error);
      }
    }

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        dispatch({ type: 'UPDATE_PROFILE', payload: profile });
      } catch (error) {
        console.error('Error loading profile from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('marathon-runs', JSON.stringify(state.runs));
      localStorage.setItem('marathon-goals', JSON.stringify(state.goals));
      if (state.userProfile) {
        localStorage.setItem('marathon-profile', JSON.stringify(state.userProfile));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [state.runs, state.goals, state.userProfile]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};