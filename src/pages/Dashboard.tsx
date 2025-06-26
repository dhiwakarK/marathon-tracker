import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  DirectionsRun as RunIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { formatDate, formatNumber, calculateTotalDistance, getRunTypeColor } from '../utils';

const Dashboard: React.FC = () => {
  const { state } = useAppContext();
  const { runs, goals, userProfile } = state;

  // Calculate statistics
  const totalRuns = runs.length;
  const totalDistance = calculateTotalDistance(runs);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const thisYearRuns = runs.filter(run => run.date.getFullYear() === currentYear);
  const thisMonthRuns = runs.filter(run => 
    run.date.getFullYear() === currentYear && run.date.getMonth() === currentMonth
  );
  
  // Calculate date ranges for filtering
  // const thisWeekRuns = runs.filter(run => {
  //   const weekAgo = new Date();
  //   weekAgo.setDate(weekAgo.getDate() - 7);
  //   return run.date >= weekAgo;
  // });

  const yearlyDistance = calculateTotalDistance(thisYearRuns);
  const monthlyDistance = calculateTotalDistance(thisMonthRuns);
  // const weeklyDistance = calculateTotalDistance(thisWeekRuns); // Unused for now

  // Recent runs (last 5)
  const recentRuns = [...runs]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  // Active goals
  const activeGoals = goals.filter(goal => !goal.isCompleted);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, subtitle, icon, color = '#1976d2' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box sx={{ color, mr: 1 }}>{icon}</Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Runs"
            value={totalRuns}
            subtitle="All time"
            icon={<RunIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Distance"
            value={formatNumber(totalDistance)}
            subtitle={`${userProfile?.preferences.distanceUnit || 'miles'}`}
            icon={<TrendingUpIcon />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Year"
            value={formatNumber(yearlyDistance)}
            subtitle={`${thisYearRuns.length} runs`}
            icon={<TimerIcon />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month"
            value={formatNumber(monthlyDistance)}
            subtitle={`${thisMonthRuns.length} runs`}
            icon={<FlagIcon />}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Runs */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Recent Runs
              </Typography>
              {recentRuns.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No runs logged yet. Start by adding your first run!
                </Typography>
              ) : (
                <List>
                  {recentRuns.map((run) => (
                    <ListItem key={run.id} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {formatNumber(run.distance)} {userProfile?.preferences.distanceUnit || 'miles'}
                            </Typography>
                            <Chip
                              label={run.type}
                              size="small"
                              sx={{
                                backgroundColor: getRunTypeColor(run.type),
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(run.date)} • {run.duration} • {run.location}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Pace: {run.pace}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Goals */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Active Goals
              </Typography>
              {activeGoals.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active goals. Set a goal to track your progress!
                </Typography>
              ) : (
                <List>
                  {activeGoals.slice(0, 3).map((goal) => (
                    <ListItem key={goal.id} sx={{ px: 0 }}>
                      <Box width="100%">
                        <Typography variant="subtitle2" gutterBottom>
                          {goal.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={goal.progress}
                            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(goal.progress)}%
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Due: {formatDate(goal.deadline)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;