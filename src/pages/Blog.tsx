import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface BlogPostMeta {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    author: string;
    gradient: string;
    icon: React.ElementType;
}

export const blogPosts: BlogPostMeta[] = [
    {
        slug: "unlock-antigravity-power-3-plugins",
        title: "How to Unlock 90% of Antigravity's Power Using 3 Simple Plugins",
        excerpt:
            "A complete guide to three essential plugins — GSD, Ralph Loop, and CodeRabbit — that turn Antigravity into a reliable, accurate, and production-ready AI development system.",
        date: "March 3, 2026",
        readTime: "8 min read",
        author: "The Everything AI",
        gradient: "from-violet-600 via-purple-600 to-fuchsia-500",
        icon: Zap,
    },
    {
        slug: "black-mirror-gadgets",
        title: "Black Mirror Gadgets: What's Real, What's Coming, and What's Yours to Build",
        excerpt:
            "A classified technology assessment tracking every Black Mirror gadget — which ones already exist, which are in development, and which are wide open for first movers.",
        date: "March 9, 2026",
        readTime: "10 min read",
        author: "The Everything AI",
        gradient: "from-red-600 via-gray-900 to-black",
        icon: BookOpen,
    },
];

const Blog = () => {
    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#8A2BE2] to-[#FF8C00] bg-clip-text text-transparent mb-4 pb-2">
                        Blog
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Stories, insights, and case studies from our projects and experiments in AI, web development, and technology.
                    </p>
                </div>

                {/* Blog Posts Grid - Card format like services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {blogPosts.map((post, index) => (
                        <Link key={post.slug} to={`/blog/${post.slug}`}>
                            <Card
                                className="glass-card hover-lift cursor-pointer group animate-scale-in h-full"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardHeader className="text-center">
                                    <div
                                        className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${post.gradient} p-4 mb-4 group-hover:shadow-glow transition-all duration-300`}
                                    >
                                        <post.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                                        {post.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-muted-foreground text-center mb-4">
                                        {post.excerpt}
                                    </CardDescription>
                                    <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                                        Read More <ArrowRight className="w-4 h-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
