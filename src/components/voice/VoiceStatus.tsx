import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Loader2, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, PhoneOff } from 'lucide-react';
import { EMOTION_COLORS } from '@/config/constants';

interface VoiceStatusProps {
    status: 'idle' | 'connecting' | 'connected';
    isSpeaking: boolean;
    isListening: boolean;
    currentEmotion: string;
    onStartSession: () => void;
    onEndSession: () => void;
}

export const VoiceStatus = ({
    status,
    isSpeaking,
    isListening,
    currentEmotion,
    onStartSession,
    onEndSession
}: VoiceStatusProps) => {
    const isConnected = status === 'connected';
    const isConnecting = status === 'connecting';

    return (
        <Card className="glass-card overflow-hidden h-full">
            <CardContent className="p-8 flex flex-col items-center justify-between h-full">
                {/* Status Display */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">AI Voice Therapist</h2>
                    <div className="flex items-center justify-center gap-2">
                        <Badge className={`${EMOTION_COLORS[currentEmotion] || 'bg-gray-500'} transition-colors duration-500`}>
                            <Heart className="w-3 h-3 mr-1" />
                            {currentEmotion}
                        </Badge>
                    </div>
                </div>

                {/* Visual Feedback */}
                <div className="flex justify-center mb-6 py-8">
                    <div className="relative">
                        <AnimatePresence>
                            {(isSpeaking || isListening) && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{
                                        scale: isSpeaking ? [1, 1.2, 1] : [1, 1.1, 1],
                                        opacity: 1
                                    }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: isSpeaking ? 0.8 : 1.5 }}
                                    className={`absolute inset-0 rounded-full ${isSpeaking
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                        } blur-xl opacity-50`}
                                    style={{ width: 140, height: 140, margin: -15 }}
                                />
                            )}
                        </AnimatePresence>

                        <motion.div
                            animate={{ scale: isConnecting ? [1, 1.05, 1] : 1 }}
                            transition={{ repeat: isConnecting ? Infinity : 0, duration: 1 }}
                            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm z-10 relative transition-colors duration-500 ${isConnected
                                    ? isSpeaking
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                    : 'bg-white/10 border border-white/10'
                                }`}
                        >
                            {isConnecting ? (
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            ) : isConnected ? (
                                isSpeaking ? (
                                    <Volume2 className="w-10 h-10 text-white" />
                                ) : (
                                    <Mic className="w-10 h-10 text-white" />
                                )
                            ) : (
                                <MicOff className="w-10 h-10 text-white/50" />
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Status Text & Controls */}
                <div className="w-full text-center">
                    <div className="h-8 mb-6">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-lg font-medium"
                            >
                                {isConnecting ? (
                                    <span className="text-yellow-400">Connecting...</span>
                                ) : isConnected ? (
                                    isSpeaking ? (
                                        <span className="text-cyan-400">Guardian is speaking...</span>
                                    ) : (
                                        <span className="text-purple-400">Listening to you...</span>
                                    )
                                ) : (
                                    <span className="text-white/50">Ready to connect</span>
                                )}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {!isConnected ? (
                        <Button
                            onClick={onStartSession}
                            disabled={isConnecting}
                            size="lg"
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-glow px-8 min-w-[200px]"
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Phone className="w-5 h-5 mr-2" />
                                    Start Session
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={onEndSession}
                            size="lg"
                            variant="destructive"
                            className="px-8 min-w-[200px] shadow-lg hover:shadow-red-500/20"
                        >
                            <PhoneOff className="w-5 h-5 mr-2" />
                            End Session
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
