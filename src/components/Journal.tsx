import React, { useState } from 'react';
import { MoodEntry } from '../types';
import { MOOD_LABELS } from '../constants';
import { GoogleGenAI } from '@google/genai';
import { playSpeech } from '../services/audio';

interface JournalProps {
    moodEntries: MoodEntry[];
    onAddMood: (entry: MoodEntry) => void;
}

const Journal: React.FC<JournalProps> = ({ moodEntries, onAddMood }) => {
    const [isWriting, setIsWriting] = useState(false);
    const [mood, setMood] = useState(5);
    const [note, setNote] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [speakingEntryId, setSpeakingEntryId] = useState<string | null>(null);
    const [autoPlayVoice, setAutoPlayVoice] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAnalyzing(true);

        let aiResponse = "";
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: `I wrote a journal entry: "${note}". My current mood is ${mood}/10. 
        Please provide a short, empathetic reflection and one helpful journaling prompt for my next entry. 
        Keep the tone warm and therapeutic. Under 80 words.`,
            });
            aiResponse = response.text || "";
        } catch (err) {
            console.error("AI Insight error:", err);
        }

        const newEntry: MoodEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            mood,
            note,
            tags,
            aiResponse
        };

        onAddMood(newEntry);
        setIsAnalyzing(false);
        setIsWriting(false);
        setNote('');
        setMood(5);
        setTags([]);

        if (autoPlayVoice && aiResponse) {
            handleListen(newEntry.id, aiResponse);
        }
    };

    const handleListen = async (id: string, text: string) => {
        if (speakingEntryId) return;
        setSpeakingEntryId(id);
        await playSpeech(text, 'Kore');
        setSpeakingEntryId(null);
    };

    const addTag = () => {
        if (tagInput && !tags.includes(tagInput.toLowerCase())) {
            setTags([...tags, tagInput.toLowerCase()]);
            setTagInput('');
        }
    };

    return (
        <div className="animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Personal Journal</h1>
                    <p className="text-slate-500">Document your thoughts and hear the AI's perspective.</p>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                        <input
                            type="checkbox"
                            checked={autoPlayVoice}
                            onChange={e => setAutoPlayVoice(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auto-Voice Reply</span>
                    </label>
                    <button
                        onClick={() => setIsWriting(true)}
                        className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
                    >
                        + New Entry
                    </button>
                </div>
            </div>

            {isWriting && (
                <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-indigo-50 mb-12 animate-in slide-in-from-top-4 duration-500">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">How are you feeling?</label>
                                <input
                                    type="range" min="1" max="10"
                                    value={mood} onChange={(e) => setMood(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="mt-4 p-5 bg-indigo-50/50 rounded-3xl text-center border border-indigo-100">
                                    <span className="block text-xs font-bold text-indigo-400 uppercase mb-1">Estimated Mood</span>
                                    <span className="text-xl font-bold text-indigo-700">{MOOD_LABELS.find(m => m.value === mood)?.label}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contextual Tags</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="e.g. Work, Stress, Gratitude"
                                        className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100"
                                    />
                                    <button type="button" onClick={addTag} className="px-5 py-3 bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-300">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(t => <span key={t} className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] rounded-full font-bold uppercase">{t}</span>)}
                                </div>
                            </div>
                        </div>

                        <div className="mb-10">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Your Thoughts</label>
                            <textarea
                                required
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full min-h-[200px] p-8 bg-slate-50 border-none rounded-[35px] focus:ring-2 focus:ring-indigo-100 text-slate-700 leading-relaxed font-serif italic text-lg shadow-inner"
                                placeholder="Write freely... what's happening in your world?"
                            />
                        </div>

                        <div className="flex justify-end items-center gap-6">
                            <button type="button" onClick={() => setIsWriting(false)} className="text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase text-xs tracking-widest">Discard</button>
                            <button
                                type="submit"
                                disabled={isAnalyzing}
                                className="px-10 py-4 bg-slate-900 text-white rounded-[20px] font-bold shadow-2xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Reflecting...
                                    </>
                                ) : "Save & Hear Reply"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-8">
                {moodEntries.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 font-serif italic text-xl">Your journal is waiting for your first entry.</p>
                    </div>
                )}
                {moodEntries.map((entry) => (
                    <article key={entry.id} className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-50/50 group">
                        <div
                            className="absolute left-0 top-0 bottom-0 w-2 group-hover:w-3 transition-all"
                            style={{ backgroundColor: MOOD_LABELS.find(m => m.value === entry.mood)?.color }}
                        />
                        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                <div className="flex gap-1.5">
                                    {entry.tags.map(t => <span key={t} className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 uppercase rounded-md">{t}</span>)}
                                </div>
                            </div>
                            <span className="px-4 py-1.5 bg-slate-50 rounded-full text-xs font-bold text-slate-700 border border-slate-100 shadow-sm">Mood: {entry.mood}/10</span>
                        </div>

                        <p className="text-slate-800 font-serif text-xl leading-relaxed mb-10 italic border-l-4 border-slate-100 pl-6">"{entry.note}"</p>

                        {entry.aiResponse && (
                            <div className="bg-indigo-50/50 p-8 rounded-[35px] border border-indigo-100 flex gap-6 items-start relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-4 opacity-10 transition-opacity ${speakingEntryId === entry.id ? 'opacity-30 animate-pulse' : ''}`}>
                                    <svg className="w-20 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                </div>
                                <button
                                    onClick={() => handleListen(entry.id, entry.aiResponse!)}
                                    disabled={speakingEntryId !== null && speakingEntryId !== entry.id}
                                    className={`
                    flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all z-10
                    ${speakingEntryId === entry.id
                                            ? 'bg-indigo-600 text-white animate-pulse shadow-lg'
                                            : 'bg-white text-indigo-400 shadow-md hover:text-indigo-600 hover:scale-110 disabled:opacity-30'}
                  `}
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-3.012 7.155 1 1 0 01-1.414-1.414A7.972 7.972 0 0017 10a7.972 7.972 0 00-2.343-5.657 1 1 0 010-1.414z" />
                                    </svg>
                                </button>
                                <div className="relative z-10">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2 block">Voice Insight Reply</span>
                                    <p className="text-indigo-900 leading-relaxed max-w-3xl">{entry.aiResponse}</p>
                                </div>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </div>
    );
};

export default Journal;
