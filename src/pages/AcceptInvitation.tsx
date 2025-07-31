
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, AlertCircle } from "lucide-react";

const acceptInvitationSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AcceptInvitationForm = z.infer<typeof acceptInvitationSchema>;

export function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const form = useForm<AcceptInvitationForm>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid invitation link. Missing token or email.');
      setIsValidating(false);
      return;
    }

    validateInvitation();
  }, [token, email]);

  const validateInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('email', email)
        .eq('is_accepted', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        setError('This invitation link is invalid or has expired.');
        setIsValidating(false);
        return;
      }

      setInvitationData(data);
      setIsValidating(false);
    } catch (err) {
      console.error('Error validating invitation:', err);
      setError('Failed to validate invitation. Please try again.');
      setIsValidating(false);
    }
  };

  const onSubmit = async (formData: AcceptInvitationForm) => {
    if (!invitationData) return;

    setIsLoading(true);
    
    try {
      // Sign up the user with email and password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (signUpError) {
        // If user already exists, try to update their password instead
        if (signUpError.message.includes('already registered')) {
          // For existing users, we need to handle this differently
          // They should use the regular login flow
          throw new Error('An account with this email already exists. Please use the login page to access your account.');
        }
        throw signUpError;
      }

      if (signUpData.user) {
        // Mark invitation as accepted
        const { error: updateError } = await supabase
          .from('invitations')
          .update({
            is_accepted: true,
            accepted_at: new Date().toISOString()
          })
          .eq('token', token);

        if (updateError) {
          console.error('Error updating invitation:', updateError);
        }

        // Update user metadata with invitation info
        const { error: updateUserError } = await supabase.auth.updateUser({
          data: {
            first_name: invitationData.email.split('@')[0], // Default first name
            role: invitationData.role,
            invitation_accepted: true
          }
        });

        if (updateUserError) {
          console.error('Error updating user metadata:', updateUserError);
        }

        setIsSuccess(true);
        toast({
          title: "Account created successfully!",
          description: "You can now sign in with your new credentials.",
        });

        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Invitation acceptance error:', error);
      toast({
        title: "Failed to accept invitation",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto card-elevated">
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Validating invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto card-elevated">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-semibold">Invalid Invitation</CardTitle>
            <CardDescription className="text-muted-foreground">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="primary"
              className="w-full h-12"
              onClick={() => navigate('/')}
            >
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto card-elevated">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Account Created!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your account has been successfully created. You will be redirected to the login page shortly.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="primary"
              className="w-full h-12"
              onClick={() => navigate('/')}
            >
              Go to Login Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto card-elevated">
        <CardHeader className="space-y-2 text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-white rounded-md"></div>
          </div>
          <CardTitle className="text-2xl font-semibold">Accept Invitation</CardTitle>
          <CardDescription className="text-muted-foreground">
            Set up your password to complete your account creation for {invitationData?.email}
          </CardDescription>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="p-4 bg-primary-light/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">You're being invited as:</p>
              <p className="font-semibold">{invitationData?.role === 'Team_Lead' ? 'Team Lead' : invitationData?.role === 'Team_Member' ? 'Team Member' : invitationData?.role}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-11 focus-ring"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="h-11 focus-ring"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
