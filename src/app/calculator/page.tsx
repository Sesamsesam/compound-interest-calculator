"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Slider, 
  InputAdornment,
  Box,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Button,
  useTheme,
  useMediaQuery
} from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import ShowChartIcon from "@mui/icons-material/ShowChart"
import BarChartIcon from "@mui/icons-material/BarChart"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import CompoundInterestChart from "@/components/CompoundInterestChart"
import { GlowingEffect } from "@/components/ui/glowing-effect"

// Calculation types
interface YearlyData {
  year: number
  startBalance: number
  contribution: number
  interest: number
  endBalance: number
  totalContributed: number
}

// Danish currency formatter
const formatDKK = (value: number): string => {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    // Always round to the nearest whole krone – no decimals
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Short Danish currency formatter (e.g., 5.2M kr, 25.9K kr)
const formatShortDKK = (value: number): string => {
  const abs = Math.abs(value);
  let formatted: string;

  if (abs >= 1_000_000_000) {
    formatted = `${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (abs >= 1_000_000) {
    formatted = `${(value / 1_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000) {
    formatted = `${(value / 1_000).toFixed(1)}K`;
  } else {
    // For values under 1 000, round to whole numbers (no decimals)
    formatted = value.toFixed(0);
  }

  return `${formatted} kr`;
};

// --- Helper to create dynamic reference gaps (same logic as chart) ---
const calculateDynamicGaps = (userRate: number) => {
  if (userRate >= 12) {
    return { gap1: 8, gap2: 4 };
  } else if (userRate >= 8) {
    return { gap1: 6, gap2: 3 };
  } else if (userRate >= 5) {
    return { gap1: 3, gap2: 1.5 };
  }
  // Very low rates
  return {
    gap1: Math.max(1, userRate * 0.4),
    gap2: Math.max(0.5, userRate * 0.2),
  };
};

export default function Calculator() {
  const theme = useTheme();
  
  // Input state with default values
  /* All inputs start at 0 but render as empty strings so the
     user can immediately type without back-spacing. */
  const [principal, setPrincipal] = useState<number>(0);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(0);
  const [annualRate, setAnnualRate] = useState<number>(0);
  // Default to 1 year and never allow below 1
  const [years, setYears] = useState<number>(1);
  
  // Chart display state
  const [chartType, setChartType] = useState<'line' | 'stacked'>('line');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(3);
  
  // Responsive detection
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Validation state
  const [errors, setErrors] = useState({
    principal: false,
    monthlyContribution: false,
    annualRate: false,
    years: false
  });

  // State for animation control
  const [allValuesFilled, setAllValuesFilled] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  
  // Ref for interaction timer
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate yearly data
  const calculateYearlyData = (
    principal: number, 
    monthlyContribution: number, 
    annualRate: number, 
    years: number
  ): YearlyData[] => {
    const yearlyData: YearlyData[] = [];
    const rate = annualRate / 100;
    // Use the contribution exactly as entered (already annual),
    // no automatic ×12 multiplication
    const annualContribution = monthlyContribution;
    
    let balance = principal;
    let totalContributed = principal;
    
    // Year 0 (initial state)
    yearlyData.push({
      year: 0,
      startBalance: 0,
      contribution: principal,
      interest: 0,
      endBalance: principal,
      totalContributed: principal
    });
    
    // Calculate for each year
    for (let year = 1; year <= years; year++) {
      const startBalance = balance;
      const contribution = annualContribution;
      totalContributed += contribution;
      
      // First add contribution, then calculate interest
      balance += contribution;
      const interestEarned = balance * rate;
      balance += interestEarned;
      
      yearlyData.push({
        year,
        startBalance,
        contribution,
        interest: interestEarned,
        endBalance: balance,
        totalContributed
      });
    }
    
    return yearlyData;
  };
  
  // Memoized calculation to prevent unnecessary recalculations
  const yearlyData = useMemo(() => {
    return calculateYearlyData(principal, monthlyContribution, annualRate, years);
  }, [principal, monthlyContribution, annualRate, years]);
  
  // Get final values
  const finalBalance = yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].endBalance : 0;
  const totalContributed = yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].totalContributed : 0;
  const totalInterest = finalBalance - totalContributed;
  const interestPercentage = totalContributed > 0 ? (totalInterest / totalContributed) * 100 : 0;
  
  // Calculate paginated data
  const paginatedData = useMemo(() => {
    if (!isMobile && !isTablet) {
      return yearlyData; // Show all data on desktop
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return yearlyData.slice(startIndex, startIndex + itemsPerPage);
  }, [yearlyData, currentPage, itemsPerPage, isMobile, isTablet]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(yearlyData.length / itemsPerPage);
  }, [yearlyData, itemsPerPage]);
  
  // Update items per page based on screen size
  useEffect(() => {
    if (isMobile) {
      setItemsPerPage(3); // Show 3 years on mobile
    } else if (isTablet) {
      setItemsPerPage(5); // Show 5 years on tablet
    } else {
      setItemsPerPage(yearlyData.length); // Show all on desktop
    }
    
    // Reset to first page when screen size changes
    setCurrentPage(1);
  }, [isMobile, isTablet, yearlyData.length]);
  
  // Input validation
  useEffect(() => {
    const newErrors = {
      principal: principal < 0 || principal > 10000000,
      monthlyContribution: monthlyContribution < 0 || monthlyContribution > 10000000,
      annualRate: annualRate < 0 || annualRate > 50,
      years: years < 1 || years > 100
    };
    setErrors(newErrors);
  }, [principal, monthlyContribution, annualRate, years]);

  // Check if all values are filled and store in localStorage
  useEffect(() => {
    // Check if all required values are filled
    // Exclude principal; require the three lower fields instead
    // years must be > 1 (default is 1). This ensures the user actually changed it.
    const allFilled = monthlyContribution > 0 && annualRate > 0 && years > 1;
    setAllValuesFilled(allFilled);
    
    // Store values in localStorage for homepage to access
    localStorage.setItem('calculator_principal', principal.toString());
    localStorage.setItem('calculator_monthlyContribution', monthlyContribution.toString());
    localStorage.setItem('calculator_annualRate', annualRate.toString());
    localStorage.setItem('calculator_years', years.toString());
    
    // Trigger storage event for homepage to detect
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    
    // Mark as interacting whenever values change
    if (allFilled) {
      setIsInteracting(true);
      
      // Reset the interaction timer
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
      
      // Set new timer
      interactionTimerRef.current = setTimeout(() => {
        setIsInteracting(false);
      }, 1000); // 1 second delay
    }
    
    // Cleanup timer on unmount
    return () => {
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
    };
  }, [principal, monthlyContribution, annualRate, years]);

  // Determine if we should pulse based on all values filled and not interacting
  useEffect(() => {
    if (allValuesFilled && !isInteracting) {
      setShouldPulse(true);
    } else {
      setShouldPulse(false);
    }
  }, [allValuesFilled, isInteracting]);
  
  // Handle input changes
  const handlePrincipalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const value = raw === "" ? 0 : parseFloat(raw);
    setPrincipal(isNaN(value) ? 0 : value);
  };
  
  const handleMonthlyContributionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const value = raw === "" ? 0 : parseFloat(raw);
    setMonthlyContribution(isNaN(value) ? 0 : value);
  };
  
  const handleAnnualRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const value = raw === "" ? 0 : parseFloat(raw);
    setAnnualRate(isNaN(value) ? 0 : value);
  };
  
  const handleYearsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const value = raw === "" ? 0 : parseInt(raw);
    setYears(isNaN(value) || value < 1 ? 1 : value);
  };
  
  const handleSliderChange = (name: string) => (event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    switch (name) {
      case 'principal':
        setPrincipal(value);
        break;
      case 'monthlyContribution':
        setMonthlyContribution(value);
        break;
      case 'annualRate':
        setAnnualRate(value);
        break;
      case 'years':
        setYears(value);
        break;
      default:
        break;
    }
  };
  
  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newChartType: 'line' | 'stacked' | null
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };
  
  // Pagination handlers
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  // Render reference values for comparison
  const renderReferenceValues = () => {
    // Dynamic benchmark rates match chart logic
    const { gap1, gap2 } = calculateDynamicGaps(annualRate);
    const refRate1 = Math.max(0.1, annualRate - gap1);  // yellow
    const refRate2 = Math.max(0.1, annualRate - gap2);  // blue
    const refRate3 = annualRate + 3;                    // purple - changed from +5 to +3

    const refRates = [refRate1, refRate2, refRate3];
    const refBalances = refRates.map(
      (rate) => calculateYearlyData(principal, monthlyContribution, rate, years)[years].endBalance
    );
    
    // Define colors for each reference value
    const borderColors = [
      theme.palette.warning.main, // Yellow/gold
      theme.palette.info.main,    // Blue
      '#9c27b0'                   // Purple
    ];
    
    const glowColors = [
      'rgba(255, 215, 0, 0.6)',   // Gold glow
      'rgba(33, 150, 243, 0.6)',  // Blue glow
      'rgba(156, 39, 176, 0.6)'   // Purple glow
    ];
    
    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Reference Værdier Slutbalance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {refBalances.map((balance, idx) => (
            <Box key={idx} sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: '120px' }}>
              <Paper 
                sx={{ 
                  p: 1.5, 
                  textAlign: 'center',
                  border: '2px solid',
                  borderColor: borderColors[idx],
                  bgcolor: 'rgba(30, 41, 59, 0.7)',
                  boxShadow: `0 0 10px ${glowColors[idx]}`,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 0 15px ${glowColors[idx]}`,
                    transform: 'translateY(-2px)'
                  },
                  '@keyframes pulseBorder': {
                    '0%': {
                      boxShadow: `0 0 5px ${glowColors[idx]}`
                    },
                    '50%': {
                      boxShadow: `0 0 15px ${glowColors[idx]}`
                    },
                    '100%': {
                      boxShadow: `0 0 5px ${glowColors[idx]}`
                    }
                  },
                  animation: 'pulseBorder 3s infinite'
                }}
              >
                <Typography variant="caption" display="block" sx={{ 
                  color: borderColors[idx],
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}>
                  {`${refRates[idx].toFixed(1)}%`}
                </Typography>
                <Typography variant="body1" fontWeight="bold" sx={{ 
                  fontSize: '1.1rem',
                  color: 'white'
                }}>
                  {formatShortDKK(balance)}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };
  
  return (
    <>
      {/* Wrapper div with pulse class that controls all animations */}
      <div className={shouldPulse ? "pulse-parent" : ""}>
        {/* Full-width black wrapper to eliminate side colors */}
        <Box sx={{ width: '100%', bgcolor: '#000000' }}>
          {/* Stretch Container to full viewport width */}
          <Container
            maxWidth={false}
            sx={{ py: 4, overflowX: 'hidden', bgcolor: '#000000' }}
          >
          <Typography 
            variant="h3" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              mb: 1, 
              fontWeight: 700,
              /* Sleek gold-silver metallic gradient */
              background: 'linear-gradient(135deg, #ffd700 0%, #ffb347 40%, #c0c0c0 70%, #ffd700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              /* subtle depth & glow */
              textShadow: `
                0 1px 2px rgba(0,0,0,0.6),
                0 0 8px rgba(255,215,0,0.6)
              `
            }}
          >
            
          </Typography>
          
          
          {/* Main responsive layout */}
          <Box
            sx={{
              display: 'grid',
              gap: 4,
              gridTemplateColumns: {
                xs: '1fr',        // single column (phones)
                sm: '1fr',        // single column (small tablets)
                md: '300px 1fr',  // sidebar + content (medium)
                lg: '350px 1fr',  // wider sidebar (large)
              },
              width: '100%',
              maxWidth: '100vw',
            }}
          >
            {/* Left column - Inputs */}
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ position: 'relative', borderRadius: 2 }}>
                <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Investeringsparametre
                  </Typography>
                  
                  {/* Principal */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Startkapital</Typography>
                      <Tooltip title="Dit oprindelige investeringsbeløb">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <TextField
                      fullWidth
                      value={principal === 0 ? "" : principal}
                      onChange={handlePrincipalChange}
                      error={errors.principal}
                      helperText={errors.principal ? "Værdi skal være mellem 0 og 10.000.000" : ""}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">DKK</InputAdornment>,
                      }}
                      type="text"
                      size="small"
                      variant="outlined"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      sx={{
                        '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                      }}
                    />
                  </Box>
                  
                  {/* Monthly Contribution */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Årligt Bidrag</Typography>
                      <Tooltip title="Beløb du investerer årligt">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <TextField
                      fullWidth
                      value={monthlyContribution === 0 ? "" : monthlyContribution}
                      onChange={handleMonthlyContributionChange}
                      error={errors.monthlyContribution}
                      helperText={errors.monthlyContribution ? "Værdi skal være mellem 0 og 10.000.000" : ""}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">DKK</InputAdornment>,
                      }}
                      type="text"
                      size="small"
                      variant="outlined"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      sx={{
                        '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                      }}
                    />
                  </Box>
                  
                  {/* Annual Rate */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Årlig Rente</Typography>
                      <Tooltip title="Forventet årlig afkast i procent">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <TextField
                      fullWidth
                      value={annualRate === 0 ? "" : annualRate}
                      onChange={handleAnnualRateChange}
                      error={errors.annualRate}
                      helperText={errors.annualRate ? "Værdi skal være mellem 0 og 50" : ""}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      type="text"
                      size="small"
                      variant="outlined"
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
                      sx={{
                        '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                      }}
                    />
                    <Slider
                      value={annualRate}
                      onChange={handleSliderChange('annualRate')}
                      min={0}
                      max={30}
                      step={0.5}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                      sx={{ mt: 2 }}
                      marks={[
                        { value: 7, label: '7%' },
                        { value: 20, label: '20%' },
                        { value: 30, label: '30%' },
                      ]}
                    />
                  </Box>
                  
                  {/* Years */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Investeringsperiode</Typography>
                      <Tooltip title="Antal år du planlægger at investere">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <TextField
                      fullWidth
                      value={years === 0 ? "" : years}
                      onChange={handleYearsChange}
                      error={errors.years}
                      helperText={errors.years ? "Værdi skal være mellem 1 og 100" : ""}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">år</InputAdornment>,
                      }}
                      type="text"
                      size="small"
                      variant="outlined"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      sx={{
                        '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                      }}
                    />
                    <Slider
                      value={years}
                      onChange={handleSliderChange('years')}
                      min={1}
                      max={50}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value} år`}
                      sx={{ mt: 2 }}
                      marks={[
                        { value: 5, label: '5' },
                        { value: 20, label: '20' },
                        { value: 40, label: '40' },
                      ]}
                    />
                  </Box>
                  
                  {/* Reference values */}
                  {renderReferenceValues()}
                </Paper>
              </Box>
            </Box>
            
            {/* Right column - Results */}
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3, 
                mb: 4 
              }}>
                {/* --- Total Investeret ------------------------------------------------ */}
                <Box sx={{ 
                  width: '100%', 
                  /* Only blue card remains – make it full-width & slimmer */
                  flexBasis: '100%',
                  flexGrow: 1,
                  position: 'relative',
                  borderRadius: 2
                }}>
                  <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
                  <Card
                    sx={{
                      height: '100%',
                      /* Match “Investeringsparametre” styling */
                      background: 'rgba(15, 23, 42, 0.8)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      boxShadow: theme.shadows[3],   /* keep subtle shadow */
                      /* Explicitly remove any hover-lift / shadow grow */
                      '&:hover': {
                        transform: 'none',
                        boxShadow: theme.shadows[3],
                      },
                    }}
                  >
                    {/* Center content vertically & horizontally */}
                    <CardContent
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        /* Keep current top padding but reduce bottom padding for visual centering */
                        pt: { xs: 1.5, sm: 2 },
                        pb: { xs: 1,   sm: 1.5 },
                        px: { xs: 1.5, sm: 2 },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'white',
                          fontWeight: 500,
                          lineHeight: 1.5,
                          textAlign: 'center',
                          marginTop: 1
                        }}
                      >
                        Total Investeret&nbsp;|&nbsp;Startkapital&nbsp;+&nbsp;Indbetalinger:&nbsp;
                        <Box 
                          component="span" 
                          sx={{ 
                            fontWeight: 700,
                            color: theme.palette.primary.main  /* slider blue */
                          }}
                        >
                          {formatDKK(totalContributed)}
                        </Box>
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* Green Slutbalance card removed – content moved to chart */}
              </Box>
              
              {/* Chart Section */}
              <Box sx={{ position: 'relative', borderRadius: 2, mb: 4 }}>
                <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Investeringsvækst over Tid
                    </Typography>
                    
                    <ToggleButtonGroup
                      value={chartType}
                      exclusive
                      onChange={handleChartTypeChange}
                      size="small"
                    >
                      <ToggleButton value="line" aria-label="line chart">
                        <Tooltip title="Linjediagram">
                          <ShowChartIcon 
                            fontSize="small" 
                          />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="stacked" aria-label="stacked bar chart">
                        <Tooltip title="Søjlediagram">
                          <BarChartIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  
                  {/* Chart wrapper – extra bottom padding & taller mobile height to avoid overflow */}
                  <Box
                    sx={{
                      /* Increased mobile height so x-axis labels aren't cut off */
                      /* Responsive height & padding: more on narrow screens */
                      height: { xs: 540, sm: 480, md: 420 },
                      pb: { xs: 9,  sm: 7,  md: 4 }, /* prevent cutoff on xs/sm, compact on md+ */
                      overflow: 'hidden',             /* ensure no horizontal bleed */
                    }}
                  >
                    {/* ----- Two-column KPI layout with perfect vertical alignment ----- */}
                    <Box 
                      sx={{ 
                        mb: 2,
                        /* Horizontal padding so the glow from text-shadow isn't clipped */
                        px: { xs: 3, sm: 3, md: 4 },
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        columnGap: { xs: '2rem', sm: '5rem' },
                        rowGap: 1,
                        alignItems: 'baseline' /* Align items by text baseline */
                      }}
                    >
                      {/* Left column – Total procent */}
                      <Box 
                        sx={{ 
                          flex: '0 1 auto', 
                          minWidth: 160,
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%' /* Ensure both columns have same height */
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 600, 
                            color: theme.palette.text.secondary,
                            fontSize: { xs: '0.85rem', sm: '0.9rem' },
                            mb: 1 /* Consistent margin for both columns */
                          }}
                        >
                          Total Procent Optjent: {interestPercentage.toFixed(1)}%
                        </Typography>
                        <Typography
                          variant="h5"
                          className="pulse-target-interest"
                          sx={{ 
                            fontWeight: 'bold', 
                            color: theme.palette.success.main,
                            display: 'inline-block',
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            lineHeight: 1.2 /* Consistent line height */
                          }}
                        >
                          {formatDKK(totalInterest)}
                        </Typography>
                      </Box>

                      {/* Right column – Slutbalance */}
                      <Box 
                        sx={{ 
                          flex: '0 1 auto', 
                          minWidth: 160, 
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%' /* Ensure both columns have same height */
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 600, 
                            color: theme.palette.text.secondary,
                            fontSize: { xs: '0.85rem', sm: '0.9rem' },
                            mb: 1 /* Consistent margin for both columns */
                          }}
                        >
                          Slutbalance efter {years} år
                        </Typography>
                        <Typography
                          variant="h5"
                          className="pulse-target-interest"
                          sx={{ 
                            fontWeight: 'bold', 
                            color: theme.palette.success.main,
                            display: 'inline-block',
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            lineHeight: 1.2 /* Consistent line height */
                          }}
                        >
                          {formatDKK(finalBalance)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CompoundInterestChart 
                      yearlyData={yearlyData} 
                      chartType={chartType} 
                      annualRate={annualRate}
                      totalInterest={totalInterest}
                      shouldPulse={shouldPulse}
                    />
                  </Box>
                </Paper>
              </Box>
              
              {/* Data Table */}
              <Box sx={{ position: 'relative', borderRadius: 2 }}>
                <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
                <Paper 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 2,
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ p: 3, pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Årlig Oversigt
                    </Typography>
                  </Box>
                  
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                      <TableRow>
                        <TableCell sx={{ backgroundColor: '#000B24', color: 'white' }}>År</TableCell>
                        <TableCell align="right" sx={{ backgroundColor: '#000B24', color: 'white' }}>Startbalance</TableCell>
                        <TableCell align="right" sx={{ backgroundColor: '#000B24', color: 'white' }}>Bidrag</TableCell>
                        <TableCell align="right" sx={{ backgroundColor: '#000B24', color: 'white' }}>Renter</TableCell>
                        <TableCell align="right" sx={{ backgroundColor: '#000B24', color: 'white' }}>Total Investeret</TableCell>
                        <TableCell align="right" sx={{ backgroundColor: '#000B24', color: 'white' }}>Slutbalance</TableCell>
                      </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((row) => (
                          <TableRow key={row.year} hover>
                            <TableCell component="th" scope="row">
                              {row.year}
                            </TableCell>
                            <TableCell align="right">{formatDKK(row.startBalance)}</TableCell>
                            <TableCell align="right">{formatDKK(row.contribution)}</TableCell>
                            <TableCell align="right">{formatDKK(row.interest)}</TableCell>
                            <TableCell align="right">{formatDKK(row.totalContributed)}</TableCell>
                            <TableCell align="right">{formatDKK(row.endBalance)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Pagination controls - only show on mobile/tablet */}
                  {(isMobile || isTablet) && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      p: 2, 
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
                    }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handlePrevPage} 
                        disabled={currentPage <= 1}
                        startIcon={<NavigateBeforeIcon />}
                        sx={{ minWidth: '100px' }}
                      >
                        Forrige
                      </Button>
                      
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, yearlyData.length)} af ${yearlyData.length} år`}
                      </Typography>
                      
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handleNextPage} 
                        disabled={currentPage >= totalPages}
                        endIcon={<NavigateNextIcon />}
                        sx={{ minWidth: '100px' }}
                      >
                        Næste
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          </Box>
        </Container>
        </Box>
      </div>

      {/* CSS for synchronized gold pulse animation */}
      <style jsx global>{`
        @keyframes goldPulse {
          0% {
            /* keep base green */
            color: #10b981;
            text-shadow: 0 0 4px rgba(16, 185, 129, 0.6);
          }
          50% {
            color: #ffd700;
            text-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5);
          }
          100% {
            color: #10b981;
            text-shadow: 0 0 4px rgba(16, 185, 129, 0.6);
          }
        }
        
        /* Parent-controlled animations for perfect synchronization */
        .pulse-parent .pulse-target-interest,
        .pulse-parent .pulse-target-balance-green {
          animation: goldPulse 2s infinite;
        }

        /* White base pulse for Slutbalance number - kept for backwards compatibility */
        @keyframes whitePulse {
          0% {
            color: #ffffff;
            text-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
          }
          50% {
            color: #ffd700;
            text-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5);
          }
          100% {
            color: #ffffff;
            text-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
          }
        }

        .pulse-parent .pulse-target-balance-white {
          animation: whitePulse 2s infinite;
        }
        
        @keyframes legendPulse {
          0% {
            color: #10b981;
          }
          50% {
            color: #ffd700;
            filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.8));
          }
          100% {
            color: #10b981;
          }
        }
        
        /* Synchronized legend pulse */
        .pulse-parent .pulse-target-legend {
          animation: legendPulse 2s infinite;
        }
        
        /* Legacy classes for backwards compatibility */
        .gold-pulse-animation {
          animation: goldPulse 2s infinite;
        }
        
        .legend-pulse-animation {
          animation: legendPulse 2s infinite;
        }
      `}</style>
    </>
  );
}
