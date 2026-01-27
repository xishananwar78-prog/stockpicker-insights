import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  FileText,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/intraday', label: 'Intraday', icon: Zap },
  { href: '/intraday-report', label: 'Daily Report', icon: FileText },
  { href: '/swing', label: 'Swing', icon: TrendingUp, disabled: true },
  { href: '/breakout', label: 'Breakout', icon: BarChart3, disabled: true },
];

function NavItem({ 
  href, 
  label, 
  icon: Icon, 
  isActive, 
  disabled,
  onClick 
}: { 
  href: string; 
  label: string; 
  icon: typeof LayoutDashboard; 
  isActive: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 text-muted-foreground/50 cursor-not-allowed">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">Soon</span>
      </div>
    );
  }

  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground shadow-glow-brand'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          if (item.disabled) {
            return (
              <div key={item.href} className="flex flex-col items-center gap-1 p-2 opacity-40">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className={cn('text-[10px]', isActive && 'text-primary font-medium')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-sidebar-border">
        <Logo />
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={location.pathname === item.href}
            disabled={item.disabled}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-gradient-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Admin Panel</p>
          <p className="text-sm font-medium text-foreground">stockPICKER v1.0</p>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <Logo size="sm" />
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-sidebar p-0">
            <div className="p-6 border-b border-sidebar-border">
              <Logo />
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={location.pathname === item.href}
                  disabled={item.disabled}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileHeader />
      
      <main className="md:ml-64 min-h-screen pt-16 pb-20 md:pt-0 md:pb-0">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}
