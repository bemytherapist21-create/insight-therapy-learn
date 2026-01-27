import { useCountryDetection } from "@/hooks/useCountryDetection";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CrisisResourcesBannerProps {
  variant?: "default" | "compact" | "minimal";
  className?: string;
}

export const CrisisResourcesBanner = ({
  variant = "default",
  className = "",
}: CrisisResourcesBannerProps) => {
  const { resources, country, loading, getResourcesString } =
    useCountryDetection();

  if (loading) {
    return (
      <Card
        className={`p-3 bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400 ${className}`}
      >
        <div className="flex items-center justify-center gap-2 text-white">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs">Loading crisis resources...</span>
        </div>
      </Card>
    );
  }

  if (variant === "minimal") {
    return (
      <p className={`text-sm text-white/80 text-center ${className}`}>
        🛡️ <strong>Project Guardian Protected</strong> - If you're experiencing
        a crisis, please contact {resources[1]?.name || "Crisis Line"}:{" "}
        {resources[1]?.number || "988"}
        {country && country.code !== "US" && (
          <span className="text-white/60"> ({country.name})</span>
        )}
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <p className={`text-xs text-center text-white ${className}`}>
        <strong>Crisis Resources{country && ` (${country.name})`}:</strong>{" "}
        {getResourcesString()}
      </p>
    );
  }

  // Default variant
  return (
    <Card
      className={`p-3 bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400 ${className}`}
    >
      <p className="text-xs text-center text-white">
        <strong>
          Crisis Resources
          {country && country.code !== "US" && ` (${country.name})`}:
        </strong>{" "}
        {getResourcesString()}
      </p>
    </Card>
  );
};
