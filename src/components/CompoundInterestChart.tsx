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
    maximumFractionDigits: 2
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
  
  // Calculate reference data for +5%, +10%, +15% rates
  const principal = yearlyData[0].endBalance;
  const monthlyContribution = yearlyData.length > 1 ? yearlyData[1].contribution / 12 : 0;
  const totalYears = yearlyData.length - 1;
  
  const refRate1 = annualRate + 5;
  const refRate2 = annualRate + 10;
  const refRate3 = annualRate + 15;
  
  const refData1 = calculateWithRate(principal, monthlyContribution, refRate1, totalYears);
  const refData2 = calculateWithRate(principal, monthlyContribution, refRate2, totalYears);
  const refData3 = calculateWithRate(principal, monthlyContribution, refRate3, totalYears);

  // Line chart data
  const lineChartData: ChartData<'line'> = {
    labels: years,
    datasets: [
      {
        label: 'Din balance',
        data: endBalances,
        borderColor: '#9c27b0', // Purple color
        backgroundColor: 'rgba(156, 39, 176, 0.2)', // Purple with opacity
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#9c27b0',
        borderWidth: 2,
      },
      {
        label: 'Indbetalinger',
        data: cumulativeContributions,
        borderColor: theme.palette.grey[500],
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.1,
        // Show dot only on last data point
        pointRadius: cumulativeContributions.map((_, idx) =>
          idx === cumulativeContributions.length - 1 ? 3 : 0
        ),
        pointHoverRadius: cumulativeContributions.map((_, idx) =>
          idx === cumulativeContributions.length - 1 ? 6 : 0
        ),
        borderWidth: 2,
      },
      // Reference lines - only shown in line chart
      ...(chartType === 'line' ? [
        {
          label: `+5% → ${refRate1.toFixed(1)}%`,
          data: refData1,
          borderColor: theme.palette.warning.main, // Yellow
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 1.5,
          borderDash: [3, 3],
        },
        {
          label: `+10% → ${refRate2.toFixed(1)}%`,
          data: refData2,
          borderColor: theme.palette.info.main, // Blue
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 1.5,
          borderDash: [3, 3],
        },
        {
          label: `+15% → ${refRate3.toFixed(1)}%`,
          data: refData3,
          borderColor: theme.palette.success.main, // Green
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
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
        // Keep legend on top but push items to the far right
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
            return `År ${context[0].label}`;
          },
          label: function(context: TooltipItem<'line' | 'bar'>) {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            
            if (chartType === 'line') {
              if (label === 'Din slut balance') {
                return `${label}: ${formatDKK(value)}`;
              } else if (label === 'Indbetalinger') {
                return `${label}: ${formatDKK(value)}`;
              } else if (label.includes('%')) {
                return `${label}: ${formatDKK(value)}`;
              }
            } else {
              // For stacked chart
              return `${label}: ${formatDKK(value)}`;
            }
            return '';
          },
          afterBody: function(context: TooltipItem<'line' | 'bar'>[]) {
            if (chartType === 'line') {
              const year = parseInt(context[0].label);
              if (year > 0 && year < yearlyData.length) {
                const data = yearlyData[year];
                return [
                  '',
                  `Årlig indbetaling: ${formatDKK(data.contribution)}`,
                  `Renter optjent: ${formatDKK(data.interest)}`,
                  `Afkastrate: ${annualRate}%`
                ];
              }
            }
            return [];
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
