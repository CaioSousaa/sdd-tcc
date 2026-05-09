'use client';

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
}

const variantClasses = {
  primary: 'bg-amber-400 text-zinc-900 hover:bg-amber-300',
  ghost: 'bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export default function Button({ 
  isLoading, 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'w-full rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';
  const selectedVariant = variantClasses[variant];

  return (
    <button
      disabled={isLoading || props.disabled}
      className={`${baseClasses} ${selectedVariant} ${className}`}
      {...props}
    >
      {isLoading ? 'Aguarde...' : children}
    </button>
  );
}

