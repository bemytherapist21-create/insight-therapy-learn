import { Video, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EMOTION_COLORS, API_ENDPOINTS } from '@/config/constants';

interface TranscriptEntry {
    role: 'user' | 'assistant';
    text: string;
    emotion?: string;
}

interface AvatarDisplayProps {
    avatarUrl: string | null;
    isGenerating: boolean;
    transcript: TranscriptEntry[];
}

export const AvatarDisplay = ({ avatarUrl, isGenerating, transcript }: AvatarDisplayProps) => {
    return (
        <Card className="glass-card overflow-hidden h-full">
            <CardContent className="p-6 flex flex-col h-full">
                {/* D-ID Avatar */}
                <div className="mb-4 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4 text-white/70" />
                        <h3 className="text-sm font-medium text-white/70">AI Avatar</h3>
                        {isGenerating && (
                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        )}
                    </div>
                    <div className="aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10 relative group">
                        {avatarUrl ? (
                            <video
                                src={avatarUrl}
                                autoPlay
                                className="w-full h-full object-cover"
                                onEnded={() => { }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30 bg-gradient-to-b from-black/0 to-black/20">
                                <div className="text-center">
                                    <img
                                        src={API_ENDPOINTS.D_ID_AVATAR_DEFAULT}
                                        alt="AI Therapist"
                                        className="w-24 h-24 rounded-full mx-auto mb-3 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                    <p className="text-xs font-medium opacity-70">Visual presence active</p>
                                </div>
                            </div>
                        )}

                        {/* Overlay hint */}
                        {!avatarUrl && !isGenerating && (
                            <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] text-white/40 bg-black/60 px-2 py-1 rounded">
                                    Avatar animates during long responses
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transcript */}
                <div className="flex-1 min-h-0 flex flex-col">
                    <h3 className="text-sm font-medium text-white/70 mb-2 shrink-0">Conversation</h3>
                    <div className="flex-1 bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                        <ScrollArea className="h-full w-full p-3">
                            <div className="space-y-3">
                                {transcript.length === 0 ? (
                                    <div className="h-full flex items-center justify-center py-8">
                                        <p className="text-white/30 text-sm text-center italic">
                                            Transcript will appear here...
                                        </p>
                                    </div>
                                ) : (
                                    transcript.map((entry, idx) => (
                                        <div key={idx} className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold uppercase tracking-wider ${entry.role === 'user' ? 'text-purple-400' : 'text-cyan-400'
                                                    }`}>
                                                    {entry.role === 'user' ? 'You' : 'Guardian'}
                                                </span>
                                                {entry.emotion && (
                                                    <Badge className={`${EMOTION_COLORS[entry.emotion] || 'bg-gray-500'} text-[10px] h-4 px-1 leading-none`}>
                                                        {entry.emotion}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className={`text-sm leading-relaxed ${entry.role === 'user' ? 'text-white/80' : 'text-white/90'
                                                }`}>
                                                {entry.text}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
