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
      <section className="relative min-h-screen bg-gradient-hero flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300 opacity-20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-10 right-10 w-32 h-32 bg-orange-300 opacity-20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-purple-300 opacity-20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl w-full text-center">
          <div className="relative z-10 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              <span className="block">Welcome to</span>
              <span className="block mt-2 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
                The Everything AI
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Experience revolutionary mental health support, business analytics, and AI-powered learning—all in one platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-gradient text-white font-bold py-6 px-8 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-purple-700 py-6 px-8 text-lg font-semibold"
              >
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our AI-Powered Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of digital services with our comprehensive AI solutions
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-700 to-orange-500 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Link key={service.title} to={service.link}>
                <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group animate-scale-in h-full" 
                      style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="text-center">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${service.gradient} p-5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-center text-base">
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
      <section className="py-20 bg-gray-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">10,000+</h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Trusted Users Worldwide</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">99.9%</h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">AI Accuracy Rate</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-600 to-orange-700 rounded-full flex items-center justify-center shadow-lg">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">24/7</h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Always Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Transform Your Experience?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of satisfied users and discover the power of AI-driven solutions
            </p>
            <Button 
              size="lg" 
              className="btn-gradient text-white font-bold py-6 px-8 text-lg"
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