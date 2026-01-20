import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, ShieldAlert, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { AuditService } from "@/services/auditService";
import { useCountryDetection } from "@/hooks/useCountryDetection";

interface CrisisResourceProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CrisisIntervention = ({ isOpen, onClose }: CrisisResourceProps) => {
    const { resources, country, loading } = useCountryDetection();

    useEffect(() => {
        if (isOpen && country) {
            AuditService.log({
                action: 'CRISIS_RESOURCE_VIEW',
                details: { country: country.code, countryName: country.name }
            });
        }
    }, [isOpen, country]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md border-red-500/50 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <div className="mx-auto bg-red-100 p-3 rounded-full mb-4">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold text-red-500">
                        Immediate Help Available
                    </DialogTitle>
                    <DialogDescription className="text-center text-lg mt-2">
                        You are not alone. Support is available for you right now.
                        {country && country.code !== 'US' && (
                            <span className="block text-sm mt-1 text-muted-foreground">
                                Resources for {country.name}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        resources.map((resource, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                                <div>
                                    <h4 className="font-semibold">{resource.name}</h4>
                                    <p className="text-muted-foreground">{resource.number}</p>
                                </div>
                                <Button size="sm" variant="destructive" asChild>
                                    <a href={`tel:${resource.number.replace(/\D/g, '')}`}>
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call
                                    </a>
                                </Button>
                            </div>
                        ))
                    )}

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>If you are in immediate danger, please go to the nearest emergency room.</p>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Return to Safety
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
