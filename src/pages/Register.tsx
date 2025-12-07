import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ROUTES } from '@/config/constants';

const Register = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
            <Card className="w-full max-w-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your information to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm />

                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link to={ROUTES.LOGIN} className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
