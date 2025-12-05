import React from 'react';
import { Card } from '../common';

/**
 * DoctorProfile Component - Figma Design
 * Правая панель с профилем доктора и статистикой
 */
export const DoctorProfile: React.FC = () => {
  return (
    <div className="space-y-0">
      {/* Doctor Profile Section */}
      <div className="bg-bg-white border border-stroke rounded-t-lg p-6 pb-9">
        <div className="flex flex-col items-center">
          {/* Doctor Photo */}
          <div className="w-20 h-20 bg-main-10 rounded-lg mb-4"></div>
          
          {/* Doctor Name */}
          <h3 className="text-lg font-medium text-text-100 mb-8">
            Dr. Jean Y. Bocage
          </h3>

          {/* Statistics Row */}
          <div className="w-full flex items-center justify-between">
            {/* Appointment */}
            <div className="text-center">
              <p className="text-sm font-normal text-text-10 mb-1">Appointment</p>
              <p className="text-[21px] font-semibold text-text-100">4250</p>
            </div>

            {/* Divider */}
            <div className="w-px h-11 bg-stroke"></div>

            {/* Total Patients */}
            <div className="text-center">
              <p className="text-sm font-normal text-text-10 mb-1">Total Patients</p>
              <p className="text-[21px] font-semibold text-text-100">32.1k</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="border-t border-stroke"></div>

      {/* Patient Satisfaction Section */}
      <div className="bg-bg-white border-l border-r border-stroke p-6">
        <h3 className="text-lg font-medium text-text-50 mb-6">Patient Satisfaction</h3>
        
        {/* Chart Container */}
        <div className="flex items-center justify-center mb-4">
          {/* Circular Progress Chart */}
          <div className="relative w-40 h-40">
            {/* Background Circle */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="63"
                fill="none"
                stroke="#F5F6FF"
                strokeWidth="14"
              />
              {/* Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r="63"
                fill="none"
                stroke="#3A6FF8"
                strokeWidth="14"
                strokeDasharray={`${2 * Math.PI * 63 * 0.752} ${2 * Math.PI * 63}`}
                strokeLinecap="round"
              />
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[32px] font-semibold text-main-100">75.2%</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-2.5 bg-main-100 rounded-sm"></div>
            <span className="text-sm font-normal text-text-50">Excellent</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-2.5 bg-secondary-100 rounded-sm"></div>
            <span className="text-sm font-normal text-text-50">Good</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-2.5 bg-secondary-100 rounded-sm"></div>
            <span className="text-sm font-normal text-text-50">Poor</span>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="border-t border-stroke"></div>

      {/* Overall Performance Section */}
      <div className="bg-bg-white border border-stroke rounded-b-lg p-6">
        <h3 className="text-lg font-medium text-text-50 mb-6">Overall Performance</h3>
        
        {/* Chart Container */}
        <div className="flex items-center justify-center mb-4">
          {/* Circular Progress Chart */}
          <div className="relative w-40 h-40">
            {/* Background Circle */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="63"
                fill="none"
                stroke="#F5F6FF"
                strokeWidth="14"
              />
              {/* Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r="63"
                fill="none"
                stroke="#3A6FF8"
                strokeWidth="14"
                strokeDasharray={`${2 * Math.PI * 63 * 0.752} ${2 * Math.PI * 63}`}
                strokeLinecap="round"
              />
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[32px] font-semibold text-main-100">75.2%</span>
            </div>
          </div>
        </div>

        {/* Description Text */}
        <p className="text-sm font-normal text-text-10 text-center leading-relaxed">
          Dr. Jean Y. Bocage, you have rate average of 75.2% 😍
        </p>
      </div>
    </div>
  );
};





