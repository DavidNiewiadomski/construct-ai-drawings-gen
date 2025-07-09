import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { Plus, FolderOpen, Users, Settings, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Active Projects',
      value: '3',
      description: 'Currently in progress',
      icon: FolderOpen,
      trend: '+2 this month'
    },
    {
      title: 'Completed Drawings',
      value: '24',
      description: 'Successfully generated',
      icon: CheckCircle,
      trend: '+8 this week'
    },
    {
      title: 'Processing Time',
      value: '4.2 min',
      description: 'Average completion',
      icon: Clock,
      trend: '-1.2 min improved'
    },
    {
      title: 'Team Members',
      value: '1',
      description: 'Active collaborators',
      icon: Users,
      trend: 'Invite more'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Downtown Office Complex',
      status: 'processing',
      progress: 75,
      lastUpdated: '2 hours ago',
      filesCount: 12
    },
    {
      id: 2,
      name: 'Residential Tower Phase 2',
      status: 'review',
      progress: 100,
      lastUpdated: '1 day ago',
      filesCount: 8
    },
    {
      id: 3,
      name: 'Industrial Warehouse',
      status: 'completed',
      progress: 100,
      lastUpdated: '3 days ago',
      filesCount: 6
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'text-blue-500 bg-blue-50';
      case 'review':
        return 'text-orange-500 bg-orange-50';
      case 'completed':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'review':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FolderOpen className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your construction projects today.
            </p>
          </div>
          <Button className="construction-gradient text-white mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="construction-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">
                      {stat.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Projects */}
        <Card className="construction-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Projects</CardTitle>
                <CardDescription>
                  Your latest construction drawing projects
                </CardDescription>
              </div>
              <Button variant="outline">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.filesCount} files • Updated {project.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{project.progress}%</p>
                        <div className="w-20 h-2 bg-muted rounded-full mt-1">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first project to start generating AI-powered backing drawings.
                </p>
                <Button className="construction-gradient text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="construction-card hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full construction-gradient flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Start New Project</h3>
              <p className="text-sm text-muted-foreground">
                Upload contract drawings and generate backing drawings with AI
              </p>
            </CardContent>
          </Card>

          <Card className="construction-card hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Invite Team</h3>
              <p className="text-sm text-muted-foreground">
                Collaborate with engineers, reviewers, and other stakeholders
              </p>
            </CardContent>
          </Card>

          <Card className="construction-card hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Configure Settings</h3>
              <p className="text-sm text-muted-foreground">
                Customize drawing standards and AI processing preferences
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}