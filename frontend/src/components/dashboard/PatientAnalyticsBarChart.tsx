import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card } from '../common';
import { Appointment } from '../../types/api.types';

// Регистрируем компоненты Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PatientAnalyticsBarChartProps {
  appointments: Appointment[];
  type?: 'byDoctor' | 'byCategory';
  isLoading?: boolean;
}

/**
 * PatientAnalyticsBarChart Component
 * Столбчатый график для аналитики пациента
 */
export const PatientAnalyticsBarChart: React.FC<PatientAnalyticsBarChartProps> = ({
  appointments,
  type = 'byDoctor',
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

    if (type === 'byDoctor') {
      // График по врачам
      const doctorMap = new Map<string, { name: string; count: number; revenue: number }>();

      appointments.forEach((apt) => {
        if (apt.doctor?.id && apt.doctor?.name) {
          const existing = doctorMap.get(apt.doctor.id) || {
            name: apt.doctor.name,
            count: 0,
            revenue: 0,
          };
          existing.count += 1;
          if (apt.status === 'completed' && apt.amount) {
            existing.revenue += apt.amount;
          }
          doctorMap.set(apt.doctor.id, existing);
        }
      });

      const sortedDoctors = Array.from(doctorMap.values()).sort((a, b) => b.count - a.count);
      labels = sortedDoctors.map((doc) => doc.name);
      appointmentCounts = sortedDoctors.map((doc) => doc.count);
      revenueData = sortedDoctors.map((doc) => doc.revenue);
    } else {
      // График по категориям (reason)
      const categoryMap = new Map<string, { count: number; revenue: number }>();

      appointments.forEach((apt) => {
        const category = apt.reason || 'Без категории';
        const existing = categoryMap.get(category) || { count: 0, revenue: 0 };
        existing.count += 1;
        if (apt.status === 'completed' && apt.amount) {
          existing.revenue += apt.amount;
        }
        categoryMap.set(category, existing);
      });

      const sortedCategories = Array.from(categoryMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count);

      labels = sortedCategories.map((cat) => cat.name.length > 20 ? cat.name.substring(0, 20) + '...' : cat.name);
      appointmentCounts = sortedCategories.map((cat) => cat.count);
      revenueData = sortedCategories.map((cat) => cat.revenue);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Количество записей',
          data: appointmentCounts,
          backgroundColor: 'rgba(58, 111, 248, 0.8)',
          yAxisID: 'y',
        },
        {
          label: 'Сумма затрат (AMD)',
          data: revenueData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          yAxisID: 'y1',
        },
      ],
    };
  }, [appointments, type]);

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
            size: 11,
          },
          maxRotation: 45,
          minRotation: 45,
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
      bar: {
        borderRadius: 4,
        borderSkipped: false,
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
        <h3 className="text-lg font-semibold text-text-50 mb-4">
          {type === 'byDoctor' ? 'По врачам' : 'По категориям'}
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-text-10">Нет данных для отображения</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="border border-stroke shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-50 mb-1">
          {type === 'byDoctor' ? 'Распределение по врачам' : 'Распределение по процедурам'}
        </h3>
        <p className="text-xs text-text-10">Количество записей и сумма затрат</p>
      </div>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};


