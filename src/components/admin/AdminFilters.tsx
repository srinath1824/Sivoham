import { Box, TextField, MenuItem, Grid } from '@mui/material';

interface FilterProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  filterOptions: Array<{
    key: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'datetime';
    options?: Array<{ value: string; label: string }>;
  }>;
}

export default function AdminFilters({ filters, onFilterChange, filterOptions }: FilterProps) {
  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: '#fff7f0', borderRadius: 2 }}>
      <Grid container spacing={2}>
        {filterOptions.map((option) => (
          <Grid item xs={12} sm={6} md={3} key={option.key}>
            {option.type === 'select' ? (
              <TextField
                select
                fullWidth
                size="small"
                label={option.label}
                value={filters[option.key] || ''}
                onChange={(e) => onFilterChange(option.key, e.target.value)}
                sx={{ minWidth: '200px' }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        '& .MuiMenuItem-root': {
                          fontSize: '0.9rem',
                          minHeight: '40px'
                        }
                      }
                    }
                  }
                }}
              >
                <MenuItem value="">All</MenuItem>
                {option.options?.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                size="small"
                type={option.type === 'datetime' ? 'datetime-local' : option.type}
                label={option.label}
                value={filters[option.key] || ''}
                onChange={(e) => onFilterChange(option.key, e.target.value)}
                sx={{ minWidth: '200px' }}
                InputLabelProps={option.type === 'date' || option.type === 'datetime' ? { shrink: true } : {}}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

