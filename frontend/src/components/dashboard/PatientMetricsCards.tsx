import React, { useMemo } from 'react';
import { Card } from '../common';
import { Appointment } from '../../types/api.types';
import { Calendar, DollarSign, User, Building2, TrendingUp, CheckCircle2 } from 'lucide-react';

interface PatientMetricsCardsProps {
  appointments: Appointment[];
  isLoading?: boolean;
}

/**
 * PatientMetricsCards Component
 * Карточки ключевых метрик для пациента
 */
export const PatientMetricsCards: React.FC<PatientMetricsCardsProps> = ({
  appointments,
  isLoading = false,
}) => {
  const metrics = useMemo(() => {
    // Завершенные обследования (completed appointments)
    const completedAppointments = appointments.filter((apt) => apt.status === 'completed');

    // Общая сумма потраченных средств (sum of amounts для completed)
    const totalSpent = completedAppointments.reduce((sum, apt) => {
      return sum + (apt.amount || 0);
    }, 0);

    // Средняя стоимость приёма
    const averageCost = completedAppointments.length > 0
      ? totalSpent / completedAppointments.length
      : 0;

    // Количество записей по статусам
    const byStatus = {
      completed: completedAppointments.length,
      confirmed: appointments.filter((apt) => apt.status === 'confirmed').length,
      pending: appointments.filter((apt) => apt.status === 'pending').length,
      cancelled: appointments.filter((apt) => apt.status === 'cancelled').length,
    };

    // Уникальные врачи
    const uniqueDoctors = new Set(
      appointments
        .filter((apt) => apt.doctor?.id)
        .map((apt) => apt.doctor?.id)
    ).size;

    // Уникальные клиники
    const uniqueClinics = new Set(
      appointments
        .filter((apt) => apt.clinic?.id)
        .map((apt) => apt.clinic?.id)
    ).size;

    return {
      totalCompleted: completedAppointments.length,
      totalSpent,
      averageCost,
      byStatus,
      uniqueDoctors,
      uniqueClinics,
      totalAppointments: appointments.length,
    };
  }, [appointments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'AMD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} padding="lg" className="animate-pulse">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      id: 'examinations',
      label: 'Всего обследований',
      value: metrics.totalCompleted,
      subtitle: 'завершенных приёмов',
      icon: CheckCircle2,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
    },
    {
      id: 'spent',
      label: 'Всего потрачено',
      value: formatCurrency(metrics.totalSpent),
      subtitle: 'за все время',
      icon: DollarSign,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
    },
    {
      id: 'average',
      label: 'Средняя стоимость',
      value: formatCurrency(metrics.averageCost),
      subtitle: 'за приём',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
    },
    {
      id: 'appointments',
      label: 'Всего записей',
      value: metrics.totalAppointments,
      subtitle: 'все статусы',
      icon: Calendar,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
    },
  ];

  const additionalCards = [
    {
      id: 'doctors',
      label: 'Врачей посещено',
      value: metrics.uniqueDoctors,
      icon: User,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      id: 'clinics',
      label: 'Клиник посещено',
      value: metrics.uniqueClinics,
      icon: Building2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.id}
              padding="lg"
              className={`bg-gradient-to-br ${metric.bgGradient} border-2 ${metric.borderColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700 mb-2">{metric.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                  <p className="text-xs text-gray-600">{metric.subtitle}</p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Дополнительные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {additionalCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              padding="lg"
              className="border border-stroke hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-left-4"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-10 mb-1">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};


