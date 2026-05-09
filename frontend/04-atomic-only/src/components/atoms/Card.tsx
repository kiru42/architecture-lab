interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-4 ${onClick ? 'cursor-pointer hover:shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
