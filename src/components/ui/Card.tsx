import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-200 bg-white ${hover ? 'transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-0.5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
