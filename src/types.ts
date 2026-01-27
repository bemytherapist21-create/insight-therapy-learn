export interface MoodEntry {
    id: string;
    date: string;
    mood: number;
    note: string;
    tags: string[];
    aiResponse?: string;
}
