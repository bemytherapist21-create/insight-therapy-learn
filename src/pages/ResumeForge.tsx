import { useState, useCallback, useEffect, useRef } from "react";
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
  Loader2,
  CheckCircle2,
  Lock,
  History,
  Upload,
  X,
} from "lucide-react";
import { GenerationProgress } from "@/components/resume/GenerationProgress";
import { ResumePreview } from "@/components/resume/ResumePreview";

const PRODUCT_SLUG = "resume-forge";
const PRODUCT_PRICE = 9900; // ₹99 in paise
const OPAL_URL = "https://opal.google/app/1oETbkY7XfWfZ4TWt-riq6z6mRzx4OjAj";

const steps = [
  { icon: FileText, label: "Resume", description: "Upload or paste resume" },
  { icon: Building2, label: "Company", description: "Target company" },
  { icon: ClipboardList, label: "Job Description", description: "Paste the JD" },
  { icon: Sparkles, label: "Generate", description: "Get your resume" },
];

const WHITELISTED_EMAILS = ["bhupeshpandey62@gmail.com"];

const ResumeForge = () => {
  const { user } = useAuth();
  const isWhitelisted = user?.email ? WHITELISTED_EMAILS.includes(user.email) : false;
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileProcessing, setFileProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract text from an uploaded file (PDF, DOCX, or TXT)
  const processUploadedFile = useCallback(async (file: File) => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setFileProcessing(true);
    setUploadedFile(file);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "txt") {
        const text = await file.text();
        setResumeText(text);
        toast.success(`Loaded ${file.name}`);
      } else if (ext === "pdf") {
        const pdfjsLib = await import(
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/+esm" as any
        );
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n\n";
        }
        setResumeText(fullText.trim());
        toast.success(`Extracted text from ${file.name} (${pdf.numPages} pages)`);
      } else if (ext === "docx") {
        const { BlobReader, ZipReader, TextWriter } = await import(
          "https://cdn.jsdelivr.net/npm/@nicolo-ribaudo/zip.js@2.7.32/+esm" as any
        );
        const zipReader = new ZipReader(new BlobReader(file));
        const entries = await zipReader.getEntries();
        const documentEntry = entries.find(
          (e: any) => e.filename === "word/document.xml",
        );
        if (!documentEntry) throw new Error("Invalid DOCX file");
        const xmlText = await documentEntry.getData(new TextWriter());
        await zipReader.close();
        const plainText = xmlText
          .replace(/<\/w:p>/g, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        setResumeText(plainText);
        toast.success(`Extracted text from ${file.name}`);
      } else {
        toast.error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
        setUploadedFile(null);
      }
    } catch (err) {
      console.error("File processing error:", err);
      toast.error("Failed to read file. Please try pasting your resume text instead.");
      setUploadedFile(null);
    } finally {
      setFileProcessing(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setCheckingPayment(false);
      return;
    }
    if (isWhitelisted) {
      setHasPaid(true);
      setCheckingPayment(false);
      return;
    }
    (async () => {
      try {
        const [purchaseRes, historyRes] = await Promise.all([
          supabase
            .from("product_purchases" as any)
            .select("id")
            .eq("user_id", user.id)
            .eq("product_slug", PRODUCT_SLUG)
            .eq("status", "paid")
            .maybeSingle(),
          supabase
            .from("resume_generations" as any)
            .select("id, company_name, status, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);
        if (purchaseRes.data) setHasPaid(true);
        if (historyRes.data) setPastGenerations(historyRes.data as any[]);
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
      const { data, error } = await supabase.functions.invoke(
        "create-product-order",
        {
          body: {
            userId: user.id,
            email: user.email,
            productSlug: PRODUCT_SLUG,
            amount: PRODUCT_PRICE,
          },
        },
      );
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
          const { error: verifyError } = await supabase.functions.invoke(
            "verify-product-payment",
            {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                productSlug: PRODUCT_SLUG,
              },
            },
          );
          if (verifyError) {
            toast.error("Payment verification failed");
          } else {
            toast.success("Payment successful! Opening Resume Brandifier...");
            setHasPaid(true);
            window.open(OPAL_URL, "_blank", "noopener,noreferrer");
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
    setGeneratedHtml("");
    try {
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

      const { data, error } = await supabase.functions.invoke(
        "generate-resume",
        {
          body: { resumeText, companyName, companyWebsite, jobDescription },
        },
      );

      if (error) {
        // Try to parse the structured error from edge function
        const errorBody = typeof error === "object" && "message" in error
          ? error.message
          : String(error);
        throw new Error(errorBody);
      }

      // Check for error in response body (edge function returns 4xx/5xx with JSON)
      if (data?.error) {
        const code = data.code || "UNKNOWN";
        if (code === "RATE_LIMITED") {
          toast.error("Rate limit hit. Please wait a moment and try again.");
        } else if (code === "CREDITS_EXHAUSTED") {
          toast.error("AI credits exhausted. Please try again later.");
        } else if (code.startsWith("MISSING_") || code.endsWith("_TOO_LONG")) {
          toast.error(data.error);
        } else {
          toast.error(data.error || "Generation failed. Please try again.");
        }
        if (user && genId) {
          await supabase
            .from("resume_generations" as any)
            .update({ status: "failed" } as any)
            .eq("id", genId);
        }
        setGenerating(false);
        return;
      }

      setGeneratedHtml(data.html);
      toast.success("Resume generated!");

      if (user && genId) {
        await supabase
          .from("resume_generations" as any)
          .update({ status: "completed" } as any)
          .eq("id", genId);
      }

      if (user) {
        await supabase
          .from("product_purchases" as any)
          .update({ status: "used" } as any)
          .eq("user_id", user.id)
          .eq("product_slug", PRODUCT_SLUG)
          .eq("status", "paid");
        if (!isWhitelisted) {
          setHasPaid(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [resumeText, companyName, companyWebsite, jobDescription, user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Card className="glass-card max-w-md w-full text-center p-8">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to use Resume Brandifier.</p>
          <Button asChild>
            <a href="/login?redirect=/experiments/resume-brandifier">Sign In</a>
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
          <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
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
          <p className="text-xs text-muted-foreground mt-3">
            Secured by Razorpay. UPI, cards & wallets.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <Card className="glass-card max-w-md w-full text-center p-8">
        <CheckCircle2 className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">You're all set!</h2>
        <p className="text-muted-foreground mb-6">
          Click below to open Resume Brandifier and create your branded resume.
        </p>
        <Button
          onClick={() => window.open(OPAL_URL, "_blank", "noopener,noreferrer")}
          className="w-full"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Open Resume Brandifier
        </Button>
      </Card>
    </div>
  );
};

export default ResumeForge;
