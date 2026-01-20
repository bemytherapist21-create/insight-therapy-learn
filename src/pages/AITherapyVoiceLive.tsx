import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { GeminiLiveTherapy } from '@/components/GeminiLiveTherapy';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const AITherapyVoiceLive = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !user) {
            const currentPath = window.location.pathname;
            navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen pt-20 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/ai-therapy')}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to AI Therapy Options
                    </Button>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                            Live Voice Therapy
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Experience real-time AI-powered therapy using Gemini's advanced Live API
                        </p>
                    </div>

                    {/* Main Component */}
                    <GeminiLiveTherapy onBack={() => navigate('/ai-therapy')} />
                </div>
            </section>
        </div>
    );
};

export default AITherapyVoiceLive;
