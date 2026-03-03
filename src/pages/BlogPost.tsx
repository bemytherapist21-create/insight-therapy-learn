import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, ExternalLink } from "lucide-react";
import { blogPosts } from "./Blog";

// Full blog content mapped by slug
const blogContent: Record<string, React.ReactNode> = {
    "crisp-and-clean-ironing-service-app": (
        <>
            <p className="text-lg leading-relaxed mb-6">
                In a world of complex apps, sometimes the most impactful solutions are the simplest ones. We recently built <strong>Crisp &amp; Clean</strong>, a Progressive Web App (PWA) for a local ironing service that lets nearby customers select what they want ironed, place an order via WhatsApp, and track whether their clothes are ready for pickup — all without downloading anything from an app store.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Problem</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                A local ironing shop wanted a simple way for customers to place orders digitally. The shop doesn't offer pickup or drop-off — customers bring their own items and collect them once ironed. The owner wanted a system where:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6 pl-4">
                <li>Customers can browse item categories (Men, Women, Kids, Home Linen, Accessories, Winter Wear)</li>
                <li>Each item costs a flat <strong>₹10</strong></li>
                <li>Orders are confirmed via WhatsApp to the shop owner's number</li>
                <li>The shop owner can update the order status (e.g., "Ironing In Progress" → "Ready for Pickup")</li>
                <li>Customers can see the live status of their order</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Solution</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                We built a responsive, single-page React application using <strong>Vite</strong> with a premium glassmorphic design. The app features three main tabs:
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="glass-card rounded-xl p-5">
                    <h3 className="font-bold text-foreground mb-2">🏠 Home</h3>
                    <p className="text-sm text-muted-foreground">Browse categories, add items to cart, and review your order before confirming via WhatsApp.</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h3 className="font-bold text-foreground mb-2">📋 My Orders</h3>
                    <p className="text-sm text-muted-foreground">Track the real-time status of your orders — from "Pending Drop-off" to "Ready for Pickup".</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <h3 className="font-bold text-foreground mb-2">🛡️ Shop Dashboard</h3>
                    <p className="text-sm text-muted-foreground">The shop owner can view all orders and update their status with a single tap.</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Key Features</h2>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">WhatsApp Integration</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
                When a customer confirms their order, the app generates a pre-filled WhatsApp message with the complete order breakdown — item names, quantities, total price, and the shop's Google Maps location. The message is sent directly to the shop owner's WhatsApp number (+91 70834 92882).
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Order Tracking via localStorage</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Since this is a local, low-traffic application, we used the browser's <code className="bg-muted px-2 py-0.5 rounded text-sm">localStorage</code> as a simple data store. Orders are saved locally with their status, and the shop owner can transition them through the status flow: <em>Pending Drop-off → Ironing In Progress → Ready for Pickup</em>.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Google Maps Location</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The shop's coordinates (<strong>18°36'24.4"N 73°56'04.2"E</strong>) are embedded directly in the checkout flow. Customers see a clickable "View Shop Location on Map" link, and the same location is included in the WhatsApp confirmation message.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Progressive Web App (PWA)</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The app is configured as a PWA using <code className="bg-muted px-2 py-0.5 rounded text-sm">vite-plugin-pwa</code>. Once hosted, customers visiting the URL on their phone will be prompted to "Add to Home Screen". The app installs with a custom icon and runs in standalone mode — looking and feeling like a native app without requiring any app store submission.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Tech Stack</h2>
            <div className="glass-card rounded-xl p-6 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="font-semibold text-foreground">Vite</div>
                        <div className="text-xs text-muted-foreground">Build Tool</div>
                    </div>
                    <div>
                        <div className="text-2xl mb-1">⚛️</div>
                        <div className="font-semibold text-foreground">React</div>
                        <div className="text-xs text-muted-foreground">UI Library</div>
                    </div>
                    <div>
                        <div className="text-2xl mb-1">🎨</div>
                        <div className="font-semibold text-foreground">Vanilla CSS</div>
                        <div className="text-xs text-muted-foreground">Styling</div>
                    </div>
                    <div>
                        <div className="text-2xl mb-1">📱</div>
                        <div className="font-semibold text-foreground">PWA</div>
                        <div className="text-xs text-muted-foreground">Installable</div>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Takeaways</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Not every business needs a complex backend or a native mobile app. For hyperlocal services with a small customer base, a well-designed PWA with WhatsApp integration can be the perfect solution — fast to build, free to host, and zero friction for customers. Sometimes, the best technology is the one that gets out of the way and just works.
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
