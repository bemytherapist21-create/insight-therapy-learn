import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  GraduationCap, 
  ArrowRight,
  Users,
  Target,
  Lightbulb,
  Sparkles
} from 'lucide-react';

const Home = () => {
  const services = [
    {
      icon: Brain,
      title: 'AI-Powered Therapy',
      description: 'Connect with AI therapists or human professionals for personalized mental health support.',
      link: '/ai-therapy',
      color: 'text-purple-600'
    },
    {
      icon: BarChart3,
      title: 'InsightFusion',
      description: 'Advanced business analytics and strategy sessions to accelerate your growth.',
      link: '/insight-fusion',
      color: 'text-blue-600'
    },
    {
      icon: GraduationCap,
      title: 'AI-Powered Learning',
      description: 'Access cutting-edge educational materials and AI-driven learning experiences.',
      link: '/ai-learning',
      color: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-foreground leading-tight">
              The Everything AI
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto">
              Revolutionizing therapy, business insights, and learning through 
              cutting-edge artificial intelligence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-base font-medium"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 text-base font-medium border-border hover:bg-accent"
              >
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Our AI-Powered Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of digital services with our comprehensive AI solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service) => (
              <Link key={service.title} to={service.link}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group border-border bg-card">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:bg-accent transition-colors`}>
                      <service.icon className={`w-8 h-8 ${service.color}`} />
                    </div>
                    <CardTitle className="text-2xl text-card-foreground mb-2">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground text-center leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">10,000+</h3>
              <p className="text-muted-foreground">Trusted users worldwide</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">99.9%</h3>
              <p className="text-muted-foreground">Precision in AI interactions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">24/7</h3>
              <p className="text-muted-foreground">AI assistance available</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of satisfied users and discover the power of AI-driven solutions
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-base font-medium"
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