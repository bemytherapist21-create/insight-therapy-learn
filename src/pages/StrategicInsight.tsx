import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, BookOpen, ArrowLeft } from "lucide-react";
import { researchService, ResearchResult } from "@/services/researchService";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const StrategicInsight = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);

  useEffect(() => {
    if (query) {
      generateInsight();
    }
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [query]);

  const generateInsight = async () => {
    if (!query.trim()) {
      toast.error("Please provide a research question");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await researchService.generateInsight(query);
      setResult(data);
      if (!data) {
        toast.error("Failed to generate insight. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Process content to make citation numbers clickable
  const processContent = (content: string, citations: string[]) => {
    if (!citations || citations.length === 0) return content;

    // Replace citation markers [1], [2], etc. with clickable superscript links
    let processedContent = content;
    citations.forEach((_, index) => {
      const citationNum = index + 1;
      const regex = new RegExp(`\\[${citationNum}\\]`, "g");
      processedContent = processedContent.replace(
        regex,
        `<sup><a href="#citation-${citationNum}" class="text-blue-400 hover:text-blue-300 font-bold">[${citationNum}]</a></sup>`,
      );
    });

    return processedContent;
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/insight-fusion")}
            className="mb-6 text-white hover:text-purple-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to InsightFusion
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Strategic Market Research
            </h1>
            <div className="glass-card p-4 inline-block">
              <p className="text-white/80 text-lg">
                Analyzing:{" "}
                <span className="text-purple-400 font-semibold">{query}</span>
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card className="glass-card border-purple-500/30">
              <CardContent className="p-12 text-center">
                <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Analyzing Market Data...
                </h3>
                <p className="text-white/60">
                  Consulting AI-powered research sources
                </p>
                <p className="text-white/40 text-sm mt-2">
                  Usually takes 10-15 seconds
                </p>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {result && !loading && (
            <Card className="glass-card border-purple-500/30 animate-scale-in">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Lightbulb className="w-6 h-6 mr-3 text-yellow-400" />
                    Strategic Brief
                  </h3>
                  <div className="prose prose-invert prose-headings:text-white prose-p:text-white/90 prose-p:leading-relaxed prose-p:mb-8 prose-li:text-white/90 prose-li:mb-4 prose-ul:mb-8 prose-ol:mb-8 prose-strong:text-white prose-strong:font-bold prose-a:text-blue-400 prose-table:text-white/90 max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-6">
                            <table
                              className="min-w-full border border-white/20 rounded-lg"
                              {...props}
                            />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead className="bg-white/10" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className="px-4 py-3 text-left border border-white/20 font-semibold"
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            className="px-4 py-2 border border-white/20"
                            {...props}
                          />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className="text-blue-400 hover:text-blue-300 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-8 leading-relaxed" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="mb-8 space-y-4" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="mb-8 space-y-4" {...props} />
                        ),
                      }}
                    >
                      {processContent(result.content, result.citations || [])}
                    </ReactMarkdown>
                  </div>
                </div>

                {result.citations && result.citations.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                      Research Sources
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {result.citations.map((cite, i) => (
                        <div
                          key={i}
                          id={`citation-${i + 1}`}
                          className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                              {i + 1}
                            </span>
                            <a
                              href={cite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-sm text-blue-400 hover:text-blue-300 hover:underline break-all"
                            >
                              {cite}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate("/insight-fusion")}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-glow"
                  >
                    New Research Query
                  </Button>
                  <Button
                    onClick={generateInsight}
                    variant="outline"
                    className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                  >
                    Regenerate Insight
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {!loading && !result && query && (
            <Card className="glass-card border-red-500/30">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-red-400 mb-2">
                  Failed to Generate Insight
                </h3>
                <p className="text-white/60 mb-6">
                  Unable to fetch research data. Please try again.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={generateInsight}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    Retry
                  </Button>
                  <Button
                    onClick={() => navigate("/insight-fusion")}
                    variant="outline"
                    className="border-white/20"
                  >
                    Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategicInsight;
