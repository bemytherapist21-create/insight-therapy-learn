import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/safeClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/services/loggingService";
import { sanitizeEmail } from "@/lib/validation";
import { ROUTES, SUCCESS_MESSAGES } from "@/config/constants";

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                sanitizeEmail(email),
                {
                    redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
                }
            );

            if (error) throw error;

            logger.info("Password reset email sent", { email });
            toast.success(SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT);
            setEmailSent(true);
        } catch (error) {
            logger.error("Password reset request failed", error instanceof Error ? error : new Error("Unknown error"));
            toast.error("Failed to send reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <Card className="w-full max-w-md glass-card border-white/10">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-orange-500/20">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-purple-400"
                            >
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center text-white">
                        Forgot Password?
                    </CardTitle>
                    <CardDescription className="text-center text-white/70">
                        {emailSent
                            ? "Check your email for the reset link"
                            : "Enter your email to receive a password reset link"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!emailSent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>

                            <p className="text-center text-sm text-white/70">
                                Remember your password?{" "}
                                <Link
                                    to={ROUTES.LOGIN}
                                    className="text-purple-400 hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-sm text-green-400">
                                    We've sent a password reset link to <strong>{email}</strong>.
                                    Please check your inbox and spam folder.
                                </p>
                            </div>
                            <Button
                                onClick={() => setEmailSent(false)}
                                variant="outline"
                                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                                Try Different Email
                            </Button>
                            <p className="text-center text-sm text-white/70">
                                <Link
                                    to={ROUTES.LOGIN}
                                    className="text-purple-400 hover:underline"
                                >
                                    Back to Sign In
                                </Link>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
