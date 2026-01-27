import {
  Brain,
  BarChart3,
  GraduationCap,
  Users,
  Target,
  Lightbulb,
} from "lucide-react";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { ServiceCard } from "@/components/home/ServiceCard";
import { ContactForm } from "@/components/home/ContactForm";

const Home = () => {
  const services = [
    {
      icon: Brain,
      title: "AI-Powered Therapy",
      description:
        "Connect with AI therapists or human professionals for personalized mental health support.",
      link: "/ai-therapy",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "InsightFusion",
      description:
        "Advanced business analytics and strategy sessions to accelerate your growth.",
      link: "/insight-fusion",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: GraduationCap,
      title: "AI-Powered Learning",
      description:
        "Access cutting-edge educational materials and AI-driven learning experiences.",
      link: "/ai-learning",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Services Section */}
      <section id="services" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Our AI-Powered Services
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Experience the future of digital services with our comprehensive
              AI solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <ServiceCard key={service.title} {...service} index={index} />
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
              <h3 className="text-xl font-bold text-white mb-2">
                10,000+ Users
              </h3>
              <p className="text-white">Trusted by thousands worldwide</p>
            </div>
            <div
              className="text-center animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                99.9% Accuracy
              </h3>
              <p className="text-white">Precision in every AI interaction</p>
            </div>
            <div
              className="text-center animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                24/7 Available
              </h3>
              <p className="text-white">AI assistance whenever you need it</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              About The Everything AI
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-700 to-orange-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Pioneering AI Solutions for a Better Tomorrow
              </h3>

              <p className="text-white mb-6 text-lg">
                At The Everything AI, we're revolutionizing how individuals and
                businesses harness the power of artificial intelligence. Founded
                in 2023, our mission is to make advanced AI technologies
                accessible, practical, and transformative for everyday life.
              </p>

              <p className="text-white mb-8 text-lg">
                Our team of AI specialists, data scientists, and industry
                experts work together to create solutions that address
                real-world challenges across mental health, business analytics,
                and education.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg transition-transform duration-300 hover:-translate-y-2 border border-white/10">
                  <div className="text-purple-400 mb-2">
                    <Lightbulb className="h-10 w-10" />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-1">
                    Innovation
                  </h4>
                  <p className="text-white">Constantly pushing AI boundaries</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg transition-transform duration-300 hover:-translate-y-2 border border-white/10">
                  <div className="text-orange-400 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-1">Privacy</h4>
                  <p className="text-white">Your data safety is our priority</p>
                </div>
              </div>

              <a
                href="#services"
                className="inline-flex items-center text-purple-400 font-medium group hover:text-purple-300 transition-colors"
              >
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
                <div
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-orange-500 opacity-70 rounded-full animate-pulse"
                  style={{ animationDelay: "300ms" }}
                ></div>
                <div
                  className="absolute top-1/2 -right-8 w-8 h-8 bg-blue-500 opacity-70 rounded-full animate-pulse"
                  style={{ animationDelay: "700ms" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl text-center transform transition-transform duration-300 hover:-translate-y-2 border border-white/10">
              <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                96%
              </span>
              <p className="text-white mt-2">User Satisfaction</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl text-center transform transition-transform duration-300 hover:-translate-y-2 border border-white/10">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                10,000+
              </span>
              <p className="text-white mt-2">Users Worldwide</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl text-center transform transition-transform duration-300 hover:-translate-y-2 border border-white/10">
              <span className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-orange-400 bg-clip-text text-transparent">
                24/7
              </span>
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
                Ready to transform your experience? Send us a message and we'll
                get back to you soon.
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
