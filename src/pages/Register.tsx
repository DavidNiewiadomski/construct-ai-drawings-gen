import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { RegisterData } from '@/types';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'engineer', 'reviewer', 'viewer'], {
    required_error: 'Please select a role',
  }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms of service',
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, loading, session } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const agreeToTerms = watch('agreeToTerms');

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    const registerData: RegisterData = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      company_name: data.company_name,
      role: data.role,
    };

    const { error } = await signUp(registerData);
    
    if (error) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Registration Successful!',
        description: 'Please check your email to verify your account before signing in.',
      });
      navigate('/login');
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Company Branding */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full construction-gradient">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Backing Drawings</h1>
            <p className="text-slate-400 mt-2">
              Join the future of construction drawing automation
            </p>
          </div>
        </div>

        <Card className="construction-card bg-slate-800/50 border-slate-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Start your free trial today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-slate-200">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="Enter your full name"
                    className="construction-input bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    {...register('full_name')}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-400">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-slate-200">Company Name</Label>
                  <Input
                    id="company_name"
                    placeholder="Enter your company name"
                    className="construction-input bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    {...register('company_name')}
                  />
                  {errors.company_name && (
                    <p className="text-sm text-red-400">{errors.company_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="construction-input bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      className="construction-input bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                      {...register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-200">Role</Label>
                  <Select onValueChange={(value) => setValue('role', value as any)}>
                    <SelectTrigger className="construction-input bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select your role" className="text-slate-400" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="admin" className="text-white hover:bg-slate-700">
                        Admin - Full system access
                      </SelectItem>
                      <SelectItem value="engineer" className="text-white hover:bg-slate-700">
                        Engineer - Create and manage projects
                      </SelectItem>
                      <SelectItem value="reviewer" className="text-white hover:bg-slate-700">
                        Reviewer - Review and approve drawings
                      </SelectItem>
                      <SelectItem value="viewer" className="text-white hover:bg-slate-700">
                        Viewer - View projects and files
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-400">{errors.role.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setValue('agreeToTerms', !!checked)}
                    className="border-slate-600 mt-1"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-slate-300 cursor-pointer leading-5">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-400">{errors.agreeToTerms.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full construction-gradient text-white font-semibold"
                disabled={isLoading || loading || !agreeToTerms}
              >
                {isLoading || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-slate-400">Already have an account? </span>
                <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-500">
          <p>© 2024 AI Backing Drawings. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}