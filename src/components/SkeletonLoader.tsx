import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'rect' | 'circle' | 'card' | 'list' | 'table' | 'form' | 'dashboard' | 'stats';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  width,
  height,
  className = '',
  lines = 3,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md';

  let style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  switch (type) {
    case 'circle':
      return (
        <div
          className={`${baseClasses} rounded-full ${className}`}
          style={{ ...style, width: width || '2rem', height: height || '2rem' }}
        />
      );

    case 'rect':
      return <div className={`${baseClasses} ${className}`} style={style} />;

    case 'card':
      return (
        <div className={`rounded-xl shadow ${className}`}>
          <div className={`${baseClasses} h-48 w-full`} />
          <div className="p-4 space-y-3">
            <div className={`${baseClasses} h-4 w-3/4`} />
            <div className={`${baseClasses} h-4 w-1/2`} />
            <div className={`${baseClasses} h-4 w-2/3`} />
          </div>
        </div>
      );

    case 'list':
      return (
        <div className={`space-y-3 ${className}`}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className={`${baseClasses} w-10 h-10 rounded-full`} />
              <div className="flex-1 space-y-2">
                <div className={`${baseClasses} h-4 w-3/4`} />
                <div className={`${baseClasses} h-3 w-1/2`} />
              </div>
              <div className={`${baseClasses} h-8 w-20 rounded`} />
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className={`space-y-3 ${className}`}>
          {/* Header */}
          <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`${baseClasses} h-4 w-1/4`} />
            <div className={`${baseClasses} h-4 w-1/4`} />
            <div className={`${baseClasses} h-4 w-1/4`} />
            <div className={`${baseClasses} h-4 w-1/6 ml-auto`} />
          </div>
          {/* Rows */}
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className={`${baseClasses} h-4 w-1/4`} />
              <div className={`${baseClasses} h-4 w-1/4`} />
              <div className={`${baseClasses} h-4 w-1/4`} />
              <div className={`${baseClasses} h-8 w-1/6 ml-auto rounded`} />
            </div>
          ))}
        </div>
      );

    case 'form':
      return (
        <div className={`space-y-4 ${className}`}>
          <div className="space-y-2">
            <div className={`${baseClasses} h-4 w-24`} />
            <div className={`${baseClasses} h-10 w-full`} />
          </div>
          <div className="space-y-2">
            <div className={`${baseClasses} h-4 w-32`} />
            <div className={`${baseClasses} h-10 w-full`} />
          </div>
          <div className="space-y-2">
            <div className={`${baseClasses} h-4 w-20`} />
            <div className={`${baseClasses} h-10 w-full`} />
          </div>
          <div className="flex gap-3 pt-4">
            <div className={`${baseClasses} h-10 w-24 rounded`} />
            <div className={`${baseClasses} h-10 w-24 rounded`} />
          </div>
        </div>
      );

    case 'dashboard':
      return (
        <div className={`space-y-6 ${className}`}>
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className={`${baseClasses} h-8 w-48`} />
            <div className={`${baseClasses} h-10 w-32`} />
          </div>
          {/* Summary cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className={`${baseClasses} h-3 w-20 mb-2`} />
                <div className={`${baseClasses} h-8 w-full`} />
                <div className={`${baseClasses} h-3 w-16 mt-2`} />
              </div>
            ))}
          </div>
          {/* Chart skeleton */}
          <div className={`${baseClasses} h-64 w-full rounded-xl`} />
          {/* List skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${baseClasses} h-16 w-full rounded-lg`} />
            ))}
          </div>
        </div>
      );

    case 'stats':
      return (
        <div className={`grid grid-cols-2 gap-4 ${className}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className={`${baseClasses} h-3 w-16 mb-2`} />
              <div className={`${baseClasses} h-6 w-full`} />
              <div className={`${baseClasses} h-3 w-12 mt-2`} />
            </div>
          ))}
        </div>
      );

    case 'text':
    default:
      return (
        <div
          className={`${baseClasses} h-4 ${className}`}
          style={style}
        />
      );
  }
};

export default SkeletonLoader;
