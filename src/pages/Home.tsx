import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import emailjs from '@emailjs/browser';
import { 
  Brain, 
  BarChart3, 
  GraduationCap, 
  Sparkles, 
  ArrowRight,
  Users,
  Target,
  Lightbulb,
  Mail
} from 'lucide-react';
import heroImage from '@/assets/hero-ai.jpg';

const Home = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Google Apps Script URL for saving to Google Sheets
    const googleSheetsURL = 'https://script.google.com/macros/s/AKfycbxQ5FgsJfnT55m81KTXsgZGE5qByyFOap_Do6Nb4m_deA-9FR1mMQCLB4bY7xvVgPQk/exec';
    
    try {
      await fetch(googleSheetsURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message
        })
      });
      
      toast({
        title: "Message received!",
        description: "Thank you! We'll get back to you soon.",
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Please try again or email us directly at founder@theeverythingai.com",
        variant: "destructive",
      });
    }
  };

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
              <span className="block pb-2 leading-normal bg-gradient-to-r from-[#8A2BE2] to-[#FF8C00] bg-clip-text text-transparent">The Everything AI</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white max-w-2xl mx-auto">
              Revolutionizing therapy, business insights, and learning through 
              cutting-edge artificial intelligence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white hover-glow animate-scale-in"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Explore Services
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:text-white animate-scale-in"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Our AI-Powered Services
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
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
                    <CardDescription className="text-white text-center transition-colors">
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
              <p className="text-white">Trusted by thousands worldwide</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">99.9% Accuracy</h3>
              <p className="text-white">Precision in every AI interaction</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">24/7 Available</h3>
              <p className="text-white">AI assistance whenever you need it</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">About The Everything AI</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-700 to-orange-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Pioneering AI Solutions for a Better Tomorrow</h3>
              
              <p className="text-white mb-6 text-lg">
                At The Everything AI, we're revolutionizing how individuals and businesses harness the power of artificial intelligence. Founded in 2023, our mission is to make advanced AI technologies accessible, practical, and transformative for everyday life.
              </p>
              
              <p className="text-white mb-8 text-lg">
                Our team of AI specialists, data scientists, and industry experts work together to create solutions that address real-world challenges across mental health, business analytics, and education.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg transition-transform duration-300 hover:-translate-y-2 border border-white/10">
                  <div className="text-purple-400 mb-2">
                    <Lightbulb className="h-10 w-10" />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-1">Innovation</h4>
                  <p className="text-white">Constantly pushing AI boundaries</p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg transition-transform duration-300 hover:-translate-y-2 border border-white/10">
                  <div className="text-orange-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-1">Privacy</h4>
                  <p className="text-white">Your data safety is our priority</p>
                </div>
              </div>
              
              <a href="#services" className="inline-flex items-center text-purple-400 font-medium group hover:text-purple-300 transition-colors">
                Discover our services
                <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
            
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-purple-700 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                  <div className="w-56 h-56 md:w-80 md:h-80 bg-black rounded-full flex items-center justify-center p-6 border border-white/10">
                    <Brain className="w-40 h-40 text-white" />
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-purple-500 opacity-70 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-orange-500 opacity-70 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <div className="absolute top-1/2 -right-8 w-8 h-8 bg-blue-500 opacity-70 rounded-full animate-pulse" style={{ animationDelay: '700ms' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl text-center transform transition-transform duration-300 hover:-translate-y-2 border border-white/10">
              <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">96%</span>
              <p className="text-white mt-2">User Satisfaction</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl text-center transform transition-transform duration-300 hover:-translate-y-2 border border-white/10">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">10,000+</span>
              <p className="text-white mt-2">Users Worldwide</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl text-center transform transition-transform duration-300 hover:-translate-y-2 border border-white/10">
              <span className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-orange-400 bg-clip-text text-transparent">24/7</span>
              <p className="text-white mt-2">AI-Powered Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl font-bold text-white mb-4">
                Get In Touch
              </h2>
              <p className="text-xl text-white">
                Ready to transform your experience? Send us a message and we'll get back to you soon.
              </p>
            </div>

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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
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
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your needs..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
                    />
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
                      className="bg-gradient-primary hover:shadow-glow w-full sm:w-auto"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
