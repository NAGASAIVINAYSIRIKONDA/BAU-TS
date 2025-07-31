
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    
    try {
      // Use Supabase auth to send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Failed to send reset link",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto card-elevated">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
          <CardDescription className="text-muted-foreground">
            We've sent password reset instructions to your email address.
          </CardDescription>
        </CardHeader>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="primary"
            className="w-full h-12"
            onClick={onBackToLogin}
          >
            Back to sign in
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => setIsSuccess(false)}>
              try again
            </Button>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto card-elevated">
      <CardHeader className="space-y-2">
        <Button
          variant="ghost"
          className="w-fit p-0 h-auto mb-4 text-muted-foreground hover:text-foreground"
          onClick={onBackToLogin}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Button>
        <CardTitle className="text-2xl font-semibold">Forgot password?</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="h-11 focus-ring"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
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
                <span>Sending reset link...</span>
              </div>
            ) : (
              "Send reset link"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
