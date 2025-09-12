"use client"

import { useRef, useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  TooltipItem
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import annotationPlugin from 'chartjs-plugin-annotation'
import { useTheme } from '@mui/material'
import { Box } from '@mui/material'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
)

// Danish currency formatter
const formatDKK = (value: number): string => {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Interface for yearly data from calculator
interface YearlyData {
  year: number
  startBalance: number
  contribution: number
  interest: number
  endBalance: number
  totalContributed: number
}

interface CompoundInterestChartProps {
  yearlyData: YearlyData[]
  chartType: 'line' | 'stacked'
  annualRate: number
  totalInterest: number
  shouldPulse?: boolean // Added shouldPulse prop
}

// Helper function to calculate data with different rates
const calculateWithRate = (principal: number, monthlyContribution: number, rate: number, years: number): number[] => {
  const result: number[] = [principal];
  let balance = principal;
  
  for (let year = 1; year <= years; year++) {
    // Add annual contribution
    balance += monthlyContribution * 12;
    // Add interest
    balance *= (1 + rate / 100);
    result.push(balance);
  }
  
  return result;
};

// Calculate dynamic gaps based on user rate
const calculateDynamicGaps = (userRate: number) => {
  if (userRate >= 12) {
    // High rates: Use full 8% and 4% gaps
    return { gap1: 8, gap2: 4 };
  } else if (userRate >= 8) {
    // Medium rates: Scale gaps proportionally
    return { gap1: 6, gap2: 3 };
  } else if (userRate >= 5) {
    // Lower rates: Smaller gaps
    return { gap1: 3, gap2: 1.5 };
  } else {
    // Very low rates: Minimal gaps, ensure no negatives
    return { 
      gap1: Math.max(1, userRate * 0.4), 
      gap2: Math.max(0.5, userRate * 0.2) 
    };
  }
};

// Calculate cumulative return percentage
const calculateCumulativeReturn = (endBalance: number, totalContributed: number): number => {
  if (totalContributed <= 0) return 0;
  return ((endBalance - totalContributed) / totalContributed) * 100;
};

const CompoundInterestChart = ({
  yearlyData,
  chartType,
  annualRate,
  totalInterest,
  shouldPulse = false, // Default to false
}: CompoundInterestChartProps) => {
  const chartRef = useRef<ChartJS>(null)
  const theme = useTheme()
  
  // State for pulsing line color
  const [lineColor, setLineColor] = useState(theme.palette.success.main)
  const [pointColor, setPointColor] = useState(theme.palette.success.main)

  // Extract years for labels
  const years = yearlyData.map(data => data.year)
  
  // Extract end balances for line chart
  const endBalances = yearlyData.map(data => data.endBalance)
  
  // Extract data for stacked chart
  const contributions = yearlyData.map(data => data.contribution)
  const interests = yearlyData.map(data => data.interest)
  const cumulativeContributions = yearlyData.map(data => data.totalContributed)
  
  // Calculate cumulative interest for each year
  const cumulativeInterests = yearlyData.map((data, index) => {
    return data.endBalance - data.totalContributed;
  });
  
  // Calculate annual interest only (not cumulative)
  const annualInterests = yearlyData.map((data) => data.interest);
  
  // Calculate reference data for dynamic benchmark rates
  const principal = yearlyData[0].endBalance;
  const monthlyContribution = yearlyData.length > 1 ? yearlyData[1].contribution / 12 : 0;
  const totalYears = yearlyData.length - 1;
  
  // Calculate dynamic gaps based on user rate
  const { gap1, gap2 } = calculateDynamicGaps(annualRate);
  
  // Dynamic benchmark rates
  const refRate1 = Math.max(0.1, annualRate - gap1); // Yellow (ensure minimum 0.1%)
  const refRate2 = Math.max(0.1, annualRate - gap2); // Blue (ensure minimum 0.1%)
  const refRate3 = annualRate + 3; // Purple (always user rate + 3%)
  
  const refData1 = calculateWithRate(principal, monthlyContribution, refRate1, totalYears);
  const refData2 = calculateWithRate(principal, monthlyContribution, refRate2, totalYears);
  const refData3 = calculateWithRate(principal, monthlyContribution, refRate3, totalYears);

  // Calculate final cumulative return percentage
  const finalReturnPercentage = calculateCumulativeReturn(
    yearlyData[yearlyData.length - 1]?.endBalance || 0,
    yearlyData[yearlyData.length - 1]?.totalContributed || 0
  );

  // Gold color for pulsing
  const goldColor = '#ffd700';
  
  // Effect for pulsing line color animation
  useEffect(() => {
    if (!shouldPulse || chartType !== 'line') return;

    // Helper that sets both line & point colours and triggers chart update.
    const applyColor = (clr: string, silent = false) => {
      setLineColor(clr);
      setPointColor(clr);

      const chart = chartRef.current;
      if (chart && chart.data.datasets[0]) {
        chart.data.datasets[0].borderColor = clr;
        chart.data.datasets[0].pointBackgroundColor = clr;
        chart.update(silent ? 'none' : undefined);
      }
    };

    const timeouts: NodeJS.Timeout[] = [];

    // One cycle = quick double-wink (0-300 ms) + 3 s pause ≈ 3.3 s
    const cycle = () => {
      // Wink 1
      applyColor(goldColor, true);                       // t = 0 ms
      timeouts.push(setTimeout(() => applyColor(theme.palette.success.main, true), 100));  // t = 100 ms
      // Wink 2
      timeouts.push(setTimeout(() => applyColor(goldColor, true), 200));                   // t = 180 ms
      timeouts.push(setTimeout(() => applyColor(theme.palette.success.main, true), 300));  // t = 300 ms
      // Rest of cycle is green (pause)
    };

    // Kick off initial cycle immediately
    cycle();
    // Repeat every 3.3 s  (0.3 s blink + 3 s pause)
    const intervalId = setInterval(cycle, 5000);

    return () => {
      clearInterval(intervalId);
      timeouts.forEach(t => clearTimeout(t));
      // Reset to green when unmounting or when shouldPulse becomes false
      setLineColor(theme.palette.success.main);
      setPointColor(theme.palette.success.main);
      
      const chart = chartRef.current;
      if (chart && chart.data.datasets[0]) {
        chart.data.datasets[0].borderColor = theme.palette.success.main;
        chart.data.datasets[0].pointBackgroundColor = theme.palette.success.main;
        chart.update();
      }
    };
  }, [shouldPulse, chartType, theme.palette.success.main]);

  // Line chart data
  const lineChartData: ChartData<'line'> = {
    labels: years,
    datasets: [
      {
        label: `Din (${annualRate.toFixed(1)}%)`,
        data: endBalances,
        // Use dynamic color from state (will pulse if shouldPulse is true)
        borderColor: lineColor,
        backgroundColor: `${lineColor}33`, // 20% opacity
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: pointColor,
        borderWidth: 2,
      },
      {
        label: 'Indbetalinger',
        data: cumulativeContributions,
        borderColor: theme.palette.grey[500],
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.1,
        // Add dots for all points
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      // Reference lines - only shown in line chart
      ...(chartType === 'line' ? [
        {
          label: `${refRate3.toFixed(1)}%`,
          data: refData3,
          // Switched to purple
          borderColor: '#9c27b0',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 1.5,
          borderDash: [3, 3],
        },
        /* Blue comes *before* Yellow */
        {
          label: `${refRate2.toFixed(1)}%`,
          data: refData2,
          borderColor: theme.palette.info.main, // Blue
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 1.5,
          borderDash: [3, 3],
        },
        {
          label: `${refRate1.toFixed(1)}%`,
          data: refData1,
          borderColor: theme.palette.warning.main, // Yellow
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 1.5,
          borderDash: [3, 3],
        }
      ] : [])
    ],
  }

  // Stacked bar chart data - updated with three segments
  const stackedChartData: ChartData<'bar'> = {
    labels: years,
    datasets: [
      {
        label: 'Akkumulerede Indbetalinger',
        data: cumulativeContributions,
        backgroundColor: 'linear-gradient(135deg, #3b82f6, #1e40af)', // Blue gradient
        hoverBackgroundColor: '#60a5fa', // Lighter blue on hover
        stack: 'stack0',
        barPercentage: 0.7,
        borderRadius: {
          bottomLeft: 6,
          bottomRight: 6,
          topLeft: 0,
          topRight: 0,
        },
        // Use gradient for blue
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return '#3b82f6';
          
          const gradient = ctx.createLinearGradient(
            chartArea.left, 0, chartArea.right, 0
          );
          gradient.addColorStop(0, '#3b82f6');
          gradient.addColorStop(1, '#1e40af');
          return gradient;
        },
      },
      {
        label: 'Årlig Rente',
        data: annualInterests,
        backgroundColor: '#10b981', // Green
        hoverBackgroundColor: '#34d399', // Lighter green on hover
        stack: 'stack0',
        barPercentage: 0.7,
        borderRadius: 0, // No radius for middle segment
      },
      {
        label: 'Akkumuleret Rente',
        data: cumulativeInterests,
        backgroundColor: '#f59e0b', // Gold/yellow
        hoverBackgroundColor: '#fbbf24', // Lighter gold on hover
        stack: 'stack0',
        barPercentage: 0.7,
        borderRadius: {
          bottomLeft: 0,
          bottomRight: 0,
          topLeft: 6,
          topRight: 6,
        },
      }
    ],
  }

  // Shared chart options
  const commonOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
            weight: 'bold',
            size: 11, // 25 % smaller legend text
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: {
          family: theme.typography.fontFamily,
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: theme.typography.fontFamily,
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            // Get the year number
            const year = parseInt(context[0].label);
            
            // Determine which rate to show based on dataset
            let rate = annualRate;
            const datasetLabel = context[0].dataset.label || '';
            
            if (datasetLabel === `${refRate1.toFixed(1)}%`) {
              rate = refRate1;
            } else if (datasetLabel === `${refRate2.toFixed(1)}%`) {
              rate = refRate2;
            } else if (datasetLabel === `${refRate3.toFixed(1)}%`) {
              rate = refRate3;
            }
            
            // Return formatted title: "år X | Y%"
            return `år ${year} | ${rate.toFixed(1)}%`;
          },
          label: function(context: TooltipItem<'line' | 'bar'>) {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            const year = parseInt(context.label);
            
            // For line chart, show consistent format for all lines
            if (chartType === 'line') {
              // Get total invested up to this year
              const totalInvested = year < yearlyData.length ? yearlyData[year].totalContributed : 0;
              
              // Calculate interest earned (value - total invested)
              const interestEarned = Math.round(value - totalInvested);
              
              // Calculate cumulative return percentage for this year
              const cumulativeReturn = calculateCumulativeReturn(value, totalInvested);
              
              // Return formatted tooltip content
              return [
                `Total Investeret: ${formatDKK(totalInvested)}`,
                `Total Værdi: ${formatDKK(value)}`,
                `Renter Optjent: ${formatDKK(interestEarned)}`,
                `Optjent Procent: ${cumulativeReturn.toFixed(1)}%`
              ];
            } else {
              // Enhanced bar chart tooltips
              const yearData = yearlyData[year];
              if (!yearData) return `${label}: ${formatDKK(value)}`;
              
              if (label === 'Akkumulerede Indbetalinger') {
                return [
                  `${label}: ${formatDKK(value)}`,
                  `Indskud dette år: ${formatDKK(yearData.contribution)}`
                ];
              } else if (label === 'Årlig Rente') {
                return [
                  `${label}: ${formatDKK(value)}`,
                  `Afkast dette år: ${annualRate.toFixed(1)}%`
                ];
              } else if (label === 'Akkumuleret Rente') {
                const totalValue = yearData.endBalance;
                return [
                  `${label}: ${formatDKK(value)}`,
                  `Total Værdi: ${formatDKK(totalValue)}`,
                  `Optjent Procent: ${calculateCumulativeReturn(totalValue, yearData.totalContributed).toFixed(1)}%`
                ];
              }
              return `${label}: ${formatDKK(value)}`;
            }
          }
        }
      },
      // Remove always-visible annotation; line tooltip appears on hover instead
    },
    // Extra padding so first/last rotated labels are fully visible
    layout: {
      padding: {
        left: 0,
        right: 20,
        top: 0,
        bottom: 50, // increased bottom padding so rotated labels aren't clipped
      },
    },
    scales: {
      x: {
        title: {
          display: false, // Removed centered x-axis title
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            weight: 'bold',
            size: 14,
          },
          padding: { top: 10 },
        },
        grid: {
          color: `${theme.palette.divider}66`, // 40% opacity
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
          },
          callback: function(value, index) {
            // First tick: 'år 0', last tick: 'år N', middle ticks: plain numbers
            if (index === 0) return 'år 0';
            if (index === years.length - 1) return `år ${index}`;
            return `${index}`;
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Beløb (DKK)',
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            weight: 'bold',
            size: 14,
          },
          padding: { bottom: 10 },
        },
        grid: {
          color: `${theme.palette.divider}66`, // 40% opacity
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
          },
          callback: function(value) {
            return formatDKK(value as number);
          }
        },
        beginAtZero: true,
      },
    },
  };

  // Line chart specific options
  const lineOptions: ChartOptions<'line'> = {
    ...commonOptions,
    elements: {
      line: {
        tension: 0.3,
      },
      point: {
        radius: 3,
        hoverRadius: 6,
      },
    },
  };

  // Bar chart specific options
  const barOptions: ChartOptions<'bar'> = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      x: {
        ...commonOptions.scales?.x,
        stacked: true,
      },
      y: {
        ...commonOptions.scales?.y,
        stacked: true,
      },
    },
    elements: {
      bar: {
        borderWidth: 0,
      }
    }
  };

  // Effect to update chart when data changes
  useEffect(() => {
    const chart = chartRef.current;
    
    if (chart) {
      chart.update();
    }
  }, [yearlyData, chartType, annualRate, shouldPulse]);

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: '400px' }}>
      {chartType === 'line' ? (
        <Line 
          data={lineChartData} 
          options={lineOptions}
          ref={chartRef as React.RefObject<ChartJS<"line", number[], string>>}
        />
      ) : (
        <Bar 
          data={stackedChartData} 
          options={barOptions}
          ref={chartRef as React.RefObject<ChartJS<"bar", number[], string>>}
        />
      )}
    </Box>
  );
};

export default CompoundInterestChart;
