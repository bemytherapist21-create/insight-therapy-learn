import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Sparkles, Loader2 } from 'lucide-react';
import { useContactForm } from '@/hooks/useContactForm';

export const ContactForm = () => {
    const { formData, loading, errors, handleSubmit, updateField } = useContactForm();

    return (
        <Card className="glass-card animate-fade-in">
            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                            Name
                        </label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            required
                            disabled={loading}
                            maxLength={100}
                            className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            required
                            disabled={loading}
                            maxLength={255}
                            className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                            Message
                        </label>
                        <Textarea
                            id="message"
                            placeholder="Tell us about your needs..."
                            value={formData.message}
                            onChange={(e) => updateField('message', e.target.value)}
                            required
                            disabled={loading}
                            rows={6}
                            maxLength={5000}
                            className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none ${errors.message ? 'border-red-500' : ''}`}
                        />
                        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                        <p className="text-white/40 text-xs mt-1 text-right">{formData.message.length}/5000</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <a
                            href="mailto:founder@theeverythingai.com"
                            className="flex items-center gap-2 text-white hover:text-white transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">founder@theeverythingai.com</span>
                        </a>
                        <Button
                            type="submit"
                            size="lg"
                            disabled={loading}
                            className="bg-gradient-primary hover:shadow-glow w-full sm:w-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Send Message
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
