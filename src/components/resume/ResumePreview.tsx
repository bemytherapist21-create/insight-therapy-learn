import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Maximize2,
  Printer,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface ResumePreviewProps {
  html: string;
  companyName: string;
  onRegenerate: () => void;
  regenerating: boolean;
}

export const ResumePreview = ({
  html,
  companyName,
  onRegenerate,
  regenerating,
}: ResumePreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const downloadHtml = useCallback(() => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName.replace(/\s+/g, "_")}_Resume.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [html, companyName]);

  const openInNewTab = useCallback(() => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }, [html]);

  const printResume = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        iframe.requestFullscreen();
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          Preview
        </Badge>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onRegenerate}
            disabled={regenerating}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Regenerate
          </Button>
          <Button onClick={openInNewTab} variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-1" />
            New Tab
          </Button>
          <Button onClick={printResume} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-1" />
            Print
          </Button>
          <Button onClick={toggleFullscreen} variant="outline" size="sm">
            <Maximize2 className="w-4 h-4 mr-1" />
            Fullscreen
          </Button>
          <Button onClick={downloadHtml} size="sm">
            <Download className="w-4 h-4 mr-1" />
            Download HTML
          </Button>
        </div>
      </div>
      <div className="rounded-lg border border-border overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          srcDoc={html}
          className="w-full min-h-[80vh] border-0"
          title="Generated Resume Preview"
          sandbox="allow-scripts allow-modals"
        />
      </div>
    </div>
  );
};
