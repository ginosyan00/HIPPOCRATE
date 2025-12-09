import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  dropdownId?: string;
}

/**
 * StatusDropdown Component
 * Dropdown меню для выбора статуса приёма
 * Использует fixed positioning для корректного отображения поверх таблиц
 */
export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  isLoading = false,
  disabled = false,
  isOpen: controlledIsOpen,
  onToggle,
  dropdownId,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  
  // Используем контролируемое состояние, если оно предоставлено, иначе внутреннее
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (value: boolean) => {
    if (onToggle) {
      onToggle(value);
    } else {
      setInternalIsOpen(value);
    }
  };

  // Вычисляем позицию dropdown относительно кнопки
  useEffect(() => {
    if (!isOpen || !buttonRef.current) {
      setDropdownPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      setDropdownPosition({
        top: rect.bottom + scrollTop + 4, // 4px отступ
        left: rect.left + scrollLeft,
        width: rect.width,
      });
    };

    updatePosition();

    // Обновляем позицию при скролле или изменении размера окна
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Закрываем dropdown при клике вне его
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    // Небольшая задержка, чтобы не закрыть сразу после открытия
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Закрываем dropdown при нажатии Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const statusOptions = [
    { value: 'pending', label: 'Ожидает', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', indicatorColor: 'bg-yellow-500' },
    { value: 'confirmed', label: 'Подтвержден', color: 'bg-main-10 text-main-100 border-main-100/20', indicatorColor: 'bg-main-100' },
    { value: 'completed', label: 'Завершен', color: 'bg-secondary-10 text-secondary-100 border-secondary-100/20', indicatorColor: 'bg-green-500' },
    { value: 'cancelled', label: 'Отменен', color: 'bg-bg-primary text-text-10 border-stroke', indicatorColor: 'bg-gray-400' },
  ];

  const currentStatusOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];

  const handleStatusSelect = (status: string) => {
    if (status !== currentStatus) {
      onStatusChange(status);
    }
    setIsOpen(false);
  };

  const dropdownMenu = isOpen && !disabled && !isLoading && dropdownPosition && (
    <div 
      ref={dropdownRef}
      className="fixed z-[9999] bg-bg-white border border-stroke rounded-sm shadow-xl py-1 animate-dropdown-in"
      style={{ 
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        transformOrigin: 'top',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {statusOptions.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleStatusSelect(option.value)}
          className={`
            w-full text-left px-3 py-2 text-xs font-normal transition-smooth
            flex items-center justify-between
            animate-dropdown-item-in
            ${option.value === currentStatus 
              ? 'bg-bg-primary text-text-100' 
              : 'text-text-50 hover:bg-bg-primary hover:text-text-100'
            }
          `}
          style={{
            animationDelay: `${index * 0.03}s`,
            animationFillMode: 'both',
          }}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${option.indicatorColor}`}></span>
            {option.label}
          </span>
          {option.value === currentStatus && (
            <Check className="w-3.5 h-3.5 text-main-100" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
          disabled={disabled || isLoading}
          className={`
            flex items-center justify-between gap-2 px-3 py-1.5 border rounded-sm text-xs font-normal
            transition-all min-w-[140px]
            ${currentStatusOption.color}
            ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
          `}
        >
          <span>{currentStatusOption.label}</span>
          <ChevronDown 
            className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </button>
      </div>

      {/* Рендерим dropdown через Portal для корректного отображения поверх таблиц */}
      {typeof document !== 'undefined' && dropdownMenu && createPortal(dropdownMenu, document.body)}
    </>
  );
};

