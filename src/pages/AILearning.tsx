import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  Star,
  Clock,
  Users,
  Download,
  Play,
} from "lucide-react";

const AILearning = () => {
  const learningCategories = [
    {
      title: "AI Fundamentals",
      description:
        "Master the basics of artificial intelligence and machine learning",
      icon: GraduationCap,
      materials: 15,
      hours: 24,
      level: "Beginner",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      title: "Business Applications",
      description:
        "Learn how to implement AI solutions in real business scenarios",
      icon: BookOpen,
      materials: 22,
      hours: 36,
      level: "Intermediate",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Advanced Techniques",
      description:
        "Deep dive into cutting-edge AI technologies and methodologies",
      icon: Video,
      materials: 18,
      hours: 42,
      level: "Advanced",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const featuredContent = [
    {
      type: "Video Course",
      title: "Introduction to Neural Networks",
      description:
        "Comprehensive guide to understanding neural networks from scratch",
      duration: "3.5 hours",
      rating: 4.9,
      students: 1247,
      icon: Play,
    },
    {
      type: "eBook",
      title: "The Future of AI in Business",
      description:
        "Strategic insights on implementing AI in modern enterprises",
      duration: "120 pages",
      rating: 4.8,
      students: 892,
      icon: FileText,
    },
    {
      type: "Interactive Workshop",
      title: "Hands-on Machine Learning",
      description: "Build your first ML model with step-by-step guidance",
      duration: "5 hours",
      rating: 4.9,
      students: 2156,
      icon: GraduationCap,
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-500";
      case "Intermediate":
        return "bg-yellow-500";
      case "Advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              AI-Powered Learning
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Access cutting-edge educational materials and AI-driven learning
              experiences. Master artificial intelligence with our comprehensive
              learning resources.
            </p>

            <div className="glass-card max-w-lg mx-auto p-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
                <BookOpen className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Ready to Learn?
              </h3>
              <p className="text-white/70 mb-4">
                Access our complete learning library
              </p>
              <Button
                size="lg"
                className="bg-gradient-primary hover:shadow-glow w-full animate-glow-pulse"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Access Google Drive Library
              </Button>
            </div>
          </div>

          {/* Learning Categories */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {learningCategories.map((category, index) => (
              <Card
                key={category.title}
                className="glass-card hover-lift animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${category.gradient} p-4 mb-4 group-hover:shadow-glow transition-all duration-300`}
                  >
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex justify-center mb-2">
                    <Badge
                      className={`${getLevelColor(category.level)} text-white`}
                    >
                      {category.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl text-white group-hover:text-primary transition-colors text-center">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-white/70 text-center">
                    {category.description}
                  </CardDescription>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">
                        {category.materials}
                      </div>
                      <div className="text-xs text-white/60">Materials</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">
                        {category.hours}h
                      </div>
                      <div className="text-xs text-white/60">Duration</div>
                    </div>
                  </div>

                  <Button
                    className={`w-full bg-gradient-to-r ${category.gradient} hover:shadow-glow transition-all duration-300`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Explore Materials
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Featured Content */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12 animate-fade-in">
              Featured Learning Content
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredContent.map((content, index) => (
                <Card
                  key={content.title}
                  className="glass-card hover-lift animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                      <Badge
                        variant="secondary"
                        className="bg-gradient-primary text-primary-foreground"
                      >
                        {content.type}
                      </Badge>
                      <content.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-white">
                      {content.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-white/70">
                      {content.description}
                    </CardDescription>

                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {content.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {content.rating}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-white/60">
                      <Users className="w-4 h-4" />
                      {content.students.toLocaleString()} students
                    </div>

                    <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-glow transition-all duration-300">
                      <Download className="w-4 h-4 mr-2" />
                      Access Content
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Google Drive Integration */}
          <div className="text-center">
            <Card className="glass-card max-w-4xl mx-auto animate-fade-in">
              <CardContent className="p-12">
                <ExternalLink className="w-20 h-20 mx-auto mb-6 text-primary" />
                <h3 className="text-3xl font-bold text-white mb-4">
                  Complete Learning Library
                </h3>
                <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                  Access our comprehensive collection of AI learning materials,
                  including videos, documents, worksheets, and interactive
                  content directly from our Google Drive repository.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Open Google Drive Library
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white hover:text-gray-900"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Browse Course Catalog
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

export default AILearning;
