import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LockedOverlayProps {
  message?: string;
  className?: string;
}

export function LockedOverlay({ message = "This pick is for subscribers only", className = "" }: LockedOverlayProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 cursor-pointer ${className}`}
      onClick={() => navigate('/subscribe')}
    >
      <div className="bg-background/60 backdrop-blur-sm rounded-2xl px-6 py-4 flex flex-col items-center gap-2 border border-primary/20 shadow-lg shadow-primary/5">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground text-center">{message}</p>
        <span className="text-xs text-primary font-medium">Tap to unlock →</span>
      </div>
    </div>
  );
}
