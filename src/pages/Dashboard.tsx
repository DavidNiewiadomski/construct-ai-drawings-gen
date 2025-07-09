import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { Building2, LogOut, Plus, FolderOpen, Users, Settings } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AI Backing Drawings</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Welcome, {user?.full_name}
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your construction drawing projects with AI-powered backing generation.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Project</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Create</div>
              <p className="text-xs text-muted-foreground">
                Start a new construction project
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active projects
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Collaborators
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Profile</div>
              <p className="text-xs text-muted-foreground">
                Manage your account
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your latest construction drawing projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects yet. Create your first project to get started!</p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {user?.full_name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user?.email}
              </div>
              <div>
                <span className="font-medium">Company:</span> {user?.company_name}
              </div>
              <div>
                <span className="font-medium">Role:</span> 
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {user?.role}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Create your first project
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-muted rounded-full mr-3"></div>
                  Upload contract drawings
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-muted rounded-full mr-3"></div>
                  Generate AI backing drawings
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-muted rounded-full mr-3"></div>
                  Review and approve results
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}