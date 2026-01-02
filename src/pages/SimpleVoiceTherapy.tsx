import { useSimpleVoiceTherapy } from '@/hooks/useSimpleVoiceTherapy';
import { CrisisIntervention } from '@/components/safety/CrisisIntervention';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Loader2 } from 'lucide-react';

export default function SimpleVoiceTherapy() {
    const {
        isRecording,
        isProcessing,
        messages,
        wbcScore,
        riskLevel,
        showCrisisModal,
        startRecording,
        stopRecording,
        closeCrisisModal
    } = useSimpleVoiceTherapy();

    const getRiskColor = () => {
        if (wbcScore >= 51) return 'text-red-600';
        if (wbcScore >= 21) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getStatusText = () => {
        if (isProcessing) return 'Processing...';
        if (isRecording) return '🎤 Listening...';
        return 'Ready';
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
                        Guardian Safety Protected • Powered by GPT-4
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
                    <div className="inline-block px-6 py-3 bg-white/90 backdrop-blur rounded-full">
                        <span className="font-semibold text-gray-800">
                            {getStatusText()}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 mb-8 justify-center">
                    <Button
                        onClick={startRecording}
                        disabled={isRecording || isProcessing}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
                    >
                        {isRecording ? (
                            <>
                                <Mic className="mr-2 h-6 w-6 animate-pulse" />
                                Recording...
                            </>
                        ) : (
                            <>
                                <Mic className="mr-2 h-6 w-6" />
                                Start Session
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={stopRecording}
                        disabled={!isRecording || isProcessing}
                        size="lg"
                        variant="destructive"
                        className="px-8 py-6 text-lg"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Square className="mr-2 h-6 w-6" />
                                Stop
                            </>
                        )}
                    </Button>
                </div>

                {/* Conversation */}
                <Card className="p-6 bg-white/95 backdrop-blur min-h-[400px] max-h-[600px] overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400 py-20">
                            <Mic className="mx-auto h-16 w-16 mb-4 opacity-30" />
                            <p>Click "Start Session" and speak your mind.</p>
                            <p className="text-sm mt-2">Your voice will be transcribed and analyzed with Guardian safety.</p>
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
                                    <div className="text-xs font-semibold text-gray-600 mb-1">
                                        {msg.role === 'user' ? 'You' : 'AI Therapist'}
                                    </div>
                                    <div className="text-gray-800">{msg.text}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Crisis Modal */}
                <CrisisIntervention
                    isOpen={showCrisisModal}
                    onClose={closeCrisisModal}
                />
            </div>
        </div>
    );
}
