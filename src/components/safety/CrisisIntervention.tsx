import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, ExternalLink, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { AuditService } from "@/services/auditService";

interface CrisisResourceProps {
    isOpen: boolean;
    onClose: () => void;
    countryCode?: string;
}

export const CrisisIntervention = ({ isOpen, onClose, countryCode = 'US' }: CrisisResourceProps) => {
    const [resources, setResources] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            AuditService.log({
                action: 'CRISIS_RESOURCE_VIEW',
                details: { country: countryCode }
            });
        }
    }, [isOpen, countryCode]);

    // Mock resources based on country - in prod fetch from Supabase
    const getResources = (code: string) => {
        const common = [
            { name: "Global Emergency", number: "112" },
        ];

        const specific: Record<string, any[]> = {
            'US': [
                { name: "Emergency", number: "911" },
                { name: "Suicide & Crisis Lifeline", number: "988" },
                { name: "Crisis Text Line", number: "Text HOME to 741741" }
            ],
            'GB': [
                { name: "Emergency", number: "999" },
                { name: "Samaritans", number: "116 123" },
                { name: "NHS", number: "111" }
            ],
            'IN': [
                { name: "Emergency", number: "112" },
                { name: "Kiran Mental Health", number: "1800-599-0019" },
                { name: "Vandrevala Foundation", number: "9999 666 555" }
            ]
        };

        return specific[code] || specific['US'];
    };

    const currentResources = getResources(countryCode);

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
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {currentResources.map((resource, idx) => (
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
                    ))}

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
