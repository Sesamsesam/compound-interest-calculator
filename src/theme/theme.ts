import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { Theme } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    interestRate: {
      base: string;
      seven: string;
      twenty: string;
      thirty: string;
    };
    gradients: {
      darkBackground: string;
      cardBase: string;
      cardSeven: string;
      cardTwenty: string;
      cardThirty: string;
    };
  }
  
  interface PaletteOptions {
    interestRate?: {
      base: string;
      seven: string;
      twenty: string;
      thirty: string;
    };
    gradients?: {
      darkBackground: string;
      cardBase: string;
      cardSeven: string;
      cardTwenty: string;
      cardThirty: string;
    };
  }
}

// Create base theme
const baseTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // blue-500
      light: '#60a5fa', // blue-400
      dark: '#2563eb', // blue-600
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#22c55e', // green-500
      light: '#4ade80', // green-400
      dark: '#16a34a', // green-600
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444', // red-500
    },
    warning: {
      main: '#eab308', // yellow-500
    },
    info: {
      main: '#3b82f6', // blue-500
    },
    success: {
      main: '#22c55e', // green-500
    },
    background: {
      default: '#0f172a', // slate-900
      paper: '#1e293b', // slate-800
    },
    text: {
      primary: '#f8fafc', // slate-50
      secondary: '#cbd5e1', // slate-300
      disabled: '#64748b', // slate-500
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    // Custom color schemes for interest rates
    interestRate: {
      base: '#f43f5e', // rose-500 for 0% base rate
      seven: '#eab308', // yellow-500 for 7% rate
      twenty: '#3b82f6', // blue-500 for 20% rate
      thirty: '#22c55e', // green-500 for 30% rate
    },
    // Custom gradients
    gradients: {
      darkBackground: 'linear-gradient(to bottom right, #0f172a, #1e293b)', // slate-900 to slate-800
      cardBase: 'linear-gradient(to bottom, #475569, #334155)', // slate-600 to slate-700
      cardSeven: 'linear-gradient(to bottom, #eab308, #ca8a04)', // yellow-500 to yellow-600
      cardTwenty: 'linear-gradient(to bottom, #3b82f6, #2563eb)', // blue-500 to blue-600
      cardThirty: 'linear-gradient(to bottom, #22c55e, #16a34a)', // green-500 to green-600
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ...Array(18).fill('none'),
  ] as Theme['shadows'],
});

// Component overrides
const theme = createTheme(baseTheme, {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: baseTheme.palette.gradients.darkBackground,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: baseTheme.shadows[4],
          },
        },
        contained: {
          boxShadow: baseTheme.shadows[2],
        },
        containedPrimary: {
          background: 'linear-gradient(to right, #3b82f6, #2563eb)',
          '&:hover': {
            background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(to right, #22c55e, #16a34a)',
          '&:hover': {
            background: 'linear-gradient(to right, #4ade80, #22c55e)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(8px)',
          boxShadow: baseTheme.shadows[3],
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: baseTheme.shadows[5],
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation4: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          boxShadow: baseTheme.shadows[3],
          padding: '8px 12px',
          fontSize: '0.75rem',
        },
      },
    },
  },
});

// Make typography responsive
const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;
