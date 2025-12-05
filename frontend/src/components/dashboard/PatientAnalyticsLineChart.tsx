import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card } from '../common';
import { Appointment } from '../../types/api.types';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PatientAnalyticsLineChartProps {
  appointments: Appointment[];
  chartType?: 'daily' | 'weekly' | 'monthly';
  isLoading?: boolean;
}

/**
 * PatientAnalyticsLineChart Component
 * Линейный график динамики записей пациента
 */
export const PatientAnalyticsLineChart: React.FC<PatientAnalyticsLineChartProps> = ({
  appointments,
  chartType = 'monthly',
  isLoading = false,
}) => {
  const chartData = useMemo(() => {
    if (!appointments || appointments.length === 0) {
      return { labels: [], datasets: [] };
    }

    let labels: string[] = [];
    let appointmentCounts: number[] = [];
    let revenueData: number[] = [];

    const completedAppointments = appointments.filter((apt) => apt.status === 'completed');

    if (chartType === 'daily') {
      // График по дням (последние 30 дней)
      const now = new Date();
      const days: Date[] = [];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        days.push(date);
      }

      labels = days.map((date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}`;
      });

      appointmentCounts = days.map((date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        return appointments.filter((apt) => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= dayStart && aptDate <= dayEnd;
        }).length;
      });

      revenueData = days.map((date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        return completedAppointments
          .filter((apt) => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= dayStart && aptDate <= dayEnd;
          })
          .reduce((sum, apt) => sum + (apt.amount || 0), 0);
      });
    } else if (chartType === 'weekly') {
      // График по неделям (последние 12 недель)
      const now = new Date();
      const weeks: { start: Date; end: Date }[] = [];

      for (let i = 11; i >= 0; i--) {
        const weekDate = new Date(now);
        weekDate.setDate(weekDate.getDate() - i * 7);
        const day = weekDate.getDay();
        const diff = weekDate.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(weekDate);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        weeks.push({ start: weekStart, end: weekEnd });
      }

      labels = weeks.map((week, index) => {
        const weekNum = 12 - index;
        const day = String(week.start.getDate()).padStart(2, '0');
        const month = String(week.start.getMonth() + 1).padStart(2, '0');
        return `Нед. ${weekNum} (${day}.${month})`;
      });

      appointmentCounts = weeks.map((week) => {
        return appointments.filter((apt) => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= week.start && aptDate <= week.end;
        }).length;
      });

      revenueData = weeks.map((week) => {
        return completedAppointments
          .filter((apt) => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= week.start && aptDate <= week.end;
          })
          .reduce((sum, apt) => sum + (apt.amount || 0), 0);
      });
    } else {
      // График по месяцам (последние 12 месяцев)
      const now = new Date();
      const months: Date[] = [];

      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(monthDate);
      }

      labels = months.map((date) => {
        const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        return monthNames[date.getMonth()];
      });

      appointmentCounts = months.map((monthDate) => {
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

        return appointments.filter((apt) => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= monthStart && aptDate <= monthEnd;
        }).length;
      });

      revenueData = months.map((monthDate) => {
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

        return completedAppointments
          .filter((apt) => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= monthStart && aptDate <= monthEnd;
          })
          .reduce((sum, apt) => sum + (apt.amount || 0), 0);
      });
    }

    return {
      labels,
      datasets: [
        {
          label: 'Количество записей',
          data: appointmentCounts,
          borderColor: 'rgb(58, 111, 248)',
          backgroundColor: 'rgba(58, 111, 248, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Сумма затрат (AMD)',
          data: revenueData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };
  }, [appointments, chartType]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          color: '#6B7280',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        borderColor: '#3A6FF8',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        grid: {
          color: '#F1F1F1',
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return new Intl.NumberFormat('ru-RU').format(value) + ' AMD';
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    },
  };

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-text-10">Загрузка графика...</div>
        </div>
      </Card>
    );
  }

  if (!chartData.labels || chartData.labels.length === 0) {
    return (
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-text-50 mb-4">Динамика записей и затрат</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-text-10">Нет данных для отображения</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="border border-stroke shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-50 mb-1">Динамика записей и затрат</h3>
        <p className="text-xs text-text-10">
          {chartType === 'daily' && 'Последние 30 дней'}
          {chartType === 'weekly' && 'Последние 12 недель'}
          {chartType === 'monthly' && 'Последние 12 месяцев'}
        </p>
      </div>
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};


