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

  // Line chart data
  const lineChartData: ChartData<'line'> = {
    labels: years,
    datasets: [
      {
        label: 'Slutbalance',
        data: endBalances,
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}33`, // 20% opacity
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: theme.palette.primary.main,
        borderWidth: 2,
      },
      {
        label: 'Indbetalinger',
        data: cumulativeContributions,
        borderColor: theme.palette.grey[500],
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2,
      }
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
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
            weight: 'bold',
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
              if (label === 'Slutbalance') {
                return `${label}: ${formatDKK(value)}`;
              } else if (label === 'Indbetalinger') {
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
      annotation: chartType === 'line' ? {
        annotations: {
          line1: {
            type: 'line',
            yMin: yearlyData[yearlyData.length - 1].totalContributed,
            yMax: yearlyData[yearlyData.length - 1].totalContributed,
            xMin: 0,
            xMax: yearlyData.length - 1,
            borderColor: theme.palette.grey[500],
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
              display: true,
              content: 'Total indbetalt',
              position: 'end',
              backgroundColor: theme.palette.grey[700],
              color: theme.palette.common.white,
              font: {
                size: 12,
              },
              padding: 6,
            },
          },
        }
      } : undefined,
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
