import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword, loading } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const { error } = await resetPassword(data.email);
    
    if (error) {
      toast({
        title: 'Reset Failed',
        description: error.message || 'An error occurred while sending reset email',
        variant: 'destructive',
      });
    } else {
      setEmailSent(true);
      toast({
        title: 'Reset Email Sent',
        description: 'Please check your email for password reset instructions.',
      });
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">AI Backing Drawings</span>
            </div>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                We've sent password reset instructions to {getValues('email')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </p>
              
              <Button asChild className="w-full">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AI Backing Drawings</span>
          </div>
          <p className="text-muted-foreground">
            Enter your email to receive password reset instructions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}