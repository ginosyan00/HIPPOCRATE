import React from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Card, Button } from '../../components/common';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * PartnerDashboard
 * Գեղեցիկ dashboard պարտներների համար (Pharmacy, Laboratory, Insurance)
 */
export const PartnerDashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);

  // Mock data
  const stats = {
    orders: 24,
    revenue: '125,000 ֏',
    products: 156,
    customers: 89,
  };

  const recentOrders = [
    { id: 1, orderNumber: '#ORD-001', customer: 'Медцентр Здоровье', items: 5, total: '15,000 ֏', status: 'pending', date: '14 Янв 2025' },
    { id: 2, orderNumber: '#ORD-002', customer: 'Клиника Плюс', items: 3, total: '8,500 ֏', status: 'completed', date: '14 Янв 2025' },
    { id: 3, orderNumber: '#ORD-003', customer: 'Больница №1', items: 12, total: '42,000 ֏', status: 'processing', date: '13 Янв 2025' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    };
    const labels = {
      pending: '⏳ Ожидает',
      processing: '🔄 В обработке',
      completed: '✅ Выполнен',
    };
    return { style: styles[status as keyof typeof styles], label: labels[status as keyof typeof labels] };
  };

  const getPartnerIcon = () => {
    if (user?.organizationType === 'pharmacy') return '💊';
    if (user?.organizationType === 'laboratory') return '🔬';
    if (user?.organizationType === 'insurance') return '🛡️';
    return '🏢';
  };

  const getPartnerTitle = () => {
    if (user?.organizationType === 'pharmacy') return 'Аптека';
    if (user?.organizationType === 'laboratory') return 'Лаборатория';
    if (user?.organizationType === 'insurance') return 'Страховая компания';
    return 'Партнер';
  };

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-2">
                {user?.organizationName || 'Панель партнера'} {getPartnerIcon()}
              </h1>
              <p className="text-white/80 text-sm">
                {getPartnerTitle()} • {stats.orders} новых заказов
              </p>
            </div>
            <div className="hidden md:block text-6xl opacity-20">
              {getPartnerIcon()}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="lg" className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-blue-700 mb-2 font-medium">Заказов сегодня</p>
                <h3 className="text-4xl font-bold text-blue-600">{stats.orders}</h3>
                <p className="text-xs text-blue-600 mt-2">активных</p>
              </div>
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📦</span>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-green-700 mb-2 font-medium">Доход за месяц</p>
                <h3 className="text-3xl font-bold text-green-600">{stats.revenue}</h3>
                <p className="text-xs text-green-600 mt-2">текущий месяц</p>
              </div>
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">💰</span>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-purple-700 mb-2 font-medium">Товаров/Услуг</p>
                <h3 className="text-4xl font-bold text-purple-600">{stats.products}</h3>
                <p className="text-xs text-purple-600 mt-2">в каталоге</p>
              </div>
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📋</span>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-orange-700 mb-2 font-medium">Клиентов</p>
                <h3 className="text-4xl font-bold text-orange-600">{stats.customers}</h3>
                <p className="text-xs text-orange-600 mt-2">всего</p>
              </div>
              <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">👥</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-50">Последние заказы</h2>
                  <p className="text-xs text-text-10 mt-1">Управление заказами от клиник</p>
                </div>
                <Button variant="primary" size="sm">
                  Все заказы
                </Button>
              </div>

              <div className="space-y-3">
                {recentOrders.map(order => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <Card key={order.id} className="border-2 border-stroke hover:border-main-100 hover:shadow-md transition-all" padding="md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-main-100 bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">📦</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-text-50 text-sm">{order.orderNumber}</h3>
                              <span className={`px-2 py-0.5 ${badge.style} text-[10px] font-medium rounded`}>
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-xs text-text-10 truncate">🏥 {order.customer}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-text-10">
                              <span>📦 {order.items} товаров</span>
                              <span>💰 {order.total}</span>
                              <span>📅 {order.date}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="primary" size="sm">
                          Подробнее
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>

            {/* Popular Products */}
            <Card padding="lg" className="mt-6">
              <h2 className="text-lg font-semibold text-text-50 mb-4">Популярные товары</h2>
              <div className="space-y-3">
                {[
                  { name: 'Парацетамол 500мг', orders: 45, stock: 250 },
                  { name: 'Витамин C', orders: 38, stock: 180 },
                  { name: 'Анальгин', orders: 32, stock: 120 },
                ].map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-stroke rounded-lg hover:bg-bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💊</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-text-50 text-sm">{product.name}</h3>
                        <p className="text-xs text-text-10">{product.orders} заказов</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-10">На складе</p>
                      <p className="text-sm font-semibold text-main-100">{product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-text-50 mb-4">Быстрые действия</h2>
              <div className="space-y-2">
                <button className="w-full p-3 border-2 border-main-100 bg-main-100 bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">➕</span>
                    <div>
                      <h3 className="font-medium text-main-100 text-sm">Новый заказ</h3>
                      <p className="text-xs text-text-10">Создать заказ</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 border border-stroke rounded-lg hover:border-main-100 hover:bg-main-100 hover:bg-opacity-5 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📦</span>
                    <div>
                      <h3 className="font-medium text-text-50 text-sm">Склад</h3>
                      <p className="text-xs text-text-10">Управление товарами</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 border border-stroke rounded-lg hover:border-main-100 hover:bg-main-100 hover:bg-opacity-5 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👥</span>
                    <div>
                      <h3 className="font-medium text-text-50 text-sm">Клиенты</h3>
                      <p className="text-xs text-text-10">База клиентов</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 border border-stroke rounded-lg hover:border-main-100 hover:bg-main-100 hover:bg-opacity-5 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <div>
                      <h3 className="font-medium text-text-50 text-sm">Отчеты</h3>
                      <p className="text-xs text-text-10">Статистика и аналитика</p>
                    </div>
                  </div>
                </button>
              </div>
            </Card>

            {/* Organization Info */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200" padding="lg">
              <h2 className="text-sm font-semibold text-text-50 mb-3">Информация об организации</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-10">Название:</span>
                  <span className="text-text-50 font-medium">{user?.organizationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-10">Тип:</span>
                  <span className="text-text-50 font-medium">{getPartnerTitle()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-10">ИНН:</span>
                  <span className="text-text-50 font-medium">{user?.inn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-10">Адрес:</span>
                  <span className="text-text-50 font-medium text-right truncate max-w-[150px]">{user?.address}</span>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200" padding="md">
              <div className="text-center">
                <span className="text-3xl">📈</span>
                <h3 className="font-semibold text-text-50 text-sm mt-2 mb-1">Отличные результаты!</h3>
                <p className="text-xs text-text-10">
                  +15% роста продаж за последний месяц
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </NewDashboardLayout>
  );
};
