import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  GraduationCap, 
  Sparkles, 
  ArrowRight,
  Users,
  Target,
  Lightbulb
} from 'lucide-react';
import heroImage from '@/assets/hero-ai.jpg';

const Home = () => {
  const services = [
    {
      icon: Brain,
      title: 'AI-Powered Therapy',
      description: 'Connect with AI therapists or human professionals for personalized mental health support.',
      link: '/ai-therapy',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'InsightFusion',
      description: 'Advanced business analytics and strategy sessions to accelerate your growth.',
      link: '/insight-fusion',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: GraduationCap,
      title: 'AI-Powered Learning',
      description: 'Access cutting-edge educational materials and AI-driven learning experiences.',
      link: '/ai-learning',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-main opacity-90" />
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="AI Technology Background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent leading-relaxed py-4">
              The Everything AI
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Revolutionizing therapy, business insights, and learning through 
              cutting-edge artificial intelligence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white hover-glow animate-scale-in"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Explore Services
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:text-white animate-scale-in"
              >
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Our AI-Powered Services
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Experience the future of digital services with our comprehensive AI solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Link key={service.title} to={service.link}>
                <Card className="glass-card hover-lift cursor-pointer group animate-scale-in" 
                      style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${service.gradient} p-4 mb-4 group-hover:shadow-glow transition-all duration-300`}>
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/70 text-center group-hover:text-white/90 transition-colors">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">10,000+ Users</h3>
              <p className="text-white/70">Trusted by thousands worldwide</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">99.9% Accuracy</h3>
              <p className="text-white/70">Precision in every AI interaction</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">24/7 Available</h3>
              <p className="text-white/70">AI assistance whenever you need it</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Experience?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of satisfied users and discover the power of AI-driven solutions
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow animate-glow-pulse"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;