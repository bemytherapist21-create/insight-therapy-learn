import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/safeClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, FileText } from "lucide-react";

const ADMIN_EMAILS = ["founder@theeverythingai.com"]; // add your admin email(s)

interface Generation {
  id: string;
  user_email: string;
  company_name: string;
  company_website: string | null;
  job_description_snippet: string | null;
  status: string;
  created_at: string;
}

const AdminResumeGenerations = () => {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("admin-resume-generations");
        if (error) throw error;
        setGenerations(data.generations || []);
      } catch (err) {
        console.error("Failed to fetch generations:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Card className="glass-card max-w-md w-full text-center p-8">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Admin access only.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Resume Generations Dashboard
        </h1>
        <p className="text-muted-foreground mb-6">
          Total: {generations.length} resume(s) generated
        </p>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-foreground font-medium">Date</th>
                <th className="text-left p-3 text-foreground font-medium">User</th>
                <th className="text-left p-3 text-foreground font-medium">Company</th>
                <th className="text-left p-3 text-foreground font-medium">JD Snippet</th>
                <th className="text-left p-3 text-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {generations.map((gen) => (
                <tr key={gen.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                    {new Date(gen.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 text-foreground">{gen.user_email || "—"}</td>
                  <td className="p-3 text-foreground font-medium">{gen.company_name}</td>
                  <td className="p-3 text-muted-foreground max-w-[200px] truncate">
                    {gen.job_description_snippet || "—"}
                  </td>
                  <td className="p-3">
                    <Badge variant={gen.status === "completed" ? "default" : "secondary"}>
                      {gen.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {generations.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No resume generations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminResumeGenerations;
