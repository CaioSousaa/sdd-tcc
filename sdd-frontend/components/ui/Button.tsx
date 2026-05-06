'use client';

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export default function Button({ isLoading, children, ...props }: ButtonProps) {
  return (
    <button
      disabled={isLoading || props.disabled}
      className="w-full rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      {...props}
    >
      {isLoading ? 'Aguarde...' : children}
    </button>
  );
}
