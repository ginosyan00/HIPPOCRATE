import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Input, Modal } from '../common';
import { usePatientVisits } from '../../hooks/usePatientVisits';
import { PatientVisit } from '../../types/api.types';
import { formatAppointmentDateTime } from '../../utils/dateFormat';
import searchIcon from '../../assets/icons/search.svg';

/**
 * Тип для уникального пациента с историей визитов
 */
interface UniquePatient {
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  visitCount: number;
  lastVisitDate: Date;
  lastVisitStatus: string;
  totalAmount: number;
  visits: PatientVisit[]; // Все визиты пациента для детального просмотра
}

/**
 * ClinicPatientsSection Component
 * Показывает пациентов, которые были на приёме в клинике
 * Каждый пациент отображается только один раз
 */
export const ClinicPatientsSection: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<UniquePatient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загружаем все визиты (пациенты с appointments)
  const { data: visitsData, isLoading } = usePatientVisits({
    limit: 100, // Загружаем больше для получения всех пациентов
  });

  // Извлекаем уникальных пациентов из визитов
  const uniquePatients = useMemo(() => {
    if (!visitsData?.data) return [];

    const visits: PatientVisit[] = visitsData.data;
    const patientMap = new Map<string, UniquePatient>();

    visits.forEach((visit: PatientVisit) => {
      // Используем patientId как ключ, если он есть и не пустой
      const key = visit.patientId && visit.patientId.trim() !== '' 
        ? visit.patientId 
        : `${visit.patientName}_${visit.patientPhone}`; // Fallback для случаев без ID
      
      const existing = patientMap.get(key);
      
      if (!existing) {
        patientMap.set(key, {
          patientId: visit.patientId,
          patientName: visit.patientName,
          patientPhone: visit.patientPhone,
          patientEmail: visit.patientEmail,
          visitCount: 1,
          lastVisitDate: new Date(visit.appointmentDate),
          lastVisitStatus: visit.status,
          totalAmount: visit.amount || 0,
          visits: [visit], // Сохраняем все визиты
        });
      } else {
        existing.visitCount += 1;
        existing.totalAmount += (visit.amount || 0);
        existing.visits.push(visit); // Добавляем визит в историю
        
        // Обновляем последний визит
        const visitDate = new Date(visit.appointmentDate);
        if (visitDate > existing.lastVisitDate) {
          existing.lastVisitDate = visitDate;
          existing.lastVisitStatus = visit.status;
        }
      }
    });

    let patients = Array.from(patientMap.values());

    // Фильтруем по поиску
    if (search) {
      const searchLower = search.toLowerCase();
      patients = patients.filter(p =>
        p.patientName.toLowerCase().includes(searchLower) ||
        p.patientPhone.includes(search) ||
        (p.patientEmail && p.patientEmail.toLowerCase().includes(searchLower))
      );
    }

    // Сортируем по дате последнего визита (новые первыми)
    patients.sort((a, b) => b.lastVisitDate.getTime() - a.lastVisitDate.getTime());

    return patients;
  }, [visitsData, search]);

  const formatAmount = (amount: number) => {
    if (!amount || amount === 0) return '-';
    return `${amount.toLocaleString('ru-RU')} ֏`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-main-10 text-main-100 border-main-100/20',
      completed: 'bg-secondary-10 text-secondary-100 border-secondary-100/20',
      cancelled: 'bg-bg-primary text-text-10 border-stroke',
    };
    const labels = {
      pending: 'Ожидает',
      confirmed: 'Подтвержден',
      completed: 'Завершен',
      cancelled: 'Отменен',
    };
    return (
      <span className={`px-2 py-1 border rounded-sm text-xs font-normal ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handlePatientClick = (patient: UniquePatient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const displayedPatients = expanded ? uniquePatients : uniquePatients.slice(0, 5);

  return (
    <Card padding="lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-50">
              Пациенты клиники
            </h3>
            <p className="text-xs text-text-10 mt-1">
              Пациенты, которые были на приёме в вашей клинике
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-text-10 hover:text-text-50 transition-colors"
          >
            {expanded ? '▼' : '▶'}
          </button>
        </div>

        {/* Search */}
        {expanded && (
          <Input
            placeholder="Поиск по имени, телефону, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<img src={searchIcon} alt="Search" className="w-4 h-4" />}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <Spinner />
            <p className="text-sm text-text-10 mt-2">Загрузка пациентов...</p>
          </div>
        )}

        {/* Patients List */}
        {!isLoading && (
          <>
            {uniquePatients.length === 0 ? (
              <div className="text-center py-8 text-text-10">
                <p className="text-sm">Нет пациентов с записями</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedPatients.map((patient) => (
                  <div
                    key={patient.patientId || `${patient.patientName}_${patient.patientPhone}`}
                    className="flex items-center justify-between p-3 border border-stroke rounded-lg hover:border-main-100 hover:bg-main-10 transition-all cursor-pointer"
                    onClick={() => handlePatientClick(patient)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-secondary-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-secondary-100">
                          {patient.patientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-50 truncate">
                          {patient.patientName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-text-10">
                          <span>{patient.patientPhone}</span>
                          {patient.patientEmail && (
                            <>
                              <span>•</span>
                              <span className="truncate">{patient.patientEmail}</span>
                            </>
                          )}
                        </div>
                        {expanded && (
                          <div className="flex items-center gap-3 mt-1 text-xs text-text-10">
                            <span>Визитов: {patient.visitCount}</span>
                            {patient.totalAmount > 0 && (
                              <>
                                <span>•</span>
                                <span>Сумма: {formatAmount(patient.totalAmount)}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>Последний визит: {formatAppointmentDateTime(patient.lastVisitDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {expanded && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(patient.lastVisitStatus)}
                      </div>
                    )}
                  </div>
                ))}

                {/* Show more button */}
                {!expanded && uniquePatients.length > 5 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setExpanded(true)}
                    className="w-full"
                  >
                    Показать всех ({uniquePatients.length})
                  </Button>
                )}

                {/* Navigate to full patients page */}
                <div className="pt-2 border-t border-stroke">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/dashboard/patients')}
                    className="w-full"
                  >
                    Перейти к полному списку пациентов →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Модальное окно с историей лечения пациента */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPatient(null);
        }}
        title={selectedPatient ? `История лечения: ${selectedPatient.patientName}` : 'История лечения'}
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Информация о пациенте */}
            <div className="bg-bg-primary p-4 rounded-lg border border-stroke">
              <h4 className="text-sm font-semibold text-text-50 mb-3">Информация о пациенте</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-text-10">Имя:</span>
                  <span className="ml-2 text-text-50 font-medium">{selectedPatient.patientName}</span>
                </div>
                <div>
                  <span className="text-text-10">Телефон:</span>
                  <span className="ml-2 text-text-50 font-medium">{selectedPatient.patientPhone}</span>
                </div>
                {selectedPatient.patientEmail && (
                  <div>
                    <span className="text-text-10">Email:</span>
                    <span className="ml-2 text-text-50 font-medium">{selectedPatient.patientEmail}</span>
                  </div>
                )}
                <div>
                  <span className="text-text-10">Всего визитов:</span>
                  <span className="ml-2 text-text-50 font-medium">{selectedPatient.visitCount}</span>
                </div>
                {selectedPatient.totalAmount > 0 && (
                  <div>
                    <span className="text-text-10">Общая сумма:</span>
                    <span className="ml-2 text-text-50 font-medium">{formatAmount(selectedPatient.totalAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* История визитов */}
            <div>
              <h4 className="text-sm font-semibold text-text-50 mb-3">История визитов</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedPatient.visits
                  .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                  .map((visit) => (
                    <div
                      key={visit.appointmentId || visit.id}
                      className="p-4 border border-stroke rounded-lg bg-bg-white hover:border-main-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-text-50">
                              {formatAppointmentDateTime(visit.appointmentDate)}
                            </span>
                            {getStatusBadge(visit.status)}
                          </div>
                          {visit.doctorName && (
                            <div className="text-xs text-text-10 mt-1">
                              <span className="font-medium">Врач:</span>{' '}
                              <span className="text-text-50">
                                {visit.doctorName}
                                {visit.doctorSpecialization && ` (${visit.doctorSpecialization})`}
                              </span>
                            </div>
                          )}
                          {visit.reason && (
                            <div className="text-xs text-text-10 mt-1">
                              <span className="font-medium">Причина:</span>{' '}
                              <span className="text-text-50">{visit.reason}</span>
                            </div>
                          )}
                          {visit.notes && (
                            <div className="text-xs text-text-10 mt-1">
                              <span className="font-medium">Заметки:</span>{' '}
                              <span className="text-text-50">{visit.notes}</span>
                            </div>
                          )}
                          {visit.amount && visit.amount > 0 && (
                            <div className="text-xs text-text-10 mt-1">
                              <span className="font-medium">Сумма:</span>{' '}
                              <span className="text-text-50 font-medium">{formatAmount(visit.amount)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Кнопка перехода к полному списку */}
            <div className="pt-4 border-t border-stroke">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false);
                  navigate('/dashboard/patients');
                }}
                className="w-full"
              >
                Перейти к полному списку пациентов →
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

