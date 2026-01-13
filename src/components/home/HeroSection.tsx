import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import heroImage from '@/assets/hero-ai.jpg';
import brainLogo from '@/assets/brain-logo.png';

export const HeroSection = () => {
    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative pt-20 pb-20 overflow-hidden bg-black">
            <div className="absolute inset-0">
                <img
                    src={heroImage}
                    alt="AI Technology Background"
                    className="w-full h-full object-cover opacity-10"
                />
            </div>

            <div className="relative container mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight text-white leading-tight">
                        <span className="block mb-1">Welcome to</span>
                        <span className="flex items-center justify-center gap-2 pb-2 leading-normal">
                            <span className="bg-gradient-to-r from-[#8A2BE2] to-[#FF8C00] bg-clip-text text-transparent">The</span>
                            <img src={brainLogo} alt="Brain Logo" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain" />
                            <span className="bg-gradient-to-r from-[#8A2BE2] to-[#FF8C00] bg-clip-text text-transparent">Everything AI</span>
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-white max-w-2xl mx-auto">
                        Revolutionizing therapy, business insights, and learning through
                        cutting-edge artificial intelligence
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white hover-glow animate-scale-in"
                            onClick={() => scrollToSection('services')}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Explore Services
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:text-white animate-scale-in"
                            onClick={() => scrollToSection('about')}
                        >
                            Learn More
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
