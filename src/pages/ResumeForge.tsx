import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/safeClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  Building2,
  ClipboardList,
  Sparkles,
  Download,
  Loader2,
  CheckCircle2,
  Lock,
  History,
} from "lucide-react";

const PRODUCT_SLUG = "resume-forge";
const PRODUCT_PRICE = 9900; // ₹99 in paise

const steps = [
  { icon: FileText, label: "Resume", description: "Paste your resume" },
  { icon: Building2, label: "Company", description: "Target company" },
  { icon: ClipboardList, label: "Job Description", description: "Paste the JD" },
  { icon: Sparkles, label: "Generate", description: "Get your resume" },
];

const ResumeForge = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeText, setResumeText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pastGenerations, setPastGenerations] = useState<any[]>([]);

  // Check if user has an unused (pending generation) purchase
  useEffect(() => {
    if (!user) {
      setCheckingPayment(false);
      return;
    }
    (async () => {
      try {
        const { data } = await supabase
          .from("product_purchases" as any)
          .select("id")
          .eq("user_id", user.id)
          .eq("product_slug", PRODUCT_SLUG)
          .eq("status", "paid")
          .maybeSingle();
        if (data) setHasPaid(true);
      } catch {
        // ignore
      } finally {
        setCheckingPayment(false);
      }
    })();
  }, [user]);

  const handlePayment = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setPaymentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-product-order", {
        body: { userId: user.id, email: user.email, productSlug: PRODUCT_SLUG, amount: PRODUCT_PRICE },
      });
      if (error) throw error;

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "The Everything AI",
        description: "Resume Brandifier – One-time access",
        order_id: data.orderId,
        prefill: { email: user.email || "" },
        handler: async (response: any) => {
          const { error: verifyError } = await supabase.functions.invoke("verify-product-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
              productSlug: PRODUCT_SLUG,
            },
          });
          if (verifyError) {
            toast.error("Payment verification failed");
          } else {
            toast.success("Payment successful! You can now use Resume Brandifier.");
            setHasPaid(true);
          }
        },
        theme: { color: "#10b981" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to start checkout");
    } finally {
      setPaymentLoading(false);
    }
  }, [user]);

  const handleGenerate = useCallback(async () => {
    if (!resumeText || !companyName || !jobDescription) {
      toast.error("Please fill all steps first");
      return;
    }
    setGenerating(true);
    try {
      // Log generation start
      let genId: string | null = null;
      if (user) {
        const { data: genRow } = await supabase
          .from("resume_generations" as any)
          .insert({
            user_id: user.id,
            user_email: user.email || "",
            company_name: companyName,
            company_website: companyWebsite || null,
            job_description_snippet: jobDescription.slice(0, 200),
            status: "generating",
          } as any)
          .select("id")
          .single();
        if (genRow) genId = (genRow as any).id;
      }

      const { data, error } = await supabase.functions.invoke("generate-resume", {
        body: { resumeText, companyName, companyWebsite, jobDescription },
      });
      if (error) throw error;
      setGeneratedHtml(data.html);
      toast.success("Resume generated!");

      // Mark generation as completed
      if (user && genId) {
        await supabase
          .from("resume_generations" as any)
          .update({ status: "completed" } as any)
          .eq("id", genId);
      }

      // Mark purchase as used so next generation requires new payment
      if (user) {
        await supabase
          .from("product_purchases" as any)
          .update({ status: "used" } as any)
          .eq("user_id", user.id)
          .eq("product_slug", PRODUCT_SLUG)
          .eq("status", "paid");
        setHasPaid(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [resumeText, companyName, companyWebsite, jobDescription, user]);

  const downloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName.replace(/\s+/g, "_")}_Resume.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Card className="glass-card max-w-md w-full text-center p-8">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to use Resume Brandifier.</p>
          <Button asChild>
            <a href="/login?redirect=/experiments/resume-forge">Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  if (checkingPayment) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPaid) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Card className="glass-card max-w-md w-full text-center p-8">
          <Sparkles className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Resume Brandifier</h2>
          <p className="text-muted-foreground mb-4">
            Generate a stunning, company-branded HTML resume with 3-theme toggle.
          </p>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-6">
            <p className="text-3xl font-bold text-foreground">
              ₹99 <span className="text-sm font-normal text-muted-foreground">per resume</span>
            </p>
          </div>
          <Button onClick={handlePayment} disabled={paymentLoading} className="w-full" size="lg">
            {paymentLoading ? "Loading..." : "Pay ₹99 & Unlock"}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Secured by Razorpay. UPI, cards & wallets.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-8 pb-2">
          Resume Brandifier
        </h1>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => i <= (generatedHtml ? 3 : 2) && setCurrentStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                i === currentStep
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : i < currentStep || (i === 3 && generatedHtml)
                    ? "text-emerald-400/70"
                    : "text-muted-foreground"
              }`}
            >
              {i < currentStep || (i === 3 && generatedHtml) ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Step 1: Paste Your Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={14}
                className="bg-background/50"
              />
              <Button onClick={() => setCurrentStep(1)} disabled={!resumeText.trim()}>
                Next →
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Step 2: Target Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Company name (e.g. Google)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-background/50"
              />
              <Input
                placeholder="Company website (optional)"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="bg-background/50"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  ← Back
                </Button>
                <Button onClick={() => setCurrentStep(2)} disabled={!companyName.trim()}>
                  Next →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Step 3: Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={14}
                className="bg-background/50"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  ← Back
                </Button>
                <Button
                  onClick={() => {
                    setCurrentStep(3);
                    handleGenerate();
                  }}
                  disabled={!jobDescription.trim()}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Generate Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            {generating ? (
              <Card className="glass-card p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-emerald-400 mb-4" />
                <p className="text-lg text-muted-foreground">
                  Generating your company-branded resume...
                </p>
                <p className="text-sm text-muted-foreground mt-2">This may take 30-60 seconds</p>
              </Card>
            ) : generatedHtml ? (
              <>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-sm">
                    Preview
                  </Badge>
                  <Button onClick={downloadHtml} size="sm">
                    <Download className="w-4 h-4 mr-2" /> Download HTML
                  </Button>
                </div>
                <div className="rounded-lg border border-border overflow-hidden bg-white">
                  <iframe
                    srcDoc={generatedHtml}
                    className="w-full min-h-[80vh] border-0"
                    title="Generated Resume Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </>
            ) : (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">Generation failed. Please try again.</p>
                <Button onClick={() => setCurrentStep(2)} variant="outline" className="mt-4">
                  ← Go Back
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeForge;
