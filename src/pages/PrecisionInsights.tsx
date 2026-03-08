import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Columns, Briefcase, BarChart3, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/safeClient";
import { useUsageGate } from "@/hooks/useUsageGate";
import { PaywallModal } from "@/components/PaywallModal";
import FileUploader from "@/components/insights/FileUploader";
import ColumnDefinitionForm from "@/components/insights/ColumnDefinitionForm";
import BusinessContextForm from "@/components/insights/BusinessContextForm";
import InsightsDashboard from "@/components/insights/InsightsDashboard";

type Step = "upload" | "define" | "context" | "dashboard";

interface ParsedStructure {
    sheets: {
        name: string;
        columns: {
            name: string;
            dataType: string;
            nullPercentage?: number;
            uniqueValues?: number;
            sampleValues?: string[];
            summary?: string;
        }[];
        rowCount?: number;
    }[];
}

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
    { id: "upload", label: "Upload", icon: Upload },
    { id: "define", label: "Define", icon: Columns },
    { id: "context", label: "Context", icon: Briefcase },
    { id: "dashboard", label: "Insights", icon: BarChart3 },
];

const PrecisionInsights = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<Step>("upload");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [parsedStructure, setParsedStructure] = useState<ParsedStructure | null>(null);
    const [columnDefinitions, setColumnDefinitions] = useState<Record<string, string>>({});
    const [insights, setInsights] = useState<any>(null);
    const [fileContent, setFileContent] = useState("");

    const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

    const handleFileProcessed = async (content: string, fileName: string) => {
        setIsProcessing(true);
        setFileContent(content);
        try {
            const { data, error } = await supabase.functions.invoke("analyze-data", {
                body: { mode: "parse", fileContent: content, fileName },
            });

            if (error) throw error;
            if (data?.error) {
                toast.error(data.error);
                return;
            }

            setParsedStructure(data.structure);
            setCurrentStep("define");
            toast.success("File structure analyzed successfully!");
        } catch (err: any) {
            console.error("Parse error:", err);
            toast.error(err.message || "Failed to analyze file.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleColumnDefinitions = (defs: Record<string, string>) => {
        setColumnDefinitions(defs);
        setCurrentStep("context");
    };

    const handleBusinessContext = async (context: Record<string, string>) => {
        setIsGenerating(true);
        setCurrentStep("dashboard");
        setInsights({});

        try {
            const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-data`;
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({
                    mode: "insights",
                    parsedStructure,
                    columnDefinitions,
                    businessContext: context,
                }),
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                if (resp.status === 429) {
                    toast.error("Rate limited. Please wait a moment and try again.");
                } else if (resp.status === 402) {
                    toast.error("AI credits exhausted. Please add credits.");
                } else {
                    toast.error(errData.error || "Failed to generate insights.");
                }
                setIsGenerating(false);
                return;
            }

            if (!resp.body) throw new Error("No response body");

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let textBuffer = "";
            let fullContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                textBuffer += decoder.decode(value, { stream: true });

                let newlineIndex: number;
                while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
                    let line = textBuffer.slice(0, newlineIndex);
                    textBuffer = textBuffer.slice(newlineIndex + 1);
                    if (line.endsWith("\r")) line = line.slice(0, -1);
                    if (line.startsWith(":") || line.trim() === "") continue;
                    if (!line.startsWith("data: ")) continue;
                    const jsonStr = line.slice(6).trim();
                    if (jsonStr === "[DONE]") break;
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) fullContent += content;
                        // Update streaming UI if possible
                    } catch {
                        textBuffer = line + "\n" + textBuffer;
                        break;
                    }
                }
            }

            // Parse the accumulated JSON response
            try {
                const jsonMatch = fullContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, fullContent];
                const cleanJson = (jsonMatch[1] || fullContent).trim();
                const parsedInsights = JSON.parse(cleanJson);
                setInsights(parsedInsights);
                toast.success("Insights generated successfully!");
            } catch {
                setInsights({ executive_summary: fullContent });
                toast.info("Insights generated (raw format).");
            }
        } catch (err: any) {
            console.error("Insights error:", err);
            toast.error("Failed to generate insights.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/insight-fusion")}
                        className="text-white/70 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Precision Insights</h1>
                        <p className="text-white/60 text-sm">
                            AI-powered data analysis and business intelligence
                        </p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {steps.map((step, i) => {
                        const isActive = i === currentStepIndex;
                        const isComplete = i < currentStepIndex;
                        const Icon = step.icon;
                        return (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isActive
                                            ? "bg-primary/20 border border-primary text-primary"
                                            : isComplete
                                                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                                                : "bg-white/5 border border-white/10 text-white/40"
                                        }`}
                                >
                                    {isComplete ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                    <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div
                                        className={`w-8 h-0.5 mx-1 ${isComplete ? "bg-green-500/50" : "bg-white/10"
                                            }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <div className="glass-card rounded-2xl p-6 md:p-8">
                    {currentStep === "upload" && (
                        <FileUploader onFileProcessed={handleFileProcessed} isProcessing={isProcessing} />
                    )}

                    {currentStep === "define" && parsedStructure && (
                        <ColumnDefinitionForm structure={parsedStructure} onSubmit={handleColumnDefinitions} />
                    )}

                    {currentStep === "context" && (
                        <BusinessContextForm onSubmit={handleBusinessContext} isGenerating={isGenerating} />
                    )}

                    {currentStep === "dashboard" && insights && (
                        <InsightsDashboard insights={insights} isStreaming={isGenerating} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrecisionInsights;
