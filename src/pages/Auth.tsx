import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Shield, Mail, Lock } from "lucide-react";
import { passwordSchema, emailSchema, sanitizeEmail } from "@/lib/validation";
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimiter";
import { logger } from "@/services/loggingService";
import { errorService } from "@/services/errorService";
import { ROUTES } from "@/config/constants";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(ROUTES.HOME);
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      // Use our stronger validation schemas
      emailSchema.parse(email);

      // Only validate password strength for signup
      if (!isLogin) {
        passwordSchema.parse(password);
      }

      setErrors({});
      return true;
    } catch (error) {
      const fieldErrors: { email?: string; password?: string } = {};

      if (error && typeof error === "object" && "errors" in error) {
        const zodErrors = (
          error as { errors: Array<{ path: string[]; message: string }> }
        ).errors;
        zodErrors.forEach((err) => {
          const field = err.path[0];
          if (field === "email" || field === "password") {
            fieldErrors[field as "email" | "password"] = err.message;
          }
        });
      }

      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Rate limiting
    const rateLimitKey = isLogin ? "login" : "register";
    const rateLimit = isLogin ? RATE_LIMITS.LOGIN : RATE_LIMITS.REGISTER;

    if (!rateLimiter.checkLimit(rateLimitKey, rateLimit)) {
      const timeLeft = rateLimiter.getTimeUntilReset(rateLimitKey);
      toast.error(
        `Too many attempts. Please try again in ${timeLeft} seconds.`,
      );
      logger.warn(`${isLogin ? "Login" : "Registration"} rate limited`, {
        email,
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(sanitizeEmail(email), password);
        if (error) {
          throw error;
        }

        logger.info("User logged in via Auth page", { email });
        toast.success("Welcome back!");
        rateLimiter.reset("login");
        navigate(ROUTES.HOME);
      } else {
        const { error } = await signUp(sanitizeEmail(email), password);
        if (error) {
          throw error;
        }

        logger.info("User registered via Auth page", { email });
        toast.success("Account created! Check your email to verify.");
        setIsLogin(true);
      }
    } catch (error) {
      errorService.handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setPassword(""); // Clear password when switching modes
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-white/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-orange-500/20">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-white/60">
            {isLogin
              ? "Sign in to access AI Therapy services"
              : "Sign up to start your wellness journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder={
                    isLogin
                      ? "••••••••"
                      : "Min 12 chars, mixed case, numbers, symbols"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  required
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password}</p>
              )}
              {!isLogin && (
                <p className="text-white/50 text-xs">
                  Password must be at least 12 characters with uppercase,
                  lowercase, numbers, and special characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-orange-500 hover:shadow-glow"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
