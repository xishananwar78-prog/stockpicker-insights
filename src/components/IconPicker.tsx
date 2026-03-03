import { 
  ExternalLink, Globe, MessageCircle, Youtube, Send, 
  Instagram, Twitter, Phone, Mail, Bookmark, Star, Heart 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = [
  { name: 'link', icon: ExternalLink },
  { name: 'globe', icon: Globe },
  { name: 'message', icon: MessageCircle },
  { name: 'youtube', icon: Youtube },
  { name: 'send', icon: Send },
  { name: 'instagram', icon: Instagram },
  { name: 'twitter', icon: Twitter },
  { name: 'phone', icon: Phone },
  { name: 'mail', icon: Mail },
  { name: 'bookmark', icon: Bookmark },
  { name: 'star', icon: Star },
  { name: 'heart', icon: Heart },
];

export function getIconComponent(name: string) {
  return ICONS.find(i => i.name === name)?.icon || ExternalLink;
}

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ICONS.map(({ name, icon: Icon }) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          className={cn(
            'h-9 w-9 flex items-center justify-center rounded-lg border transition-all',
            value === name
              ? 'border-primary bg-primary/20 text-primary'
              : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
