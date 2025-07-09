import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from '@/stores/authStore';
import { Building2, Zap, Shield, Users, ArrowRight } from 'lucide-react';

const Index = () => {
  const { session } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Building2 className="h-12 w-12 text-primary" />
              <span className="text-3xl font-bold">AI Backing Drawings</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Revolutionize Construction Drawing Generation
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your contract drawings into professional backing drawings using advanced AI technology. 
              Streamline your workflow and deliver projects faster than ever before.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose AI Backing Drawings?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for construction professionals who demand precision and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">AI-Powered Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Advanced machine learning algorithms analyze your contract drawings and automatically generate accurate backing drawings with industry-standard conventions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">Quality Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Built-in validation and review processes ensure your drawings meet industry standards and regulatory requirements before final delivery.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Seamless collaboration tools allow your entire team to work together on projects with role-based access control and real-time updates.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of construction professionals who are already using AI to streamline their drawing processes.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link to="/register">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">AI Backing Drawings</span>
          </div>
          <p className="text-center text-muted-foreground">
            © 2024 AI Backing Drawings. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
