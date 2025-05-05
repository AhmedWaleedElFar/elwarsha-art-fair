'use client';

import LoadingSpinner from './LoadingSpinner';

export default function LoadingButton({ 
  children, 
  isLoading = false, 
  disabled = false, 
  className = '', 
  type = 'button',
  onClick,
  ...props 
}) {
  return (
    <button
      type={type}
      className={`relative ${className} ${isLoading ? 'cursor-wait' : ''} w-full sm:w-auto min-h-[44px]`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <span className="mr-2">
            <LoadingSpinner size="small" color="currentColor" />
          </span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
