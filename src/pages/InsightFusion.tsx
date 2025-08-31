import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  BarChart3, 
  Target, 
  Lightbulb,
  Clock,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const InsightFusion = () => {
  const services = [
    {
      title: 'Business Strategy Sessions',
      description: 'Comprehensive analysis of your business model with AI-driven insights',
      duration: '60 minutes',
      price: '$299',
      features: ['Market Analysis', 'Competitor Research', 'Growth Strategy', 'ROI Optimization']
    },
    {
      title: 'Data Analytics Consultation',
      description: 'Deep dive into your business data to uncover hidden patterns and opportunities',
      duration: '90 minutes',
      price: '$399',
      features: ['Data Visualization', 'KPI Development', 'Predictive Modeling', 'Action Plan']
    },
    {
      title: 'AI Implementation Strategy',
      description: 'Roadmap for integrating AI solutions into your business operations',
      duration: '75 minutes',
      price: '$349',
      features: ['AI Assessment', 'Technology Stack', 'Implementation Timeline', 'Cost Analysis']
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Precision Insights',
      description: 'AI-powered analysis delivers laser-focused business intelligence'
    },
    {
      icon: TrendingUp,
      title: 'Growth Acceleration',
      description: 'Identify opportunities to scale your business faster than ever'
    },
    {
      icon: Lightbulb,
      title: 'Innovation Strategy',
      description: 'Stay ahead of the curve with cutting-edge strategic recommendations'
    },
    {
      icon: Users,
      title: 'Expert Guidance',
      description: 'Connect with seasoned strategists and AI specialists'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              InsightFusion
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Transform your business with AI-driven analytics and strategic insights. 
              Book a personalized consultation to unlock your company's full potential.
            </p>
            
            <div className="glass-card max-w-lg mx-auto p-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h3>
              <p className="text-white/70 mb-4">Schedule your strategy session today</p>
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow w-full animate-glow-pulse"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Strategy Session
              </Button>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {benefits.map((benefit, index) => (
              <Card key={benefit.title} className="glass-card text-center hover-lift animate-scale-in" 
                    style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-white/70 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={service.title} className="glass-card hover-lift animate-scale-in group" 
                    style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-white/70">{service.duration}</span>
                    </div>
                    <div className="text-2xl font-bold text-secondary">{service.price}</div>
                  </div>
                  <CardTitle className="text-2xl text-white group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CardDescription className="text-white/70">
                    {service.description}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">What's Included:</h4>
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-white/80">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-glow transition-all duration-300"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book This Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Calendar Integration Placeholder */}
          <div className="mt-20 text-center">
            <Card className="glass-card max-w-4xl mx-auto animate-fade-in">
              <CardContent className="p-12">
                <Calendar className="w-20 h-20 mx-auto mb-6 text-primary" />
                <h3 className="text-3xl font-bold text-white mb-4">
                  Calendar Integration Coming Soon
                </h3>
                <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                  We're building a seamless booking experience with calendar integration. 
                  For now, please contact us directly to schedule your strategy session.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-gradient-primary hover:shadow-glow">
                    Contact Us to Book
                  </Button>
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white hover:text-gray-900">
                    Learn More About Our Process
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InsightFusion;