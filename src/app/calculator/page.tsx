"use client"

import { useState, useEffect, useMemo } from "react"
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
  useTheme
} from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import ShowChartIcon from "@mui/icons-material/ShowChart"
import BarChartIcon from "@mui/icons-material/BarChart"
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
  
  // Validation state
  const [errors, setErrors] = useState({
    principal: false,
    monthlyContribution: false,
    annualRate: false,
    years: false
  });
  
  // Calculate yearly data
  const calculateYearlyData = (
    principal: number, 
    monthlyContribution: number, 
    annualRate: number, 
    years: number
  ): YearlyData[] => {
    const yearlyData: YearlyData[] = [];
    const rate = annualRate / 100;
    const annualContribution = monthlyContribution * 12;
    
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
  
  // Input validation
  useEffect(() => {
    const newErrors = {
      principal: principal < 0 || principal > 10000000,
      monthlyContribution: monthlyContribution < 0 || monthlyContribution > 1000000,
      annualRate: annualRate < 0 || annualRate > 50,
      years: years < 1 || years > 100
    };
    setErrors(newErrors);
  }, [principal, monthlyContribution, annualRate, years]);
  
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
    <Container maxWidth="lg" sx={{ py: 4, overflowX: 'hidden', bgcolor: '#000000'}}>
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
                  <Typography variant="body2">Månedligt Bidrag</Typography>
                  <Tooltip title="Beløb du investerer hver måned">
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
                  helperText={errors.monthlyContribution ? "Værdi skal være mellem 0 og 1.000.000" : ""}
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
                <Slider
                  value={monthlyContribution}
                  onChange={handleSliderChange('monthlyContribution')}
                  min={0}
                  max={50000}
                  step={500}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => formatDKK(value)}
                  sx={{ mt: 2 }}
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
          {/* Summary Cards - Updated to 3 cards with 33.333% width */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3, 
            mb: 4 
          }}>
            {/* --- Total Investeret ------------------------------------------------ */}
            <Box sx={{ 
              width: '100%', 
              flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 12px)' },
              flexGrow: 1,
              position: 'relative',
              borderRadius: 2
            }}>
              <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
              <Card 
                sx={{ 
                  height: '100%',
                  /* Cool blue gradient */
                  background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(0px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} gutterBottom>
                    Total Investeret
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {formatDKK(totalContributed)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Startkapital + indbetalinger
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* --- Slutbalance ------------------------------------------------------ */}
            <Box sx={{ 
              width: '100%', 
              flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(50% - 12px)' },
              flexGrow: 1,
              position: 'relative',
              borderRadius: 2
            }}>
              <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
              <Card 
                sx={{ 
                  height: '100%',
                  /* Success green gradient */
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(0px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} gutterBottom>
                    Slutbalance
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {formatDKK(finalBalance)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Efter {years} år
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Third summary card removed */}
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
                      <ShowChartIcon fontSize="small" />
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
                  height: { xs: 350, md: 420 },
                  pb: { xs: 4, md: 5 },           /* increased space below grid/axes */
                  overflow: 'hidden',             /* ensure no horizontal bleed */
                }}
              >
                <CompoundInterestChart 
                  yearlyData={yearlyData} 
                  chartType={chartType} 
                  annualRate={annualRate}
                  totalInterest={totalInterest} 
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
                    {yearlyData.map((row) => (
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
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
