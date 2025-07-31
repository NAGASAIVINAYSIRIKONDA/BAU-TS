import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Link } from "react-router-dom";

type AuthView = "login" | "forgot-password";

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [currentView, setCurrentView] = useState<AuthView>("login");

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentView === "login" && (
          <>
            <LoginForm
              onForgotPassword={() => setCurrentView("forgot-password")}
              onLoginSuccess={onLoginSuccess}
            />
            <div className="mt-4 text-center">
              <span>Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
            </div>
          </>
        )}
        
        {currentView === "forgot-password" && (
          <ForgotPasswordForm
            onBackToLogin={() => setCurrentView("login")}
          />
        )}
      </div>
    </div>
  );
}