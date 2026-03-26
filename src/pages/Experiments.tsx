import { Link } from "react-router-dom";
import { FileText, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const products = [
  {
    slug: "resume-brandifier",
    icon: FileText,
    title: "Resume Brandifier",
    description:
      "Upload your resume, enter a target company & job description, and get a stunning company-branded HTML resume with 3-theme toggle.",
    price: "₹99/resume",
    gradient: "from-emerald-500 to-teal-500",
    requiresLogin: true,
    badge: null as string | null,
  },
  {
    slug: "open-mind",
    icon: null as any,
    title: "Open Mind",
    description:
      "Chat with 26+ open-source AI models — including GPT-OSS, DeepSeek R1, Qwen3, LLaMA, Mistral, vision models & more. Select any model, upload images, generate code, and explore AI freely.",
    price: "FREE",
    gradient: "from-cyan-500 to-teal-500",
    requiresLogin: false,
    badge: "26+ AI Models",
    externalUrl: "https://openmind.theeverythingai.com",
    logoUrl: "https://openmind.theeverythingai.com/logo.png",
  },
];

const Experiments = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4 pb-2">
            Experimentation Products
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Try our cutting-edge experimental AI tools. Each product is a
            standalone experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => {
            const cardContent = (
              <Card className="glass-card hover-lift cursor-pointer group animate-scale-in h-full">
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${product.gradient} p-3 mb-4 group-hover:shadow-glow transition-all duration-300 flex items-center justify-center`}
                  >
                    {(product as any).logoUrl ? (
                      <img src={(product as any).logoUrl} alt={product.title} className="w-10 h-10 rounded-lg" />
                    ) : (
                      product.icon && <product.icon className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">
                    {product.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <CardDescription className="text-muted-foreground">
                    {product.description}
                  </CardDescription>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-sm">
                      {product.price}
                    </Badge>
                    {product.requiresLogin && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" /> Login Required
                      </Badge>
                    )}
                    {product.badge && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 border-teal-500/50 text-teal-400"
                      >
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );

            if ((product as any).externalUrl) {
              return (
                <a key={product.slug} href={(product as any).externalUrl} target="_blank" rel="noopener noreferrer">
                  {cardContent}
                </a>
              );
            }
            return (
              <Link key={product.slug} to={`/experiments/${product.slug}`}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Experiments;
