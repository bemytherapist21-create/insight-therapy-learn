import { Link } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Shield, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TherapistRegistrationForm from '@/components/therapist/TherapistRegistrationForm';

const TherapistRegistration = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>
                    <h1 className="text-xl font-bold text-white">Therapist Registration</h1>
                    <div className="w-24" /> {/* Spacer for centering */}
                </div>
            </nav>

            <div className="container mx-auto px-4 pt-24 pb-16">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full mb-6">
                        <Stethoscope className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 text-sm font-medium">Join Our Network</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Become a Registered Therapist
                    </h1>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                        Join our platform to connect with clients seeking professional mental health support. 
                        We verify all credentials to ensure the highest quality of care.
                    </p>
                </div>

                {/* Benefits Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                        <Shield className="w-10 h-10 text-green-400 mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">Verified Platform</h3>
                        <p className="text-white/60 text-sm">All therapists are verified to ensure trust and safety</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                        <Users className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">Growing Community</h3>
                        <p className="text-white/60 text-sm">Connect with clients actively seeking professional help</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                        <Clock className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">Flexible Schedule</h3>
                        <p className="text-white/60 text-sm">Set your own availability and work on your terms</p>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Registration Form</h2>
                        <TherapistRegistrationForm />
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-white/50 text-sm mt-8 max-w-lg mx-auto">
                    By submitting this form, you agree to our verification process. 
                    We'll review your credentials and respond within 48 hours.
                </p>
            </div>
        </div>
    );
};

export default TherapistRegistration;
