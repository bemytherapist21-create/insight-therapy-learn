import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";

export interface BlogPostMeta {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    author: string;
    coverGradient: string;
    tags: string[];
}

export const blogPosts: BlogPostMeta[] = [
    {
        slug: "crisp-and-clean-ironing-service-app",
        title: "Building Crisp & Clean — A Local Ironing Service PWA",
        excerpt:
            "How we built a modern Progressive Web App for a local ironing service that lets customers pick items, place orders via WhatsApp, and track their ironing status — all without downloading from an app store.",
        date: "March 3, 2026",
        readTime: "5 min read",
        author: "The Everything AI",
        coverGradient: "from-indigo-600 via-purple-600 to-pink-500",
        tags: ["PWA", "React", "WhatsApp Integration", "Local Business"],
    },
];

const Blog = () => {
    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#8A2BE2] to-[#FF8C00] bg-clip-text text-transparent mb-4">
                        Blog
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Stories, insights, and case studies from our projects and experiments in AI, web development, and technology.
                    </p>
                </div>

                {/* Blog Posts Grid */}
                <div className="flex flex-col gap-8">
                    {blogPosts.map((post) => (
                        <Link
                            key={post.slug}
                            to={`/blog/${post.slug}`}
                            className="group block"
                        >
                            <article className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
                                {/* Cover Gradient */}
                                <div
                                    className={`h-48 bg-gradient-to-br ${post.coverGradient} flex items-end p-6`}
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-3">
                                        {post.title}
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        {post.excerpt}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" />
                                            {post.author}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {post.readTime}
                                        </span>
                                        <span className="ml-auto text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Read More <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
