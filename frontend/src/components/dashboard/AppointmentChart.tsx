import React from 'react';

/**
 * AppointmentChart Component - Figma Design
 * График записей с визуализацией линий
 */
export const AppointmentChart: React.FC = () => {
  // Mock data for demonstration
  const data = [
    { month: 'Jan', value: 120 },
    { month: 'Feb', value: 90 },
    { month: 'Mar', value: 150 },
    { month: 'Apr', value: 100 },
    { month: 'May', value: 180 },
    { month: 'Jun', value: 130 },
  ];

  const maxValue = 200;
  const chartHeight = 156; // Height in pixels
  const chartWidth = 653; // Width from Figma (will be responsive)

  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - (item.value / maxValue) * chartHeight;
    return { x, y, value: item.value };
  });

  // Generate SVG path
  const linePath = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x},${point.y}`;
      // Use smooth curves
      const prevPoint = points[index - 1];
      const midX = (prevPoint.x + point.x) / 2;
      return `Q ${midX},${prevPoint.y} ${midX},${(prevPoint.y + point.y) / 2} Q ${midX},${point.y} ${point.x},${point.y}`;
    })
    .join(' ');

  // Generate area path (filled gradient)
  const areaPath = `${linePath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  return (
    <div className="bg-bg-white border border-stroke rounded-lg p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-text-50">Appointment</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-normal text-text-50">Sort by</span>
          <div className="relative">
            <select className="text-xs border border-stroke rounded-sm px-3 py-2 pr-8 bg-bg-white text-text-50 focus:outline-none focus:border-main-100 appearance-none">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Daily</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative" style={{ height: `${chartHeight + 50}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-text-10 pr-3">
          <span>200</span>
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>

        {/* Chart SVG */}
        <svg
          className="ml-8"
          width={chartWidth}
          height={chartHeight}
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3].map(i => (
            <line
              key={i}
              x1="0"
              y1={(chartHeight / 3) * i}
              x2={chartWidth}
              y2={(chartHeight / 3) * i}
              stroke="#F1F1F1"
              strokeWidth="1"
            />
          ))}

          {/* Gradient for area fill */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3A6FF8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3A6FF8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3A6FF8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              {/* Point circle */}
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#3A6FF8"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>

        {/* X-axis labels (months) */}
        <div className="flex justify-between mt-3 ml-8" style={{ width: `${chartWidth}px` }}>
          {data.map((item, index) => (
            <span key={index} className="text-xs text-text-10">
              {item.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

