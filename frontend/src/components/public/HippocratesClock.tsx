import React, { useState, useEffect } from 'react';
import hippocratesLogo from '../../assets/icons/hippocrates-logo.png';

/**
 * HippocratesClock Component
 * Красивый анимированный часовой элемент с логотипом Hippocrates в центре
 */
export const HippocratesClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Check screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Углы для стрелок (0° = 12 часов, по часовой стрелке)
  const hourAngle = (hours % 12) * 30 + minutes * 0.5; // 30° на час, 0.5° на минуту
  const minuteAngle = minutes * 6 + seconds * 0.1; // 6° на минуту, 0.1° на секунду
  const secondAngle = seconds * 6; // 6° на секунду

  // Форматирование времени
  const formattedTime = time.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = time.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Размеры для расчета позиций меток (уменьшены)
  const clockSize = isMobile ? 64 : 72; // половина от w-32 (64px) или w-36 (72px)
  const radius = isMobile ? 58 : 66;

  return (
    <div className="bg-bg-white/80 backdrop-blur-sm border border-stroke rounded-lg p-3 md:p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col items-center">
        {/* Заголовок */}
        <h3 className="text-sm md:text-base font-medium text-text-50 mb-2 md:mb-3">Текущее время</h3>
        
        {/* Циферблат - уменьшенный размер */}
        <div className="relative w-32 h-32 md:w-36 md:h-36 mb-2 md:mb-3">
          {/* Внешний круг */}
          <div className="absolute inset-0 rounded-full border-4 border-main-100/20 bg-main-10/30"></div>
          
          {/* Метки часов */}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => {
            const angle = (hour * 30 - 90) * (Math.PI / 180);
            const x = clockSize + radius * Math.cos(angle);
            const y = clockSize + radius * Math.sin(angle);
            
            return (
              <div
                key={hour}
                className="absolute w-1 h-1 bg-main-100 rounded-full"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}
          
          {/* Центральный круг с логотипом */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-bg-white border-2 border-main-100/30 flex items-center justify-center shadow-lg">
              <img 
                src={hippocratesLogo} 
                alt="Hippocrates Logo" 
                className="w-12 h-7 md:w-16 h-9 object-contain"
              />
            </div>
          </div>
          
          {/* Часовая стрелка */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
              width: '2.5px',
              height: isMobile ? '40px' : '45px',
              background: 'linear-gradient(to top, #4F46E5, #7C3AED)',
              borderRadius: '2px',
              transformOrigin: 'bottom center',
            }}
          />
          
          {/* Минутная стрелка */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
              width: '2px',
              height: isMobile ? '52px' : '58px',
              background: 'linear-gradient(to top, #6366F1, #8B5CF6)',
              borderRadius: '2px',
              transformOrigin: 'bottom center',
            }}
          />
          
          {/* Секундная стрелка */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
              width: '1px',
              height: isMobile ? '60px' : '66px',
              background: '#EF4444',
              borderRadius: '0.5px',
              transformOrigin: 'bottom center',
            }}
          />
          
          {/* Центральная точка */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-main-100 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-bg-white"></div>
        </div>
        
        {/* Цифровое время */}
        <div className="text-center">
          <div className="text-lg md:text-xl font-semibold text-main-100 mb-1">
            {formattedTime}
          </div>
          <div className="text-[10px] md:text-xs text-text-10 capitalize">
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};




