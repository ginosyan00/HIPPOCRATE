import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Card, Button, Spinner } from '../../components/common';
import { useClinics, useCities } from '../../hooks/usePublic';
import { Clinic } from '../../types/api.types';

// Import icons
import searchIcon from '../../assets/icons/search.svg';

/**
 * PatientClinicsPage
 * Красивая и профессиональная страница для отображения клиник
 * Beautiful and professional clinics page for patients
 */
export const PatientClinicsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string>('');

  const { data: citiesData } = useCities();
  const { data, isLoading, error } = useClinics({ city: selectedCity || undefined });

  const cities = citiesData || [];
  const clinics = data?.data || [];

  const handleClinicClick = (clinic: Clinic) => {
    // Redirect to clinic's public page via landing
    navigate(`/clinic/${clinic.slug}`);
  };

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Beautiful Gradient Header */}
        <div className="bg-gradient-to-r from-main-100 via-blue-500 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Клиники 🏥
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Выберите клинику для записи на приём
              </p>
              {clinics.length > 0 && (
                <p className="text-white/70 text-xs mt-2">
                  Найдено <strong>{clinics.length}</strong> {clinics.length === 1 ? 'клиника' : clinics.length < 5 ? 'клиники' : 'клиник'}
                </p>
              )}
            </div>
            <div className="hidden md:block text-6xl md:text-8xl opacity-20 animate-pulse">
              🏥
            </div>
          </div>
        </div>

        {/* Enhanced Filter Card */}
        <Card 
          padding="lg" 
          className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-main-100 to-blue-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <img 
                src={searchIcon} 
                alt="Search" 
                className="w-6 h-6 filter brightness-0 invert"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-text-100 mb-2">
                Фильтр по городу
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="block w-full pl-4 pr-10 py-3 border-2 border-stroke rounded-xl bg-bg-white text-sm font-medium text-text-100 focus:outline-none focus:border-main-100 focus:ring-2 focus:ring-main-100/20 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                >
                  <option value="">Все города</option>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-text-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="text-text-50 text-sm mt-4">Загрузка клиник...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 shadow-lg animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Ошибка загрузки</h3>
                <p className="text-red-700 text-sm">Не удалось загрузить клиники. Попробуйте позже.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Clinics Grid */}
        {!isLoading && !error && (
          <>
            {clinics.length === 0 ? (
              <Card 
                padding="lg" 
                className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 shadow-lg animate-in fade-in slide-in-from-bottom-4"
              >
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-main-100 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg animate-pulse">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-text-100 text-xl font-bold mb-2">Клиники не найдены</h3>
                  <p className="text-text-50 text-sm mb-4">Попробуйте изменить фильтр или выбрать другой город</p>
                  {selectedCity && (
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => setSelectedCity('')}
                    >
                      Сбросить фильтр
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <>
                {/* Results Count with Badge */}
                <div className="flex items-center justify-between mb-4 animate-in fade-in slide-in-from-left-4">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-gradient-to-r from-main-100 to-blue-500 text-white rounded-xl shadow-md">
                      <span className="text-sm font-bold">{clinics.length}</span>
                    </div>
                    <p className="text-sm font-medium text-text-50">
                      {clinics.length === 1 ? 'Клиника найдена' : clinics.length < 5 ? 'Клиники найдены' : 'Клиник найдено'}
                    </p>
                  </div>
                </div>

                {/* Enhanced Clinics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clinics.map((clinic: Clinic, index: number) => (
                    <Card 
                      key={clinic.id} 
                      padding="none" 
                      className="overflow-hidden border-2 border-stroke hover:border-main-100 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 bg-bg-white group animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleClinicClick(clinic)}
                    >
                      {/* Hero Image or Gradient Background */}
                      {clinic.heroImage ? (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={clinic.heroImage} 
                            alt={clinic.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          {clinic.logo && (
                            <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-xl p-2 shadow-lg">
                              <img src={clinic.logo} alt={clinic.name} className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative h-48 bg-gradient-to-br from-main-100 via-blue-500 to-purple-600 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                          {clinic.logo ? (
                            <div className="absolute inset-0 flex items-center justify-center p-8">
                              <img 
                                src={clinic.logo} 
                                alt={clinic.name} 
                                className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
                              />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-8xl opacity-30">🏥</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Clinic Content */}
                      <div className="p-6 space-y-4">
                        {/* Clinic Name */}
                        <div>
                          <h3 className="text-xl font-bold text-text-100 mb-1 group-hover:text-main-100 transition-colors duration-300">
                            {clinic.name}
                          </h3>
                          {clinic.city && (
                            <div className="flex items-center gap-2 text-sm text-text-50">
                              <svg className="w-4 h-4 flex-shrink-0 text-main-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-medium">{clinic.city}</span>
                            </div>
                          )}
                        </div>

                        {/* Clinic Info */}
                        <div className="space-y-3 pt-2 border-t border-stroke">
                          {clinic.address && (
                            <div className="flex items-start gap-3 text-sm">
                              <div className="w-8 h-8 bg-main-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-main-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <span className="text-text-50 leading-relaxed line-clamp-2">{clinic.address}</span>
                            </div>
                          )}
                          {clinic.phone && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <span className="text-text-50 font-medium">{clinic.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* About */}
                        {clinic.about && (
                          <p className="text-sm text-text-10 line-clamp-3 leading-relaxed pt-2 border-t border-stroke">
                            {clinic.about}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="px-6 pb-6">
                        <Button 
                          variant="primary"
                          className="w-full text-sm font-semibold bg-gradient-to-r from-main-100 to-blue-500 text-white hover:from-main-100 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                          size="md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClinicClick(clinic);
                          }}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <span>Посмотреть клинику</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </NewDashboardLayout>
  );
};

