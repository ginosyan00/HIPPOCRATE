import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Input, Modal, Spinner, BackButton, Calendar } from '../../components/common';
import { CertificateGallery } from '../../components/public/CertificateGallery';
import { useClinic, useClinicDoctors, useCreatePublicAppointment } from '../../hooks/usePublic';
import { useAuthStore } from '../../store/useAuthStore';
import { publicService } from '../../services/public.service';
import { ClinicHero } from '../../components/public/ClinicHero';
import { ClinicAbout } from '../../components/public/ClinicAbout';
import { ClinicDoctors } from '../../components/public/ClinicDoctors';
import { ClinicContacts } from '../../components/public/ClinicContacts';

// Import icons
import lightbulbIcon from '../../assets/icons/lightbulb.svg';

/**
 * ClinicLandingPage - Professional Landing Page for Clinic
 * Красивая и профессиональная страница клиники с визуальным представлением всех данных из раздела Web
 */
export const ClinicLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const { data: clinic, isLoading: clinicLoading } = useClinic(slug!);
  const { data: doctors, isLoading: doctorsLoading } = useClinicDoctors(slug!);
  const createMutation = useCreatePublicAppointment();
  
  // Auth state
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const logout = useAuthStore(state => state.logout);

  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    reason: '',
  });
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [busySlots, setBusySlots] = useState<Array<{ start: string; end: string; appointmentId: string }>>([]);
  const [isLoadingBusySlots, setIsLoadingBusySlots] = useState(false);

  // Автозаполнение формы для авторизованных пользователей
  useEffect(() => {
    if (isModalOpen && isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        patientName: user.name || '',
        patientPhone: user.phone || '',
        patientEmail: user.email || '',
      }));
    } else if (isModalOpen && !isAuthenticated) {
      setFormData({
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        reason: '',
      });
    }
  }, [isModalOpen, isAuthenticated, user]);

  const handleOpenModal = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setIsModalOpen(true);
    setSuccessMessage('');
    setSelectedDate(null);
    setSelectedTime('');
    setBusySlots([]);
  };

  // Загрузка занятых слотов при изменении врача или даты
  useEffect(() => {
    const loadBusySlots = async () => {
      if (!slug || !selectedDoctor || !selectedDate) {
        setBusySlots([]);
        return;
      }

      try {
        setIsLoadingBusySlots(true);
        const dateStr = selectedDate.toISOString().split('T')[0];
        const slots = await publicService.getBusySlots(slug, selectedDoctor, dateStr);
        setBusySlots(slots);
      } catch (err) {
        console.error('Ошибка загрузки занятых слотов:', err);
        setBusySlots([]);
      } finally {
        setIsLoadingBusySlots(false);
      }
    };

    loadBusySlots();
  }, [slug, selectedDoctor, selectedDate]);
  
  const handleLogoutAndReset = () => {
    logout();
    setFormData({
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      reason: '',
    });
    navigate('/', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      alert('Пожалуйста, выберите дату и время приёма');
      return;
    }

    if (!isAuthenticated) {
      if (!formData.patientName.trim()) {
        alert('Пожалуйста, укажите ваше ФИО');
        return;
      }
      if (!formData.patientPhone.trim()) {
        alert('Пожалуйста, укажите ваш телефон');
        return;
      }
    } else if (isAuthenticated && user) {
      if (!user.phone && !formData.patientPhone.trim()) {
        alert('Пожалуйста, укажите ваш телефон для записи');
        return;
      }
    }

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      const appointmentDateTimeUTC = appointmentDateTime.toISOString();
      
      const now = new Date();
      const timezoneOffset = -now.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
      const offsetMinutes = Math.abs(timezoneOffset) % 60;
      const offsetSign = timezoneOffset >= 0 ? '+' : '-';
      const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
      
      const registeredAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}${offsetString}`;

      const patientData = isAuthenticated && user
        ? {
            name: user.name,
            phone: user.phone || formData.patientPhone || '',
            email: user.email || formData.patientEmail || undefined,
          }
        : {
            name: formData.patientName,
            phone: formData.patientPhone,
            email: formData.patientEmail || undefined,
          };

      await createMutation.mutateAsync({
        clinicSlug: slug!,
        doctorId: selectedDoctor,
        patient: patientData,
        appointmentDate: appointmentDateTimeUTC,
        reason: formData.reason || undefined,
        registeredAt: registeredAt,
      });

      setSuccessMessage('✅ Ваша заявка принята! Клиника свяжется с вами в ближайшее время.');
      
      if (!isAuthenticated) {
        setFormData({
          patientName: '',
          patientPhone: '',
          patientEmail: '',
          reason: '',
        });
      } else {
        setFormData(prev => ({
          ...prev,
          reason: '',
        }));
      }
      
      setSelectedDate(null);
      setSelectedTime('');
    } catch (err: any) {
      alert(err.message || 'Ошибка создания заявки');
    }
  };

  if (clinicLoading || doctorsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-bg-primary">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-xl font-medium text-text-100 mb-4">Клиника не найдена</h2>
            <Link to="/clinics">
              <Button className="text-sm font-normal bg-main-10 text-main-100 hover:bg-main-100 hover:text-white">
                ← Вернуться к каталогу
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <main className="bg-bg-primary min-h-screen">
        {/* Back Button */}
        <div className="container mx-auto px-8 pt-8">
          <BackButton 
            fallback={location.pathname.startsWith('/dashboard') ? '/dashboard/patient/clinics' : '/clinics'} 
          />
        </div>

        {/* Hero Section */}
        <ClinicHero 
          clinic={clinic}
          onBookAppointment={() => {
            if (doctors && doctors.length > 0) {
              handleOpenModal(doctors[0].id);
            }
          }}
        />

        {/* About Section */}
        <ClinicAbout clinic={clinic} />

        {/* Certificates Section */}
        {clinic.certificates && clinic.certificates.length > 0 && (
          <section className="py-20 bg-gradient-to-b from-bg-white to-bg-primary/20 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-main-100/20 to-transparent"></div>
            <div className="absolute top-20 right-0 w-64 h-64 bg-main-100/3 rounded-full blur-3xl"></div>
            
            <div className="container mx-auto px-8 relative z-10">
              <div className="text-center mb-12">
                <div className="inline-block mb-4">
                  <span className="text-main-100 font-semibold text-sm uppercase tracking-wider">Достижения</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-text-100 mb-4 leading-tight">
                  Сертификаты и лицензии
                </h2>
                <p className="text-lg text-text-50 max-w-2xl mx-auto">
                  Нажмите на изображение, чтобы просмотреть в полном размере
                </p>
              </div>
              <div className="animate-fade-in-up">
                <CertificateGallery certificates={clinic.certificates} />
              </div>
            </div>
            
            <style>{`
              @keyframes fade-in-up {
                from {
                  opacity: 0;
                  transform: translateY(30px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fade-in-up {
                animation: fade-in-up 0.8s ease-out;
              }
            `}</style>
          </section>
        )}

        {/* Doctors Section */}
        <ClinicDoctors 
          doctors={doctors || []}
          isLoading={doctorsLoading}
          onBookAppointment={handleOpenModal}
        />

        {/* Contacts Section */}
        <ClinicContacts clinic={clinic} />
      </main>

      {/* Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSuccessMessage('');
        }}
        title="Онлайн-запись на приём"
        size="lg"
      >
        {successMessage ? (
          <div className="text-center py-8">
            <div className="bg-secondary-10 w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-secondary-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-text-100 mb-2">Заявка отправлена!</h3>
            <p className="text-sm text-text-50 mb-6">{successMessage}</p>
            <Button 
              onClick={() => setIsModalOpen(false)}
              className="text-sm font-normal bg-main-10 text-main-100 hover:bg-main-100 hover:text-white"
            >
              Закрыть
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-main-10 border border-stroke px-4 py-3 rounded-sm">
              <p className="text-sm text-text-50">
                Врач: <strong className="text-text-100">{doctors?.find(d => d.id === selectedDoctor)?.name}</strong>
              </p>
            </div>

            {isAuthenticated && user && (
              <div className="bg-secondary-10 border border-secondary-50 px-4 py-3 rounded-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-text-10 mb-1">Вы записываетесь как:</p>
                    <p className="text-sm font-medium text-text-100">{user.name}</p>
                    <p className="text-xs text-text-50 mt-1">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-text-50">{user.phone}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleLogoutAndReset}
                    className="text-xs font-normal whitespace-nowrap"
                  >
                    Выйти
                  </Button>
                </div>
                <p className="text-xs text-text-10 mt-2">
                  ✓ Ваши данные автоматически заполнены.{user.phone ? ' Вам нужно только выбрать дату, время и указать причину визита.' : ' Пожалуйста, укажите ваш телефон для записи, выберите дату, время и причину визита.'}
                </p>
              </div>
            )}

            {!isAuthenticated && (
              <>
                <Input
                  label="Ваше ФИО"
                  placeholder="Иван Иванов"
                  value={formData.patientName}
                  onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Телефон"
                    type="tel"
                    placeholder="+374 98 123456"
                    value={formData.patientPhone}
                    onChange={e => setFormData({ ...formData, patientPhone: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="example@mail.com"
                    value={formData.patientEmail}
                    onChange={e => setFormData({ ...formData, patientEmail: e.target.value })}
                  />
                </div>
              </>
            )}

            {isAuthenticated && user && !user.phone && (
              <Input
                label="Телефон"
                type="tel"
                placeholder="+374 98 123456"
                value={formData.patientPhone}
                onChange={e => setFormData({ ...formData, patientPhone: e.target.value })}
                required
              />
            )}

            {!isAuthenticated && (
              <div className="bg-main-10 border border-stroke px-4 py-2 rounded-sm">
                <p className="text-xs text-text-50">
                  <span className="flex items-center gap-1">
                    <img src={lightbulbIcon} alt="Совет" className="w-4 h-4" />
                    <Link to="/register-user" className="text-main-100 hover:underline font-medium">
                      Зарегистрируйтесь
                    </Link>
                  </span> или <Link to="/login" className="text-main-100 hover:underline font-medium">
                    войдите
                  </Link>, чтобы не вводить данные каждый раз
                </p>
              </div>
            )}

            <div>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedTime('');
                }}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                minDate={new Date()}
                busySlots={busySlots}
                appointmentDuration={30}
              />
              {isLoadingBusySlots && (
                <p className="mt-2 text-xs text-text-10">Загрузка доступных слотов...</p>
              )}
              {(!selectedDate || !selectedTime) && !isLoadingBusySlots && (
                <p className="mt-2 text-xs text-text-10">
                  {!selectedDate ? 'Выберите дату' : 'Выберите время'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-normal text-text-10 mb-2">
                Причина визита
              </label>
              <textarea
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 placeholder-text-10 focus:outline-none focus:border-main-100 transition-smooth resize-none"
                placeholder="Опишите вашу проблему..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsModalOpen(false)}
                className="text-sm font-normal"
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                isLoading={createMutation.isPending}
                className="text-sm font-normal bg-main-10 text-main-100 hover:bg-main-100 hover:text-white"
              >
                Отправить заявку
              </Button>
            </div>
          </form>
        )}
      </Modal>

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





