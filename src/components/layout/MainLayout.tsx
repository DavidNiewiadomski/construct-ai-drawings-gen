import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Bell, 
  User, 
  Menu, 
  X, 
  Home, 
  FolderOpen, 
  Upload, 
  Users, 
  Settings, 
  BarChart3,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Upload Files', href: '/upload', icon: Upload },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/dashboard" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold hidden sm:block">AI Backing Drawings</span>
            </Link>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, files..."
                className="pl-10 construction-input"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.full_name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`
          fixed left-0 top-16 bottom-0 z-40 bg-card border-r border-border transition-all duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64
        `}>
          <div className="p-4 h-full overflow-y-auto">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={`
          flex-1 transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        `}>
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}