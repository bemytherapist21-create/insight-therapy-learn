import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Briefcase, Loader2 } from "lucide-react";

interface BusinessContextFormProps {
  onSubmit: (context: Record<string, string>) => void;
  isGenerating: boolean;
}

const BusinessContextForm = ({ onSubmit, isGenerating }: BusinessContextFormProps) => {
  const [context, setContext] = useState({
    businessType: "",
    revenueModel: "",
    geography: "",
    targetAudience: "",
    kpiPriorities: "",
    growthStage: "",
    additionalContext: "",
  });

  const update = (key: string, value: string) =>
    setContext((prev) => ({ ...prev, [key]: value }));

  const fields = [
    { key: "businessType", label: "Business Type", placeholder: "e.g., Fintech, SaaS, E-commerce", type: "input" },
    { key: "revenueModel", label: "Revenue Model", placeholder: "How does the company make money?", type: "input" },
    { key: "geography", label: "Geography / Markets", placeholder: "e.g., India, US, Global", type: "input" },
    { key: "targetAudience", label: "Target Audience", placeholder: "Who are your customers?", type: "input" },
    { key: "kpiPriorities", label: "KPI Priorities", placeholder: "e.g., Revenue growth, CAC, LTV, Churn", type: "input" },
    { key: "growthStage", label: "Growth Stage", placeholder: "e.g., Startup, Scale-up, Enterprise", type: "input" },
    { key: "additionalContext", label: "Additional Context", placeholder: "Any other details the AI should know about your business, cost drivers, regulatory exposure, etc.", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="w-5 h-5 text-primary" />
        <h3 className="text-white font-semibold">Business Context</h3>
      </div>
      <p className="text-white/60 text-sm">
        Help the AI understand your business so it can provide more accurate, actionable insights.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key} className={type === "textarea" ? "md:col-span-2" : ""}>
            <Label className="text-white/80 mb-1.5 block">{label}</Label>
            {type === "textarea" ? (
              <Textarea
                placeholder={placeholder}
                value={context[key as keyof typeof context]}
                onChange={(e) => update(key, e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px]"
              />
            ) : (
              <Input
                placeholder={placeholder}
                value={context[key as keyof typeof context]}
                onChange={(e) => update(key, e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={() => onSubmit(context)}
        disabled={isGenerating || !context.businessType.trim()}
        className="w-full bg-gradient-primary hover:shadow-glow"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Insights...
          </>
        ) : (
          "Generate Insights"
        )}
      </Button>
    </div>
  );
};

export default BusinessContextForm;
