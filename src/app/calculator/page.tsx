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
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}

export default function Calculator() {
  const theme = useTheme();
  
  // Input state with default values
  const [principal, setPrincipal] = useState<number>(0);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(2000);
  const [annualRate, setAnnualRate] = useState<number>(7);
  const [years, setYears] = useState<number>(5);
  
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
    const value = parseFloat(event.target.value);
    setPrincipal(isNaN(value) ? 0 : value);
  };
  
  const handleMonthlyContributionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setMonthlyContribution(isNaN(value) ? 0 : value);
  };
  
  const handleAnnualRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setAnnualRate(isNaN(value) ? 0 : value);
  };
  
  const handleYearsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setYears(isNaN(value) ? 1 : value);
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
    // Calculate values for 7%, 20%, and 30% returns using the same principal and monthly contribution
    const sevenPercent = calculateYearlyData(principal, monthlyContribution, 7, years)[years].endBalance;
    const twentyPercent = calculateYearlyData(principal, monthlyContribution, 20, years)[years].endBalance;
    const thirtyPercent = calculateYearlyData(principal, monthlyContribution, 30, years)[years].endBalance;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Reference Values (same inputs with different rates)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: '120px' }}>
            <Paper 
              sx={{ 
                p: 1, 
                textAlign: 'center',
                border: '1px solid',
                borderColor: theme.palette.warning.main,
                bgcolor: 'rgba(234, 179, 8, 0.1)'
              }}
            >
              <Typography variant="caption" display="block">7% Return</Typography>
              <Typography variant="body2" fontWeight="bold">{formatDKK(sevenPercent)}</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: '120px' }}>
            <Paper 
              sx={{ 
                p: 1, 
                textAlign: 'center',
                border: '1px solid',
                borderColor: theme.palette.info.main,
                bgcolor: 'rgba(59, 130, 246, 0.1)'
              }}
            >
              <Typography variant="caption" display="block">20% Return</Typography>
              <Typography variant="body2" fontWeight="bold">{formatDKK(twentyPercent)}</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: '120px' }}>
            <Paper 
              sx={{ 
                p: 1, 
                textAlign: 'center',
                border: '1px solid',
                borderColor: theme.palette.success.main,
                bgcolor: 'rgba(34, 197, 94, 0.1)'
              }}
            >
              <Typography variant="caption" display="block">30% Return</Typography>
              <Typography variant="body2" fontWeight="bold">{formatDKK(thirtyPercent)}</Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        align="center" 
        gutterBottom
        sx={{ 
          mb: 4, 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #3b82f6, #22c55e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Renters Rente Beregner
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Left column - Inputs */}
        <Box sx={{ 
          width: '100%', 
          flexBasis: { xs: '100%', md: '33.333%', lg: '25%' },
          flexGrow: 0, 
          flexShrink: 0 
        }}>
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
                value={principal}
                onChange={handlePrincipalChange}
                error={errors.principal}
                helperText={errors.principal ? "Værdi skal være mellem 0 og 10.000.000" : ""}
                InputProps={{
                  startAdornment: <InputAdornment position="start">DKK</InputAdornment>,
                }}
                type="number"
                size="small"
                variant="outlined"
              />
              <Slider
                value={principal}
                onChange={handleSliderChange('principal')}
                min={0}
                max={1000000}
                step={10000}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => formatDKK(value)}
                sx={{ mt: 2 }}
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
                value={monthlyContribution}
                onChange={handleMonthlyContributionChange}
                error={errors.monthlyContribution}
                helperText={errors.monthlyContribution ? "Værdi skal være mellem 0 og 1.000.000" : ""}
                InputProps={{
                  startAdornment: <InputAdornment position="start">DKK</InputAdornment>,
                }}
                type="number"
                size="small"
                variant="outlined"
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
                value={annualRate}
                onChange={handleAnnualRateChange}
                error={errors.annualRate}
                helperText={errors.annualRate ? "Værdi skal være mellem 0 og 50" : ""}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                type="number"
                size="small"
                variant="outlined"
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
                value={years}
                onChange={handleYearsChange}
                error={errors.years}
                helperText={errors.years ? "Værdi skal være mellem 1 og 100" : ""}
                InputProps={{
                  endAdornment: <InputAdornment position="end">år</InputAdornment>,
                }}
                type="number"
                size="small"
                variant="outlined"
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
        
        {/* Right column - Results */}
        <Box sx={{ 
          width: '100%', 
          flexBasis: { xs: '100%', md: '62.667%', lg: '70%' },
          flexGrow: 1, 
          flexShrink: 1 
        }}>
          {/* Summary Cards */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3, 
            mb: 4 
          }}>
            <Box sx={{ 
              width: '100%', 
              flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
              flexGrow: 1 
            }}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: theme.palette.gradients.cardBase,
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Slutbalance
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatDKK(finalBalance)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Efter {years} år
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ 
              width: '100%', 
              flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
              flexGrow: 1 
            }}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(to bottom, #475569, #334155)',
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Investeret
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatDKK(totalContributed)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Startkapital + indbetalinger
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ 
              width: '100%', 
              flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
              flexGrow: 1 
            }}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(to bottom, #3b82f6, #2563eb)',
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} gutterBottom>
                    Renter Tjent
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {formatDKK(totalInterest)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Afkast på investering
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ 
              width: '100%', 
              flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
              flexGrow: 1 
            }}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(to bottom, #22c55e, #16a34a)',
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} gutterBottom>
                    Afkast %
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {interestPercentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Renter ift. investeret beløb
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
          
          {/* Chart Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4, 
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
            
            <Box sx={{ height: { xs: 300, md: 400 } }}>
              <CompoundInterestChart 
                yearlyData={yearlyData} 
                chartType={chartType} 
                annualRate={annualRate} 
              />
            </Box>
          </Paper>
          
          {/* Data Table */}
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
                    <TableCell>År</TableCell>
                    <TableCell align="right">Startbalance</TableCell>
                    <TableCell align="right">Bidrag</TableCell>
                    <TableCell align="right">Renter</TableCell>
                    <TableCell align="right">Slutbalance</TableCell>
                    <TableCell align="right">Total Investeret</TableCell>
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
                      <TableCell align="right">{formatDKK(row.endBalance)}</TableCell>
                      <TableCell align="right">{formatDKK(row.totalContributed)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
