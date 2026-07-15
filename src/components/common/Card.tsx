import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padded = true,
  className = '',
  ...props
}) => {
  const baseStyle = 'bg-surface-base border border-border-base rounded-lg transition-all duration-150';
  const hoverStyle = hoverable 
    ? 'hover:bg-surface-hover hover:border-border-hover hover:shadow-sm' 
    : '';
  const paddingStyle = padded ? 'p-6' : '';

  return (
    <div
      className={`${baseStyle} ${hoverStyle} ${paddingStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
