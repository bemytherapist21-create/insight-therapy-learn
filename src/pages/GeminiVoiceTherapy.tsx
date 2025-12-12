import { useGeminiVoiceTherapy } from '@/hooks/useGeminiVoiceTherapy';
import { CrisisIntervention } from '@/components/safety/CrisisIntervention';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Volume2, VolumeX } from 'lucide-react';

export default function GeminiVoiceTherapy() {
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

    const getRiskColor = () => {
        if (riskLevel === 'critical') return 'text-red-600';
        if (riskLevel === 'clouded') return 'text-yellow-600';
        return 'text-green-600';
    };

    const getStatusText = () => {
        if (isSpeaking) return '🔊 AI Speaking...';
        if (isListening) return '🎤 Listening...';
        return 'Ready to talk';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🧠 AI Voice Therapist
                    </h1>
                    <p className="text-purple-100">
                        Powered by Google Gemini • Guardian Protected
                    </p>
                    <p className="text-purple-200 text-sm mt-1">
                        🎙️ Uses your browser's speech recognition (free!)
                    </p>
                </div>

                {/* Guardian Status */}
                <Card className="p-6 mb-6 bg-white/95 backdrop-blur">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Well-Being Score</div>
                            <div className={`text-3xl font-bold ${getRiskColor()}`}>
                                {wbcScore}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">Status</div>
                            <div className={`font-semibold ${getRiskColor()}`}>
                                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Status Display */}
                <div className="text-center mb-6">
                    <div className={`inline-block px-6 py-3 rounded-full ${isListening ? 'bg-blue-500 animate-pulse' :
                        isSpeaking ? 'bg-green-500' :
                            'bg-white/90'
                        }`}>
                        <span className={`font-semibold ${isListening || isSpeaking ? 'text-white' : 'text-gray-800'
                            }`}>
                            {getStatusText()}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 mb-8 justify-center flex-wrap">
                    <Button
                        onClick={startListening}
                        disabled={isListening || isSpeaking}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
                    >
                        {isListening ? (
                            <>
                                <Mic className="mr-2 h-6 w-6 animate-pulse" />
                                Listening...
                            </>
                        ) : (
                            <>
                                <Mic className="mr-2 h-6 w-6" />
                                Start Talking
                            </>
                        )}
                    </Button>

                    {isListening && (
                        <Button
                            onClick={stopListening}
                            size="lg"
                            variant="outline"
                            className="px-8 py-6 text-lg border-2"
                        >
                            <Square className="mr-2 h-6 w-6" />
                            Stop
                        </Button>
                    )}

                    {isSpeaking && (
                        <Button
                            onClick={stopSpeaking}
                            size="lg"
                            variant="destructive"
                            className="px-8 py-6 text-lg"
                        >
                            <VolumeX className="mr-2 h-6 w-6" />
                            Mute AI
                        </Button>
                    )}
                </div>

                {/* Conversation */}
                <Card className="p-6 bg-white/95 backdrop-blur min-h-[400px] max-h-[600px] overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400 py-20">
                            <Mic className="mx-auto h-16 w-16 mb-4 opacity-30" />
                            <p className="text-lg mb-2">Click "Start Talking" and speak your mind</p>
                            <p className="text-sm">Your voice will be analyzed with Guardian safety</p>
                            <p className="text-xs mt-4 text-gray-500">
                                ✨ No API costs - uses browser speech recognition<br />
                                🧠 Powered by Google Gemini (same as text chat)
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg ${msg.role === 'user'
                                        ? 'bg-blue-50 ml-12'
                                        : 'bg-green-50 mr-12'
                                        }`}
                                >
                                    <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-2">
                                        {msg.role === 'user' ? (
                                            <>
                                                <Mic className="h-3 w-3" />
                                                You
                                            </>
                                        ) : (
                                            <>
                                                <Volume2 className="h-3 w-3" />
                                                AI Therapist
                                            </>
                                        )}
                                    </div>
                                    <div className="text-gray-800">{msg.text}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Browser Compatibility Note */}
                <div className="mt-4 text-center text-purple-100 text-sm">
                    💡 Works best in Chrome, Edge, or Safari
                </div>

                {/* Crisis Modal */}
                {showCrisisModal && (
                    <CrisisIntervention
                        isOpen={showCrisisModal}
                        onClose={closeCrisisModal}
                    />
                )}
            </div>
        </div>
    );
}
