import { useGeminiVoiceTherapy } from '@/hooks/useGeminiVoiceTherapy';
import { CrisisIntervention } from '@/components/safety/CrisisIntervention';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GeminiVoiceTherapy() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const {
        isListening,
        isSpeaking,
        messages,
        wbcScore,
        riskLevel,
        showCrisisModal,
        startListening,
        stopListening,
        stopSpeaking,
        closeCrisisModal
    } = useGeminiVoiceTherapy();

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0e27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e5e7eb' }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0e27',
            color: '#e5e7eb',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <button
                        onClick={() => navigate('/ai-therapy')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        ← Back to Options
                    </button>
                </div>

                {/* Main Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth > 968 ? '1fr 1fr' : '1fr',
                    gap: '30px',
                    marginTop: '40px'
                }}>
                    {/* Left Panel - Voice Controls */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
                        borderRadius: '20px',
                        padding: '40px',
                        textAlign: 'center',
                        minHeight: '500px'
                    }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>
                            AI Voice Therapist
                        </h1>
                        <span style={{
                            display: 'inline-block',
                            background: '#10b981',
                            color: 'white',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            marginBottom: '40px'
                        }}>
                            ONLINE
                        </span>

                        <div style={{
                            width: '120px',
                            height: '120px',
                            margin: '60px auto',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    opacity: isListening ? 1 : 0.5,
                                    animation: isListening ? 'pulse 2s infinite' : 'none'
                                }}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                            </svg>
                        </div>

                        <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '30px' }}>
                            {isSpeaking ? '🔊 AI Speaking...' : isListening ? '🎤 Listening...' : 'Ready to connect'}
                        </p>

                        <div>
                            {!isListening && (
                                <button
                                    onClick={startListening}
                                    disabled={isSpeaking}
                                    style={{
                                        background: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        padding: '16px 40px',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: isSpeaking ? 'not-allowed' : 'pointer',
                                        opacity: isSpeaking ? 0.5 : 1
                                    }}
                                >
                                    📞 Start Session
                                </button>
                            )}
                            {isListening && (
                                <button
                                    onClick={stopListening}
                                    style={{
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        padding: '16px 40px',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ⏹️ Stop
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Avatar & Transcript */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* AI Avatar */}
                        <div style={{
                            background: '#1a1f3a',
                            borderRadius: '20px',
                            padding: '30px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#9ca3af', fontSize: '14px' }}>
                                <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                                AI Avatar
                            </div>
                            <div style={{
                                width: '200px',
                                height: '200px',
                                margin: '20px auto',
                                background: '#0a0e27',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#4b5563',
                                fontSize: '14px'
                            }}>
                                Therapist
                            </div>
                            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                                Visual presence online
                            </div>
                        </div>

                        {/* Conversation */}
                        <div style={{
                            background: '#1a1f3a',
                            borderRadius: '20px',
                            padding: '30px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#9ca3af', fontSize: '14px' }}>
                                <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                                </svg>
                                Conversation
                            </div>
                            <div style={{
                                minHeight: '200px',
                                maxHeight: '400px',
                                overflowY: 'auto',
                                color: '#6b7280',
                                fontSize: '14px'
                            }}>
                                {messages.length === 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
                                        Transcript will appear here...
                                    </div>
                                ) : (
                                    <div>
                                        {messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    marginBottom: '15px',
                                                    padding: '12px 16px',
                                                    borderRadius: '12px',
                                                    background: msg.role === 'user' ? '#1e40af' : '#065f46',
                                                    color: 'white',
                                                    marginLeft: msg.role === 'user' ? '40px' : '0',
                                                    marginRight: msg.role === 'ai' ? '40px' : '0'
                                                }}
                                            >
                                                <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px', fontWeight: '600' }}>
                                                    {msg.role === 'user' ? 'You' : 'AI Therapist'}
                                                </div>
                                                <div>{msg.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guardian Notice */}
                <div style={{
                    background: 'linear-gradient(90deg, #7c3aed 0%, #4c1d95 100%)',
                    padding: '15px 30px',
                    borderRadius: '15px',
                    textAlign: 'center',
                    marginTop: '30px',
                    fontSize: '14px'
                }}>
                    🛡️ <strong style={{ color: '#c4b5fd' }}>Project Guardian Protected</strong> - If you're experiencing a crisis, please contact the 988 Suicide & Crisis Lifeline
                </div>
            </div>

            {/* Crisis Modal */}
            {showCrisisModal && (
                <CrisisIntervention
                    isOpen={showCrisisModal}
                    onClose={closeCrisisModal}
                />
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}
