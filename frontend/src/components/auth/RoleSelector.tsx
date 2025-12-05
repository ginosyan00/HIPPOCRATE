import React from 'react';

/**
 * RoleSelector Component
 * Красивый выбор роли при регистрации
 * Следует Design Rules: минималистичный, плоский, современный
 */

export type UserRole = 'PATIENT' | 'CLINIC' | 'PARTNER';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
}

interface RoleCardData {
  role: UserRole;
  title: string;
  description: string;
  icon: string;
  color: string; // Accent color
}

const roles: RoleCardData[] = [
  {
    role: 'PATIENT',
    title: 'Пациент',
    description: 'Запись на прием, консультации, история лечения',
    icon: '👤',
    color: 'bg-blue-500',
  },
  {
    role: 'CLINIC',
    title: 'Клиника',
    description: 'Управление клиникой, врачами и пациентами',
    icon: '🏥',
    color: 'bg-green-500',
  },
  {
    role: 'PARTNER',
    title: 'Партнер',
    description: 'Аптеки, лаборатории, страховые компании',
    icon: '🏢',
    color: 'bg-purple-500',
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelectRole }) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-50 mb-2">Выберите тип аккаунта</h3>
        <p className="text-sm text-text-10">Выберите, как вы будете использовать платформу</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map(roleCard => (
          <button
            key={roleCard.role}
            type="button"
            onClick={() => onSelectRole(roleCard.role)}
            className={`
              relative p-6 rounded-xl border-2 transition-all duration-200
              hover:shadow-lg hover:scale-105
              ${
                selectedRole === roleCard.role
                  ? 'border-main-100 bg-main-100 bg-opacity-5 shadow-md'
                  : 'border-stroke bg-white hover:border-main-100 hover:border-opacity-50'
              }
            `}
          >
            {/* Checkmark для выбранной роли */}
            {selectedRole === roleCard.role && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-main-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Icon */}
            <div className="text-5xl mb-4 text-center">{roleCard.icon}</div>

            {/* Title */}
            <h4
              className={`text-base font-semibold mb-2 text-center ${
                selectedRole === roleCard.role ? 'text-main-100' : 'text-text-50'
              }`}
            >
              {roleCard.title}
            </h4>

            {/* Description */}
            <p className="text-xs text-text-10 text-center leading-relaxed">{roleCard.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

