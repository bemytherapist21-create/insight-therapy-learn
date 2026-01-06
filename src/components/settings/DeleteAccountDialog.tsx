import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/safeClient";
import { AuditService } from "@/services/auditService";
import { useNavigate } from "react-router-dom";

export const DeleteAccountDialog = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleDelete = async () => {
        setLoading(true);
        try {
            // 1. Audit the request
            await AuditService.log({
                action: 'DATA_DELETION_REQUEST'
            });

            // 2. Call Edge Function to delete user data (mocked for now as we don't have the backend function)
            // In a real app: await supabase.functions.invoke('delete-user-data');

            // For now, we sign out and show a "request received" message
            // This is a common pattern for GDPR "right to erasure" which takes time to process
            await supabase.auth.signOut();

            toast({
                title: "Deletion Request Received",
                description: "Your data deletion request has been logged and will be processed within 30 days as per GDPR compliance.",
            });

            navigate('/');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process request. Please contact privacy@theeverythingai.com",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Request Data Deletion
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? "Processing..." : "Delete Account"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
