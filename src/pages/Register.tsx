import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Country {
    code: string;
    name: string;
}

const Register = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [detectedCountry, setDetectedCountry] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        phone: '',
        country: '',
        ageConfirmed: false,
        termsAccepted: false
    });

    // Auto-detect country on component mount
    useEffect(() => {
        detectCountry();
        loadCountries();
    }, []);

    const detectCountry = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.country_code) {
                setDetectedCountry(data.country_code);
                setFormData(prev => ({ ...prev, country: data.country_code }));
            }
        } catch (error) {
            console.log('Could not auto-detect country');
        }
    };


    const loadCountries = async () => {
        // @ts-ignore - crisis_resources table exists but not in generated types yet
        const { data, error } = await supabase
            .from('crisis_resources')
            .select('country_code, country_name')
            .order('country_name');

        if (error) {
            console.error('Error loading countries:', error);
            // Fallback to hardcoded list if database fails
            setCountries([
                { code: 'US', name: 'United States' },
                { code: 'IN', name: 'India' },
                { code: 'GB', name: 'United Kingdom' },
                { code: 'AU', name: 'Australia' },
                { code: 'CA', name: 'Canada' }
            ]);
            return;
        }

        if (data) {
            setCountries(data.map(c => ({ code: c.country_code, name: c.country_name })));
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (!formData.ageConfirmed) {
            toast({
                title: "Error",
                description: "You must be 18 or older to register",
                variant: "destructive",
            });
            return;
        }

        if (!formData.termsAccepted) {
            toast({
                title: "Error",
                description: "You must accept the terms and conditions",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // Sign up with Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        phone: formData.phone,
                        country: formData.country,
                    }
                }
            });

            if (authError) throw authError;

            toast({
                title: "Success!",
                description: "Registration successful. Please check your email to verify your account.",
            });

            // Redirect to login or home
            navigate('/login');
        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-orange-900 p-4">
            <Card className="w-full max-w-md glass-card">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-white">Create Account</CardTitle>
                    <CardDescription className="text-center text-white/70">
                        Join The Everything AI for personalized therapy and support
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email *</Label>
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
                            <Label htmlFor="firstName" className="text-white">First Name (Optional)</Label>
                            <Input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                placeholder="Your first name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-white">Contact Number *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                placeholder="+1234567890"
                            />
                            <p className="text-xs text-white/60">For emergency contact purposes only</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country" className="text-white">Country *</Label>
                            <Select
                                value={formData.country}
                                onValueChange={(value) => setFormData({ ...formData, country: value })}
                                required
                            >
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/95 border-white/20">
                                    {countries.map((country) => (
                                        <SelectItem key={country.code} value={country.code} className="text-white">
                                            {country.name}
                                            {country.code === detectedCountry && ' (Detected)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="bg-white/10 border-white/20 text-white"
                                minLength={8}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="bg-white/10 border-white/20 text-white"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="age"
                                checked={formData.ageConfirmed}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, ageConfirmed: checked as boolean })
                                }
                                className="border-white/20"
                            />
                            <Label htmlFor="age" className="text-sm text-white cursor-pointer">
                                I confirm that I am 18 years or older *
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="terms"
                                checked={formData.termsAccepted}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, termsAccepted: checked as boolean })
                                }
                                className="border-white/20"
                            />
                            <Label htmlFor="terms" className="text-sm text-white cursor-pointer">
                                I accept the{' '}
                                <Link to="/terms" className="text-purple-400 hover:underline">
                                    Terms & Conditions
                                </Link> *
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>

                        <p className="text-center text-sm text-white/70">
                            Already have an account?{' '}
                            <Link to="/login" className="text-purple-400 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
