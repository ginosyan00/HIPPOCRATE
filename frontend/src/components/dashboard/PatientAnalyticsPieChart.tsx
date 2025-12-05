import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Card } from '../common';
import { Appointment } from '../../types/api.types';

// Регистрируем компоненты Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface PatientAnalyticsPieChartProps {
  appointments: Appointment[];
  isLoading?: boolean;
}

/**
 * PatientAnalyticsPieChart Component
 * Круговая диаграмма распределения записей по статусам
 */
export const PatientAnalyticsPieChart: React.FC<PatientAnalyticsPieChartProps> = ({
  appointments,
  isLoading = false,
}) => {
  const chartData = useMemo(() => {
    if (!appointments || appointments.length === 0) {
      return { labels: [], datasets: [] };
    }

    const statusCounts = {
      completed: appointments.filter((apt) => apt.status === 'completed').length,
      confirmed: appointments.filter((apt) => apt.status === 'confirmed').length,
      pending: appointments.filter((apt) => apt.status === 'pending').length,
      cancelled: appointments.filter((apt) => apt.status === 'cancelled').length,
    };

    const labels = ['Завершено', 'Подтверждено', 'Ожидает', 'Отменено'];
    const data = [
      statusCounts.completed,
      statusCounts.confirmed,
      statusCounts.pending,
      statusCounts.cancelled,
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Записей',
          data,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // completed - green
            'rgba(59, 130, 246, 0.8)',  // confirmed - blue
            'rgba(251, 146, 60, 0.8)',  // pending - orange
            'rgba(239, 68, 68, 0.8)',   // cancelled - red
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(251, 146, 60)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  }, [appointments]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
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
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    elements: {
      arc: {
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
        <h3 className="text-lg font-semibold text-text-50 mb-4">Распределение по статусам</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-text-10">Нет данных для отображения</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="border border-stroke shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-50 mb-1">Распределение записей по статусам</h3>
        <p className="text-xs text-text-10">Общее количество записей по статусам</p>
      </div>
      <div style={{ height: '300px' }}>
        <Pie data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};


