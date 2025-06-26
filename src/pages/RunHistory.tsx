import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { MarathonRun } from '../types';
import { formatDate, getRunTypeColor, formatNumber } from '../utils';

const RunHistory: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRun, setSelectedRun] = useState<MarathonRun | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter and search runs
  const filteredRuns = useMemo(() => {
    let filtered = [...state.runs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(run =>
        run.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(run => run.type === typeFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    return filtered;
  }, [state.runs, searchTerm, typeFilter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewRun = (run: MarathonRun) => {
    setSelectedRun(run);
    setViewDialogOpen(true);
  };

  const handleDeleteRun = (run: MarathonRun) => {
    setSelectedRun(run);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRun) {
      dispatch({ type: 'DELETE_RUN', payload: selectedRun.id });
      setDeleteDialogOpen(false);
      setSelectedRun(null);
    }
  };

  const runTypes = ['all', 'training', 'race', 'long-run', 'tempo', 'interval', 'recovery'];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Run History
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search runs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by location or notes..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Run Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Run Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {runTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredRuns.length} run{filteredRuns.length !== 1 ? 's' : ''}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Runs Table */}
      <Card>
        <CardContent>
          {filteredRuns.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              {state.runs.length === 0 
                ? 'No runs logged yet. Start by adding your first run!'
                : 'No runs match your search criteria.'
              }
            </Typography>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Distance</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Pace</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRuns
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((run) => (
                        <TableRow key={run.id} hover>
                          <TableCell>{formatDate(run.date)}</TableCell>
                          <TableCell>
                            {formatNumber(run.distance)} {state.userProfile?.preferences.distanceUnit || 'miles'}
                          </TableCell>
                          <TableCell>{run.duration}</TableCell>
                          <TableCell>{run.pace}</TableCell>
                          <TableCell>
                            <Chip
                              label={run.type}
                              size="small"
                              sx={{
                                backgroundColor: getRunTypeColor(run.type),
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>{run.location}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleViewRun(run)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRun(run)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredRuns.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* View Run Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Run Details - {selectedRun && formatDate(selectedRun.date)}
        </DialogTitle>
        <DialogContent>
          {selectedRun && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Distance:</strong> {formatNumber(selectedRun.distance)} {state.userProfile?.preferences.distanceUnit || 'miles'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Duration:</strong> {selectedRun.duration}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Pace:</strong> {selectedRun.pace}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Type:</strong> {selectedRun.type}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Location:</strong> {selectedRun.location}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Difficulty:</strong> {selectedRun.difficulty}/5</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Temperature:</strong> {selectedRun.weather.temperature}°{state.userProfile?.preferences.temperatureUnit === 'celsius' ? 'C' : 'F'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Weather:</strong> {selectedRun.weather.conditions}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Elevation:</strong> {selectedRun.elevation} ft</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Calories:</strong> {selectedRun.calories}</Typography>
              </Grid>
              {selectedRun.heartRate.avg > 0 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Avg HR:</strong> {selectedRun.heartRate.avg} bpm</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Max HR:</strong> {selectedRun.heartRate.max} bpm</Typography>
                  </Grid>
                </>
              )}
              {selectedRun.notes && (
                <Grid item xs={12}>
                  <Typography><strong>Notes:</strong></Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    {selectedRun.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Run</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this run? This action cannot be undone.
          </Typography>
          {selectedRun && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>{formatDate(selectedRun.date)}</strong> - {formatNumber(selectedRun.distance)} {state.userProfile?.preferences.distanceUnit || 'miles'} in {selectedRun.duration}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RunHistory;