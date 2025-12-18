import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Spinner } from '../../components/common';
import { useClinics, useCities } from '../../hooks/usePublic';
import { Clinic } from '../../types/api.types';

// Import icons
import searchIcon from '../../assets/icons/search.svg';
import hospitalIcon from '../../assets/icons/hospital.svg';

/**
 * Clinics Page - Figma Design Style
 * Каталог клиник в стиле медицинского дашборда
 */
export const ClinicsPage: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');

  const { data: citiesData } = useCities();
  const { data, isLoading, error } = useClinics({ city: selectedCity || undefined });

  const cities = citiesData || [];
  const clinics = data?.data || [];

  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-text-100 mb-3">Стоматологические клиники</h1>
          <p className="text-lg text-text-50">Найдите клинику рядом с вами и запишитесь онлайн</p>
        </div>

        {/* Filter Card */}
        <Card padding="md" className="mb-8 max-w-md">
          <label className="block text-sm font-normal text-text-10 mb-2">Фильтр по городу</label>
          <div className="relative">
            <img 
              src={searchIcon} 
              alt="Search" 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            />
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
            >
              <option value="">Все города</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">Ошибка загрузки клиник. Попробуйте позже.</p>
          </Card>
        )}

        {/* Clinics Grid */}
        {!isLoading && !error && (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-text-10">
                Найдено клиник: <span className="font-medium text-text-100">{clinics.length}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.length === 0 ? (
                <div className="col-span-full">
                  <Card padding="lg">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-main-10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-main-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-text-50 text-lg">Клиники не найдены</p>
                      <p className="text-text-10 text-sm mt-2">Попробуйте изменить фильтр</p>
                    </div>
                  </Card>
                </div>
              ) : (
                clinics.map((clinic: Clinic, index: number) => (
                  <div
                    key={clinic.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-fade-in"
                  >
                    <Card 
                      padding="none" 
                      className="overflow-hidden border-2 border-stroke hover:border-main-100/50 hover:shadow-2xl hover:shadow-main-100/20 transition-all duration-500 transform hover:-translate-y-3 bg-bg-white group rounded-xl"
                    >
                      {/* Hero Image or Gradient Background */}
                      {clinic.heroImage ? (
                        <div className="relative h-52 overflow-hidden">
                          <img 
                            src={clinic.heroImage} 
                            alt={clinic.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-500"></div>
                          {/* Decorative overlay pattern */}
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                          {clinic.logo && (
                            <div className="absolute top-4 right-4 w-18 h-18 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl group-hover:scale-110 transition-transform duration-300 border border-white/50">
                              <img src={clinic.logo} alt={clinic.name} className="w-full h-full object-contain" />
                            </div>
                          )}
                          {/* City Badge */}
                          {clinic.city && (
                            <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/50 group-hover:bg-white transition-all duration-300">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-main-100/10 rounded-full flex items-center justify-center">
                                  <svg className="w-3.5 h-3.5 text-main-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-bold text-text-100">{clinic.city}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative h-52 bg-gradient-to-br from-main-100 via-primary-400 to-primary-600 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
                          {/* Animated gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                          {clinic.logo ? (
                            <div className="absolute inset-0 flex items-center justify-center p-8 group-hover:scale-105 transition-transform duration-500">
                              <img 
                                src={clinic.logo} 
                                alt={clinic.name} 
                                className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
                              />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                              <img src={hospitalIcon} alt="Клиника" className="w-36 h-36 opacity-30" />
                            </div>
                          )}
                          {/* City Badge */}
                          {clinic.city && (
                            <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/50 group-hover:bg-white transition-all duration-300">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-main-100/10 rounded-full flex items-center justify-center">
                                  <svg className="w-3.5 h-3.5 text-main-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-bold text-text-100">{clinic.city}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Clinic Content */}
                      <div className="p-6 space-y-5">
                        {/* Clinic Name */}
                        <div>
                          <h3 className="text-xl font-bold text-text-100 mb-1 group-hover:text-main-100 transition-colors duration-300 leading-tight">
                            {clinic.name}
                          </h3>
                        </div>

                        {/* Clinic Info with Colorful Icons */}
                        <div className="space-y-3.5 pt-3 border-t border-stroke/50">
                          {clinic.address && (
                            <div className="flex items-start gap-3 text-sm group/contact">
                              <div className="w-9 h-9 bg-main-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/contact:bg-main-100 group-hover/contact:scale-110 transition-all duration-300 shadow-sm">
                                <svg className="w-4.5 h-4.5 text-main-100 group-hover/contact:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <span className="text-text-50 leading-relaxed line-clamp-2 pt-1">{clinic.address}</span>
                            </div>
                          )}
                          {clinic.phone && (
                            <div className="flex items-center gap-3 text-sm group/contact">
                              <div className="w-9 h-9 bg-main-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/contact:bg-main-100 group-hover/contact:scale-110 transition-all duration-300 shadow-sm">
                                <svg className="w-4.5 h-4.5 text-main-100 group-hover/contact:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <span className="text-text-50 font-medium pt-1">{clinic.phone}</span>
                            </div>
                          )}
                          {clinic.email && (
                            <div className="flex items-center gap-3 text-sm group/contact">
                              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/contact:bg-primary-200 group-hover/contact:scale-110 transition-all duration-300 shadow-sm">
                                <svg className="w-4.5 h-4.5 text-main-100 group-hover/contact:text-primary-700 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <span className="text-text-50 truncate pt-1">{clinic.email}</span>
                            </div>
                          )}
                        </div>

                        {/* About */}
                        {clinic.about && (
                          <p className="text-sm text-text-10 line-clamp-3 leading-relaxed pt-3 border-t border-stroke/50">
                            {clinic.about}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="px-6 pb-6">
                        <Link to={`/clinic/${clinic.slug}`} className="block">
                          <Button 
                            className="w-full text-sm font-semibold bg-main-100 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl hover:shadow-main-100/30 transition-all duration-500 transform hover:scale-[1.02] rounded-xl py-3 relative overflow-hidden group/btn"
                            size="md"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <span>Записаться на приём</span>
                              <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-bg-white border-t border-stroke py-8 mt-20">
        <div className="container mx-auto px-8 text-center">
          <p className="text-text-10 text-sm">
            © 2025 Hippocrates Dental. Все права защищены.
          </p>
        </div>
      </footer>
    </>
  );
};
