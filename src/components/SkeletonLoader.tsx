import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'rect' | 'circle' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  width, 
  height, 
  className = '' 
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
      return (
        <div 
          className={`${baseClasses} ${className}`}
          style={style}
        />
      );
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