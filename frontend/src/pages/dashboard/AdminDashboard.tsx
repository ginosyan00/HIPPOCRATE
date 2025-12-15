import React, { useEffect, useState } from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Card, Button } from '../../components/common';
import { useAuthStore } from '../../store/useAuthStore';
import { userService } from '../../services/user.service';
import { User } from '../../types/api.types';

// Import icons
import hospitalIcon from '../../assets/icons/hospital.svg';
import doctorIcon from '../../assets/icons/doctor.svg';
import buildingIcon from '../../assets/icons/building.svg';
import briefcaseIcon from '../../assets/icons/briefcase.svg';
import clockIcon from '../../assets/icons/clock.svg';
import checkIcon from '../../assets/icons/check.svg';
import xIcon from '../../assets/icons/x.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import analyticsIcon from '../../assets/icons/analytics.svg';
import settingsIcon from '../../assets/icons/settings.svg';
import lightbulbIcon from '../../assets/icons/lightbulb.svg';
import fileTextIcon from '../../assets/icons/file-text.svg';
import mailIcon from '../../assets/icons/mail.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import userIcon from '../../assets/icons/user.svg';

/**
 * AdminDashboard
 * Գեղեցիկ dashboard ադմինների համար
 */
export const AdminDashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      setIsLoading(true);
      const users = await userService.getPendingUsers();
      setPendingUsers(users);
    } catch (err: any) {
      console.error('Ошибка загрузки pending users:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await userService.approveUser(userId);
      await loadPendingUsers();
      alert('Пользователь успешно одобрен!');
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Вы уверены что хотите отклонить этого пользователя?')) {
      return;
    }

    try {
      await userService.rejectUser(userId);
      await loadPendingUsers();
      alert('Пользователь отклонен');
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const getRoleTitle = (role: string) => {
    if (role === 'CLINIC') return 'Клиника';
    if (role === 'DOCTOR') return 'Врач';
    if (role === 'PARTNER') return 'Партнер';
    return role;
  };
  
  const getRoleIcon = (role: string) => {
    if (role === 'CLINIC') return hospitalIcon;
    if (role === 'DOCTOR') return doctorIcon;
    if (role === 'PARTNER') return buildingIcon;
    return briefcaseIcon;
  };

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-2">
                Панель администратора
              </h1>
              <p className="text-white/80 text-sm">
                {user?.name} • {pendingUsers.length} заявок на одобрении
              </p>
            </div>
            <div className="hidden md:block text-6xl opacity-20">
              <img src={briefcaseIcon} alt="Админ" className="w-24 h-24 opacity-20" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="lg" className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-blue-700 mb-2 font-medium">Всего пользователей</p>
                <h3 className="text-4xl font-bold text-blue-600">-</h3>
                <p className="text-xs text-blue-600 mt-2">в системе</p>
              </div>
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <img src={userIcon} alt="Пользователи" className="w-8 h-8 filter brightness-0 invert" />
              </div>
            </div>
          </Card>

          <Card padding="lg" className="hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-yellow-700 mb-2 font-medium">На одобрении</p>
                <h3 className="text-4xl font-bold text-yellow-600">{pendingUsers.length}</h3>
                <p className="text-xs text-yellow-600 mt-2">заявок</p>
              </div>
              <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <img src={clockIcon} alt="Ожидает" className="w-8 h-8" />
              </div>
            </div>
          </Card>

          <Card padding="lg" className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-green-700 mb-2 font-medium">Клиник</p>
                <h3 className="text-4xl font-bold text-green-600">
                  {pendingUsers.filter(u => u.role === 'CLINIC').length}
                </h3>
                <p className="text-xs text-green-600 mt-2">на модерации</p>
              </div>
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <img src={hospitalIcon} alt="Клиники" className="w-8 h-8" />
              </div>
            </div>
          </Card>

          <Card padding="lg" className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-purple-700 mb-2 font-medium">Партнеров</p>
                <h3 className="text-4xl font-bold text-purple-600">
                  {pendingUsers.filter(u => u.role === 'PARTNER').length}
                </h3>
                <p className="text-xs text-purple-600 mt-2">на модерации</p>
              </div>
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <img src={buildingIcon} alt="Партнеры" className="w-8 h-8" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-50">Заявки на одобрение</h2>
                  <p className="text-xs text-text-10 mt-1">Модерация новых пользователей</p>
                </div>
                {pendingUsers.length > 0 && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full animate-pulse">
                    {pendingUsers.length} новых
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-text-10">
                  <div className="flex justify-center mb-3 animate-pulse">
                    <img src={clockIcon} alt="Загрузка" className="w-16 h-16 opacity-50" />
                  </div>
                  <p className="text-sm">Загрузка заявок...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  <div className="flex justify-center mb-3">
                    <img src={xIcon} alt="Ошибка" className="w-16 h-16 opacity-50" />
                  </div>
                  <p className="text-sm">{error}</p>
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="text-center py-12 text-text-10">
                  <div className="flex justify-center mb-3">
                    <img src={checkIcon} alt="Готово" className="w-16 h-16 opacity-50" />
                  </div>
                  <p className="text-sm font-medium mb-2">Нет заявок на одобрение</p>
                  <p className="text-xs">Все пользователи одобрены</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map(pendingUser => (
                    <Card 
                      key={pendingUser.id} 
                      className="border-2 border-stroke hover:border-main-100 hover:shadow-md transition-all"
                      padding="md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-main-100 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <img src={getRoleIcon(pendingUser.role)} alt={getRoleTitle(pendingUser.role)} className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-text-50 truncate">{pendingUser.name}</h3>
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-medium rounded flex-shrink-0">
                                {getRoleTitle(pendingUser.role)}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs text-text-10">
                              <p className="truncate flex items-center gap-1">
                                <img src={mailIcon} alt="Email" className="w-3 h-3" />
                                {pendingUser.email}
                              </p>
                              {pendingUser.phone && (
                                <p className="truncate flex items-center gap-1">
                                  <img src={phoneIcon} alt="Телефон" className="w-3 h-3" />
                                  {pendingUser.phone}
                                </p>
                              )}

                              {/* Clinic Info */}
                              {pendingUser.role === 'CLINIC' && (
                                <p className="text-main-100 font-medium flex items-center gap-1">
                                  <img src={hospitalIcon} alt="Клиника" className="w-4 h-4" />
                                  Владелец клиники
                                </p>
                              )}

                              {/* Doctor Info */}
                              {pendingUser.role === 'DOCTOR' && (
                                <>
                                  <p className="truncate flex items-center gap-1">
                                    <img src={doctorIcon} alt="Специализация" className="w-3 h-3" />
                                    {pendingUser.specialization}
                                  </p>
                                  <p className="truncate flex items-center gap-1">
                                    <img src={fileTextIcon} alt="Лицензия" className="w-3 h-3" />
                                    {pendingUser.licenseNumber} • {pendingUser.experience} лет
                                  </p>
                                </>
                              )}

                              {/* Partner Info */}
                              {pendingUser.role === 'PARTNER' && (
                                <>
                                  <p className="truncate flex items-center gap-1">
                                    <img src={buildingIcon} alt="Организация" className="w-3 h-3" />
                                    {pendingUser.organizationName}
                                  </p>
                                  <p className="truncate flex items-center gap-1">
                                    <img src={fileTextIcon} alt="ИНН" className="w-3 h-3" />
                                    {pendingUser.inn}
                                  </p>
                                </>
                              )}

                              <p className="text-[10px] text-text-05 pt-1">
                                <span className="flex items-center gap-1">
                                  <img src={calendarIcon} alt="Дата" className="w-3 h-3" />
                                  {new Date(pendingUser.createdAt).toLocaleDateString('ru-RU')}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div 
                          className="flex flex-col gap-2 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(pendingUser.id)}
                            className="text-xs whitespace-nowrap"
                          >
                            <span className="flex items-center gap-2">
                              <img src={checkIcon} alt="Одобрить" className="w-4 h-4" />
                              Одобрить
                            </span>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleReject(pendingUser.id)}
                            className="text-xs hover:bg-red-50 hover:text-red-600 whitespace-nowrap"
                          >
                            <span className="flex items-center gap-2">
                              <img src={xIcon} alt="Отклонить" className="w-4 h-4" />
                              Отклонить
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-text-50 mb-4">Управление</h2>
              <div className="space-y-2">
                <button className="w-full p-3 border-2 border-main-100 bg-main-100 bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <img src={userIcon} alt="Пользователи" className="w-5 h-5" />
                    <div>
                      <h3 className="font-medium text-main-100 text-sm">Пользователи</h3>
                      <p className="text-xs text-text-10">Управление всеми</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 border border-stroke rounded-lg hover:border-main-100 hover:bg-main-100 hover:bg-opacity-5 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <img src={hospitalIcon} alt="Клиники" className="w-5 h-5" />
                    <div>
                      <h3 className="font-medium text-text-50 text-sm">Клиники</h3>
                      <p className="text-xs text-text-10">Список клиник</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 border border-stroke rounded-lg hover:border-main-100 hover:bg-main-100 hover:bg-opacity-5 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <img src={analyticsIcon} alt="Аналитика" className="w-5 h-5" />
                    <div>
                      <h3 className="font-medium text-text-50 text-sm">Аналитика</h3>
                      <p className="text-xs text-text-10">Статистика системы</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 border border-stroke rounded-lg hover:border-main-100 hover:bg-main-100 hover:bg-opacity-5 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <img src={settingsIcon} alt="Настройки" className="w-5 h-5" />
                    <div>
                      <h3 className="font-medium text-text-50 text-sm">Настройки</h3>
                      <p className="text-xs text-text-10">Конфигурация</p>
                    </div>
                  </div>
                </button>
              </div>
            </Card>

            {/* System Status */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200" padding="lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="font-semibold text-text-50 text-sm mb-1">Система работает</h3>
                <p className="text-xs text-text-10">
                  Все сервисы онлайн
                </p>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" padding="md">
              <div className="flex items-start gap-3">
                <img src={lightbulbIcon} alt="Совет" className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-text-50 text-sm mb-1">Совет</h3>
                  <p className="text-xs text-text-10 leading-relaxed">
                    Проверяйте документы пользователей перед одобрением
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </NewDashboardLayout>
  );
};
