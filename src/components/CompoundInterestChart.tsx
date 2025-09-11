"use client"

import { useRef, useEffect } from 'react'
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

const CompoundInterestChart = ({ yearlyData, chartType, annualRate }: CompoundInterestChartProps) => {
  const chartRef = useRef<ChartJS>(null)
  const theme = useTheme()

  // Extract years for labels
  const years = yearlyData.map(data => data.year)
  
  // Extract end balances for line chart
  const endBalances = yearlyData.map(data => data.endBalance)
  
  // Extract contributions and interests for stacked chart
  const contributions = yearlyData.map(data => data.contribution)
  const interests = yearlyData.map(data => data.interest)
  const cumulativeContributions = yearlyData.map(data => data.totalContributed)
  
  // Calculate reference data for dynamic benchmark rates
  const principal = yearlyData[0].endBalance;
  const monthlyContribution = yearlyData.length > 1 ? yearlyData[1].contribution / 12 : 0;
  const totalYears = yearlyData.length - 1;
  
  // Calculate dynamic gaps based on user rate
  const { gap1, gap2 } = calculateDynamicGaps(annualRate);
  
  // Dynamic benchmark rates
  const refRate1 = Math.max(0.1, annualRate - gap1); // Yellow (ensure minimum 0.1%)
  const refRate2 = Math.max(0.1, annualRate - gap2); // Blue (ensure minimum 0.1%)
  const refRate3 = annualRate + 5; // Purple (always user rate + 5%)
  
  const refData1 = calculateWithRate(principal, monthlyContribution, refRate1, totalYears);
  const refData2 = calculateWithRate(principal, monthlyContribution, refRate2, totalYears);
  const refData3 = calculateWithRate(principal, monthlyContribution, refRate3, totalYears);

  // Line chart data
  const lineChartData: ChartData<'line'> = {
    labels: years,
    datasets: [
      {
        label: 'Din',
        data: endBalances,
        // Switched to green
        borderColor: theme.palette.success.main,
        backgroundColor: `${theme.palette.success.main}33`, // 20 % opacity
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: theme.palette.success.main,
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
          label: `${refRate1.toFixed(1)}%`,
          data: refData1,
          borderColor: theme.palette.warning.main, // Yellow
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 1.5,
          borderDash: [3, 3],
        },
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
        }
      ] : [])
    ],
  }

  // Stacked bar chart data
  const stackedChartData: ChartData<'bar'> = {
    labels: years,
    datasets: [
      {
        label: 'Indbetalinger',
        data: contributions,
        backgroundColor: theme.palette.grey[600],
        hoverBackgroundColor: theme.palette.grey[500],
        stack: 'stack0',
        barPercentage: 0.6,
      },
      {
        label: 'Renter',
        data: interests,
        backgroundColor: theme.palette.primary.main,
        hoverBackgroundColor: theme.palette.primary.light,
        stack: 'stack0',
        barPercentage: 0.6,
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
              
              // Return formatted tooltip content
              return [
                `Total Investeret: ${formatDKK(totalInvested)}`,
                `Total Værdi: ${formatDKK(value)}`,
                `Renter Optjent: ${formatDKK(interestEarned)}`
              ];
            } else {
              // For stacked chart, keep original format
              return `${label}: ${formatDKK(value)}`;
            }
          }
        }
      },
      // Remove always-visible annotation; line tooltip appears on hover instead
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'År',
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
            return index % 2 === 0 || index === years.length - 1 ? `År ${value}` : '';
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
  };

  // Effect to update chart when data changes
  useEffect(() => {
    const chart = chartRef.current;
    
    if (chart) {
      chart.update();
    }
  }, [yearlyData, chartType, annualRate]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
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
    </div>
  );
};

export default CompoundInterestChart;
