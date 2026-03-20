import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg
          text-gray-900 dark:text-gray-100
          border-gray-300 dark:border-gray-600
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:shadow-sm
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          ${disabled 
            ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' 
            : 'bg-white dark:bg-gray-800 cursor-text hover:border-gray-400 dark:hover:border-gray-500'}
          ${error ? 'border-red-500 dark:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

