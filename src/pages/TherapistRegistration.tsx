import { motion } from 'framer-motion';
import { Heart, Shield, Users, TrendingUp, Check } from 'lucide-react';
import TherapistRegistrationForm from '@/components/therapist/TherapistRegistrationForm';

const TherapistRegistration = () => {
    const benefits = [
        {
            icon: Users,
            title: 'Reach More Clients',
            description: 'Connect with thousands of users seeking professional mental health support',
            gradient: 'from-purple-500 to-blue-500'
        },
        {
            icon: Shield,
            title: 'Secure Platform',
            description: 'HIPAA-compliant environment with end-to-end encryption',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            icon: TrendingUp,
            title: 'Flexible Schedule',
            description: 'Set your own availability and manage appointments seamlessly',
            gradient: 'from-orange-500 to-pink-500'
        },
        {
            icon: Heart,
            title: 'Make an Impact',
            description: 'Help people access quality mental health care when they need it most',
            gradient: 'from-green-500 to-emerald-500'
        }
    ];

    const requirements = [
        'Licensed mental health professional (LMFT, LCSW, Psychologist, or equivalent)',
        'Active, unrestricted license in good standing',
        'Minimum 2 years of clinical experience',
        'Malpractice insurance coverage',
        'Commitment to ethical practice and patient confidentiality'
    ];

    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                            Join Our Therapist Network
                        </h1>
                        <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
                            Make a difference in people's lives by providing professional mental health support on our platform
                        </p>
                    </motion.div>

                    {/* Benefits Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
                    >
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                                className="glass-card p-6 text-center hover-lift"
                            >
                                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${benefit.gradient} rounded-2xl flex items-center justify-center`}>
                                    <benefit.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                                <p className="text-white/70 text-sm">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Requirements Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="glass-card p-8 mb-16 max-w-4xl mx-auto"
                    >
                        <h2 className="text-3xl font-bold text-white mb-6 text-center">Requirements</h2>
                        <div className="space-y-4">
                            {requirements.map((requirement, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <p className="text-white/90">{requirement}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Registration Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-white mb-4">
                                Apply to Join
                            </h2>
                            <p className="text-xl text-white/80">
                                Fill out the form below and we'll review your application within 3-5 business days
                            </p>
                        </div>
                        <TherapistRegistrationForm />
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default TherapistRegistration;
