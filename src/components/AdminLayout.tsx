import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  FileText,
  GraduationCap,
  MessageCircle,
  Menu,
  LogOut,
  Lock,
  User,
  Users,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthContext } from '@/components/AuthContext';
import { useCustomMenuItems } from '@/hooks/useCustomMenuItems';
import { getIconComponent } from '@/components/IconPicker';
import { ManageMenuDialog } from '@/components/ManageMenuDialog';
import { ManagePopupDialog } from '@/components/ManagePopupDialog';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/intraday', label: 'Intraday', icon: Zap },
  { href: '/intraday-report', label: 'Daily Report', icon: FileText },
  { href: '/swing', label: 'Swing', icon: TrendingUp },
  { href: '/blog', label: 'Blog', icon: FileText },
  { href: '/learning', label: 'Learning', icon: GraduationCap },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/breakout', label: 'Breakout', icon: BarChart3, disabled: true },
];

function NavItem({ 
  href, 
  label, 
  icon: Icon, 
  isActive, 
  disabled,
  onClick,
  isExternal,
}: { 
  href: string; 
  label: string; 
  icon: typeof LayoutDashboard; 
  isActive: boolean;
  disabled?: boolean;
  onClick?: () => void;
  isExternal?: boolean;
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

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
        <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
      </a>
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
        {navItems.filter(i => !i.disabled).slice(0, 6).map((item) => {
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

function CustomMenuItems({ onClick }: { onClick?: () => void }) {
  const { data: customItems = [] } = useCustomMenuItems();
  
  if (customItems.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="px-4 text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-1">Links</p>
      {customItems.map((item) => {
        const isExternal = item.url.startsWith('http');
        const IconComp = getIconComponent(item.icon);
        return (
          <NavItem
            key={item.id}
            href={item.url}
            label={item.label}
            icon={IconComp}
            isActive={false}
            onClick={onClick}
            isExternal={isExternal}
          />
        );
      })}
    </div>
  );
}

function SidebarComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuthContext();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-sidebar-border">
        <Logo />
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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

        <div className="pt-3">
          <CustomMenuItems />
        </div>

        {isAdmin && (
          <div className="pt-2 space-y-1">
            <NavItem
              href="/admin/subscribers"
              label="Subscribers"
              icon={Users}
              isActive={location.pathname === '/admin/subscribers'}
            />
            <ManageMenuDialog />
            <ManagePopupDialog />
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2 bg-accent/50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {isAdmin && (
                  <span className="text-[10px] text-primary font-medium uppercase">Admin</span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="w-full justify-start"
          >
            <Lock className="h-4 w-4 mr-2" />
            Login
          </Button>
        )}
        
        <div className="bg-gradient-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-2">
            {isAdmin ? 'Admin Panel' : 'stockPICKER'}
          </p>
          <p className="text-sm font-medium text-foreground">v1.0</p>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuthContext();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      setIsOpen(false);
      navigate('/');
    }
  };

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
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
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

              <div className="pt-3">
                <CustomMenuItems onClick={() => setIsOpen(false)} />
              </div>

              {isAdmin && (
                <div className="pt-2 space-y-1">
                  <NavItem
                    href="/admin/subscribers"
                    label="Subscribers"
                    icon={Users}
                    isActive={location.pathname === '/admin/subscribers'}
                    onClick={() => setIsOpen(false)}
                  />
                  <ManageMenuDialog />
                  <ManagePopupDialog />
                </div>
              )}
            </nav>
            
            <div className="p-4 border-t border-sidebar-border space-y-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 bg-accent/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="text-[10px] text-primary font-medium uppercase">Admin</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => { setIsOpen(false); navigate('/admin'); }}
                  className="w-full justify-start"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarComponent />
      <MobileHeader />
      
      <main className="md:ml-64 min-h-screen pt-16 pb-20 md:pt-0 md:pb-0">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}
