import React, { useState, useEffect } from 'react';
import hippocratesLogo from '../../assets/icons/hippocrates-logo.png';

/**
 * HippocratesClockCompact Component
 * Компактная версия часов для header
 * Отображается на всех страницах сайта
 */
export const HippocratesClockCompact: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Обновляем каждые 100мс для плавного движения секундной стрелки
    const timer = setInterval(() => {
      setTime(new Date());
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const milliseconds = time.getMilliseconds();

  // Углы для стрелок (0° = 12 часов, по часовой стрелке)
  const hourAngle = (hours % 12) * 30 + minutes * 0.5; // 30° на час, 0.5° на минуту
  const minuteAngle = minutes * 6 + seconds * 0.1; // 6° на минуту, 0.1° на секунду
  // Плавное движение секундной стрелки с учетом миллисекунд
  const secondAngle = (seconds + milliseconds / 1000) * 6; // 6° на секунду + плавное движение

  // Форматирование времени в 24-часовом формате
  const formatTime24 = () => {
    const h = hours;
    const m = minutes;
    
    const hoursStr = h < 10 ? `0${h}` : `${h}`;
    const minutesStr = m < 10 ? `0${m}` : `${m}`;
    return `${hoursStr}:${minutesStr}`;
  };
  
  const formattedTime = formatTime24();

  // Форматирование даты
  const formattedDate = time.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Размеры для компактной версии
  const clockSize = 32; // половина от w-16 (64px)
  const radius = 26; // немного уменьшен для размещения цифр

  // Цифры на циферблате (12, 3, 6, 9)
  const hourNumbers = [12, 3, 6, 9];

  return (
    <div className="flex items-center gap-3">
      {/* Компактный циферблат */}
      <div className="relative w-16 h-16 flex-shrink-0">
        {/* Внешний круг */}
        <div className="absolute inset-0 rounded-full border-2 border-main-100/20 bg-main-10/30"></div>
        
        {/* Цифры на циферблате */}
        {hourNumbers.map((num) => {
          const angle = (num * 30 - 90) * (Math.PI / 180);
          const x = clockSize + (radius - 3) * Math.cos(angle);
          const y = clockSize + (radius - 3) * Math.sin(angle);
          
          return (
            <div
              key={num}
              className="absolute text-[9px] font-bold text-main-100 leading-none"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                textShadow: '0 0 2px rgba(255, 255, 255, 0.8)',
              }}
            >
              {num}
            </div>
          );
        })}
        
        {/* Центральный круг с логотипом */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-bg-white border border-main-100/30 flex items-center justify-center shadow-sm">
            <img 
              src={hippocratesLogo} 
              alt="Hippocrates Logo" 
              className="w-8 h-4 object-contain"
            />
          </div>
        </div>
        
        {/* Часовая стрелка */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom"
          style={{
            transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
            width: '2px',
            height: '18px',
            background: '#4F46E5',
            borderRadius: '1px',
            transformOrigin: 'bottom center',
          }}
        />
        
        {/* Минутная стрелка */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom"
          style={{
            transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
            width: '1.5px',
            height: '24px',
            background: '#6366F1',
            borderRadius: '1px',
            transformOrigin: 'bottom center',
          }}
        />
        
        {/* Секундная стрелка - плавное движение */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom"
          style={{
            transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
            width: '1px',
            height: '28px',
            background: '#EF4444',
            borderRadius: '0.5px',
            transformOrigin: 'bottom center',
            transition: 'transform 0.1s linear',
          }}
        />
        
        {/* Центральная точка */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-main-100 rounded-full transform -translate-x-1/2 -translate-y-1/2 border border-bg-white"></div>
      </div>
      
      {/* Цифровое время и дата */}
      <div className="hidden sm:block">
        <div className="text-sm font-semibold text-text-100 mb-0.5">
          {formattedTime}
        </div>
        <div className="text-xs text-text-50 capitalize">
          {formattedDate}
        </div>
      </div>
    </div>
  );
};





