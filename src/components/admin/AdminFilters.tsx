import React from 'react';
import { Box, TextField, MenuItem, Grid } from '@mui/material';

interface FilterProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  filterOptions: Array<{
    key: string;
    label: string;
    type: 'text' | 'select' | 'date';
    options?: Array<{ value: string; label: string }>;
  }>;
}

export default function AdminFilters({ filters, onFilterChange, filterOptions }: FilterProps) {
  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: '#fff7f0', borderRadius: 2 }}>
      <Grid container spacing={2}>
        {filterOptions.map((option) => {
          const isYesNoFilter = option.key === 'admin' || option.key === 'selected';
          return (
          <Grid item xs={12} sm={isYesNoFilter ? 4 : 6} md={isYesNoFilter ? 2.5 : 3} key={option.key}>
            {option.type === 'select' ? (
              <TextField
                select
                fullWidth
                size="small"
                label={option.label}
                value={filters[option.key] || ''}
                onChange={(e) => onFilterChange(option.key, e.target.value)}
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
                type={option.type}
                label={option.label}
                value={filters[option.key] || ''}
                onChange={(e) => onFilterChange(option.key, e.target.value)}
                InputLabelProps={option.type === 'date' ? { shrink: true } : undefined}
              />
            )}
          </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}