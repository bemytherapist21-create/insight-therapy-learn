import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, User, Sparkles } from "lucide-react";

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
        slug: "black-mirror-gadgets",
        title: "Black Mirror Gadgets: What's Real, What's Coming, and What's Yours to Build",
        excerpt:
            "A classified technology assessment tracking every Black Mirror gadget — which ones already exist, which are in development, and which are wide open for first movers.",
        date: "March 9, 2026",
        readTime: "10 min read",
        author: "The Everything AI",
        coverGradient: "from-red-600 via-gray-900 to-black",
        tags: ["Black Mirror", "Technology", "AI", "Future Tech"],
    },
    {
        slug: "unlock-antigravity-power-3-plugins",
        title: "How to Unlock 90% of Antigravity's Power Using 3 Simple Plugins",
        excerpt:
            "A complete guide to three essential plugins — GSD, Ralph Loop, and CodeRabbit — that turn Antigravity into a reliable, accurate, and production-ready AI development system.",
        date: "March 3, 2026",
        readTime: "8 min read",
        author: "The Everything AI",
        coverGradient: "from-violet-600 via-purple-600 to-fuchsia-500",
        tags: ["Antigravity", "Plugins", "AI Development", "Productivity"],
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

                {/* Featured Guide Box */}
                <div className="mb-12">
                    <div
                        onClick={() => (window.location.href = "/blog/unlock-antigravity-power-3-plugins")}
                        className="glass-card p-8 rounded-3xl border-primary/30 cursor-pointer overflow-hidden relative group hover:shadow-glow transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/20">
                                <Sparkles className="w-12 h-12 text-white animate-pulse" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
                                    Use Antigravity to its <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">maximum potential</span>
                                </h2>
                                <p className="text-white/70 text-lg mb-4">
                                    Master the essential plugins and elite workflows that turn Antigravity into a production-ready AI powerhouse.
                                </p>
                                <div className="inline-flex items-center gap-2 text-primary font-bold text-lg group-hover:gap-3 transition-all">
                                    Get the Elite Guide <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />
                    </div>
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
