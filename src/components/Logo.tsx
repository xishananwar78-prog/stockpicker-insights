import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="bg-gradient-brand rounded-lg p-1.5 shadow-glow-brand">
          <TrendingUp className={cn('text-primary-foreground', sizeClasses[size])} />
        </div>
      </div>
      {showText && (
        <div className={cn('font-bold tracking-tight', textSizeClasses[size])}>
          <span className="text-foreground">stock</span>
          <span className="text-gradient-brand">PICKER</span>
        </div>
      )}
    </div>
  );
}
