import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { rateLimiter, RATE_LIMITS } from '@/lib/rateLimiter';
import { logger } from '@/services/loggingService';
import { errorService } from '@/services/errorService';
import { sanitizeEmail } from '@/lib/validation';
import { ROUTES, SUCCESS_MESSAGES } from '@/config/constants';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Rate limiting check
        if (!rateLimiter.checkLimit('login', RATE_LIMITS.LOGIN)) {
            const timeLeft = rateLimiter.getTimeUntilReset('login');
            toast.error(`Too many login attempts. Please try again in ${timeLeft} seconds.`);
            logger.warn('Login rate limited', { email: formData.email });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: sanitizeEmail(formData.email),
                password: formData.password,
            });

            if (error) throw error;

            logger.info('User logged in successfully', { email: formData.email });
            toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);

            // Reset rate limiter on successful login
            rateLimiter.reset('login');

            navigate(ROUTES.HOME);
        } catch (error) {
            errorService.handleError(error, 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-orange-900 p-4">
            <Card className="w-full max-w-md glass-card">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-white">Welcome Back</CardTitle>
                    <CardDescription className="text-center text-white/70">
                        Sign in to continue to The Everything AI
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="bg-white/10 border-white/20 text-white"
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
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>

                        <p className="text-center text-sm text-white/70">
                            Don't have an account?{' '}
                            <Link to={ROUTES.REGISTER} className="text-purple-400 hover:underline">
                                Create one
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
