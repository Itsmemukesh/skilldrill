import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium border';
  
  const variants = {
    neutral: 'bg-surface-base text-text-sec border-border-base',
    accent: 'bg-info-bg text-accent-base border-info-base',
    success: 'bg-success-bg text-success-base border-success-base',
    warning: 'bg-warning-bg text-warning-base border-warning-base',
    error: 'bg-error-bg text-error-base border-error-base',
    info: 'bg-info-bg text-info-base border-info-base',
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
export default Badge;
