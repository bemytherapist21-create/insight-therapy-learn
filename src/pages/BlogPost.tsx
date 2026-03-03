import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { blogPosts } from "./Blog";

// Full blog content mapped by slug
const blogContent: Record<string, React.ReactNode> = {
    "unlock-antigravity-power-3-plugins": (
        <>
            <p className="text-lg leading-relaxed mb-6">
                Antigravity is powerful by itself. But if you are not using the right plugins, you are only using a small part of what it can really do. This guide explains three essential plugins that can turn Antigravity into a more reliable, accurate, and production-ready AI system: <strong>GSD</strong>, <strong>Ralph Loop</strong>, and <strong>CodeRabbit</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
                By the end of this guide, you will clearly understand what each plugin does, why it is important, and how to install and use it properly.
            </p>

            {/* === Plugin 1: GSD === */}
            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">1. GSD (Get Sh*t Done for Antigravity)</h2>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">What GSD Does</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
                GSD takes a big project and breaks it into small, clear, manageable tasks. Instead of asking AI to handle everything at once, GSD makes it focus on one small task at a time. This reduces confusion and improves accuracy.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                It helps solve two common AI problems:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6 pl-4">
                <li><strong>Hallucination</strong> — AI making up incorrect information</li>
                <li><strong>Context overload</strong> — AI forgetting earlier instructions in large projects</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-6">
                When tasks are small and isolated, the results become more predictable and stable.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Key Benefits</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">🧩 Task Decomposition</h4>
                    <p className="text-sm text-muted-foreground">Breaks large projects into small, isolated steps</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">🎯 Improved Accuracy</h4>
                    <p className="text-sm text-muted-foreground">Small tasks prevent AI from drifting or hallucinating</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">📈 Consistent Output</h4>
                    <p className="text-sm text-muted-foreground">Produces predictable and stable results every time</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">📋 Organized Workflow</h4>
                    <p className="text-sm text-muted-foreground">Keeps long projects clean and structured</p>
                </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Installation</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
                Repository: <a href="https://github.com/toonight/get-shit-done-for-antigravity" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">github.com/toonight/get-shit-done-for-antigravity</a>
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6 pl-4">
                <li>Clone the repository from GitHub</li>
                <li>Follow the setup instructions in the README file</li>
                <li>Register the plugin inside Antigravity as described in the documentation</li>
            </ol>
            <div className="glass-card rounded-xl p-4 mb-8">
                <code className="bg-muted px-3 py-1.5 rounded text-sm block overflow-x-auto">
                    git clone https://github.com/toonight/get-shit-done-for-antigravity.git
                </code>
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">How to Use</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8 pl-4">
                <li>Clearly define your project goal</li>
                <li>Let GSD divide it into small tasks</li>
                <li>Execute each task separately</li>
                <li>Keep the workflow clean and structured</li>
            </ul>

            {/* === Plugin 2: Ralph Loop === */}
            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">2. Ralph Loop</h2>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">What Ralph Loop Does</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Ralph Loop is an autonomous planning and execution agent. It reads your PRD (Product Requirements Document), checks current project progress, decides the next small task, builds the solution, tests whether it works, fixes issues if needed, and repeats the process until the result is correct.
            </p>

            {/* Loop diagram */}
            <div className="glass-card rounded-xl p-6 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-2 text-center">
                    <div className="glass-card rounded-lg px-4 py-3 min-w-[80px]">
                        <div className="text-lg mb-1">📄</div>
                        <span className="text-xs font-semibold text-muted-foreground">Read PRD</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="glass-card rounded-lg px-4 py-3 min-w-[80px]">
                        <div className="text-lg mb-1">🔍</div>
                        <span className="text-xs font-semibold text-muted-foreground">Check</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="glass-card rounded-lg px-4 py-3 min-w-[80px]">
                        <div className="text-lg mb-1">📋</div>
                        <span className="text-xs font-semibold text-muted-foreground">Decide</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="glass-card rounded-lg px-4 py-3 min-w-[80px]">
                        <div className="text-lg mb-1">🔨</div>
                        <span className="text-xs font-semibold text-muted-foreground">Build</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="glass-card rounded-lg px-4 py-3 min-w-[80px]">
                        <div className="text-lg mb-1">🧪</div>
                        <span className="text-xs font-semibold text-muted-foreground">Test</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="glass-card rounded-lg px-4 py-3 min-w-[80px]">
                        <div className="text-lg mb-1">🔧</div>
                        <span className="text-xs font-semibold text-muted-foreground">Fix</span>
                    </div>
                    <span className="text-primary font-bold text-lg">↻</span>
                </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Key Benefits</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">🤖 Autonomous</h4>
                    <p className="text-sm text-muted-foreground">Automatically decides the next step</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">🔄 Self-Correcting</h4>
                    <p className="text-sm text-muted-foreground">Tests its own output and fixes mistakes</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">⚡ Speeds Up Dev</h4>
                    <p className="text-sm text-muted-foreground">Eliminates constant manual instructions</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">💆 Reduces Workload</h4>
                    <p className="text-sm text-muted-foreground">Takes the mental burden off developers</p>
                </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Installation</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-8 pl-4">
                <li>Open Antigravity</li>
                <li>Go to Extensions</li>
                <li>Search for "Ralph Loop"</li>
                <li>Install and enable it</li>
            </ol>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">How to Use</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8 pl-4">
                <li>Provide a clear and detailed PRD</li>
                <li>Start the agent</li>
                <li>Let Ralph Loop plan, build, test, and improve</li>
                <li>Review the saved outputs as tasks are completed</li>
            </ul>

            {/* === Plugin 3: CodeRabbit === */}
            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">3. CodeRabbit</h2>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">What CodeRabbit Does</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
                CodeRabbit is a real-time AI code review tool. It reviews your code while you work, finds bugs before you run the program, suggests fixes using AI, and helps prevent serious production errors. It works like an extra senior developer reviewing your code instantly.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Key Benefits</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">🐛 Early Bug Detection</h4>
                    <p className="text-sm text-muted-foreground">Finds bugs before you even run the program</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">✨ Cleaner PRs</h4>
                    <p className="text-sm text-muted-foreground">Ensures pull requests are polished before merging</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">🛡️ Better Code Quality</h4>
                    <p className="text-sm text-muted-foreground">AI-powered fixes improve maintainability</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h4 className="font-bold text-foreground mb-2">🚀 Safer Deployments</h4>
                    <p className="text-sm text-muted-foreground">Prevents serious production errors from reaching users</p>
                </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Installation</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
                Website: <a href="https://www.coderabbit.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">coderabbit.ai</a>
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-8 pl-4">
                <li>Visit the website and sign up</li>
                <li>Connect your repository (GitHub, GitLab, etc.)</li>
                <li>Enable real-time code review</li>
                <li>Adjust review settings if needed</li>
            </ol>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">How to Use</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8 pl-4">
                <li>Write or update your code normally</li>
                <li>Let CodeRabbit review the changes automatically</li>
                <li>Apply the suggested fixes before merging or deploying</li>
            </ul>

            {/* === Recommended Workflow === */}
            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Recommended Workflow (Best Practice)</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                For best results, use all three plugins together:
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="glass-card rounded-xl p-5 text-center">
                    <div className="text-3xl mb-3">🧩</div>
                    <h4 className="font-bold text-foreground mb-2">1. GSD</h4>
                    <p className="text-sm text-muted-foreground">Break the project into small, manageable tasks</p>
                </div>
                <div className="glass-card rounded-xl p-5 text-center">
                    <div className="text-3xl mb-3">🔄</div>
                    <h4 className="font-bold text-foreground mb-2">2. Ralph Loop</h4>
                    <p className="text-sm text-muted-foreground">Plan, build, test, and improve automatically</p>
                </div>
                <div className="glass-card rounded-xl p-5 text-center">
                    <div className="text-3xl mb-3">🐇</div>
                    <h4 className="font-bold text-foreground mb-2">3. CodeRabbit</h4>
                    <p className="text-sm text-muted-foreground">Review and fix code continuously</p>
                </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">
                This combination helps you reduce AI mistakes, automate development steps, and produce more reliable, production-ready outputs.
            </p>

            {/* === Final Thoughts === */}
            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Final Thoughts</h2>
            <div className="glass-card rounded-xl p-6 mb-6">
                <blockquote className="text-lg font-medium italic text-foreground border-l-4 border-primary pl-4">
                    "Using Antigravity without these plugins is like driving a high-performance car without proper controls."
                </blockquote>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
                When you combine <strong>GSD</strong>, <strong>Ralph Loop</strong>, and <strong>CodeRabbit</strong>, you unlock most of Antigravity's real potential. If you want serious, structured, production-level AI development — this is the setup you should use.
            </p>
        </>
    ),
};

const BlogPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const post = blogPosts.find((p) => p.slug === slug);
    const content = slug ? blogContent[slug] : null;

    if (!post || !content) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        Post Not Found
                    </h1>
                    <Link to="/blog" className="text-primary hover:underline">
                        ← Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Back Link */}
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </Link>

                {/* Cover */}
                <div
                    className={`h-56 md:h-72 bg-gradient-to-br ${post.coverGradient} rounded-2xl flex items-end p-8 mb-8`}
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

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                    {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10 pb-6 border-b border-muted">
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
                </div>

                {/* Content */}
                <article className="prose prose-invert max-w-none">{content}</article>
            </div>
        </div>
    );
};

export default BlogPost;
