import React, { useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Card } from '../common';
import { Appointment } from '../../types/api.types';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PatientMiniChartProps {
  appointments: Appointment[];
  isLoading?: boolean;
}

/**
 * PatientMiniChart Component
 * Գեղեցիկ մինի գրաֆիկներ պացիենտի գրանցումների համար
 */
export const PatientMiniChart: React.FC<PatientMiniChartProps> = ({
  appointments,
  isLoading = false,
}) => {
  const chartData = useMemo(() => {
    // Группируем записи по последним 6 месяцам
    const now = new Date();
    const months: string[] = [];
    const monthCounts: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('ru-RU', { month: 'short' });
      months.push(monthName);

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const count = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= monthStart && aptDate <= monthEnd;
      }).length;

      monthCounts.push(count);
    }

    // Статусы записей для круговой диаграммы
    const statusCounts = {
      completed: appointments.filter((apt) => apt.status === 'completed').length,
      confirmed: appointments.filter((apt) => apt.status === 'confirmed').length,
      pending: appointments.filter((apt) => apt.status === 'pending').length,
      cancelled: appointments.filter((apt) => apt.status === 'cancelled').length,
    };

    return {
      lineChart: {
        labels: months,
        datasets: [
          {
            label: 'Записей',
            data: monthCounts,
            borderColor: 'rgb(58, 111, 248)',
            backgroundColor: 'rgba(58, 111, 248, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(58, 111, 248)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: 'rgb(58, 111, 248)',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
          },
        ],
      },
      doughnutChart: {
        labels: ['Завершено', 'Подтверждено', 'Ожидает', 'Отменено'],
        datasets: [
          {
            data: [
              statusCounts.completed,
              statusCounts.confirmed,
              statusCounts.pending,
              statusCounts.cancelled,
            ],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(234, 179, 8, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(59, 130, 246)',
              'rgb(234, 179, 8)',
              'rgb(239, 68, 68)',
            ],
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
    };
  }, [appointments]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
          beginAtZero: true,
          precision: 0,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
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
        cornerRadius: 8,
      },
    },
    cutout: '70%',
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} padding="lg" className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Линейный график */}
      <Card padding="lg" className="border border-stroke hover:shadow-lg transition-shadow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-50 mb-1">Динамика записей</h3>
          <p className="text-xs text-text-10">Последние 6 месяцев</p>
        </div>
        <div className="h-64">
          <Line data={chartData.lineChart} options={chartOptions} />
        </div>
      </Card>

      {/* Круговая диаграмма */}
      <Card padding="lg" className="border border-stroke hover:shadow-lg transition-shadow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-50 mb-1">Статусы записей</h3>
          <p className="text-xs text-text-10">Распределение по статусам</p>
        </div>
        <div className="h-64">
          <Doughnut data={chartData.doughnutChart} options={doughnutOptions} />
        </div>
      </Card>
    </div>
  );
};

