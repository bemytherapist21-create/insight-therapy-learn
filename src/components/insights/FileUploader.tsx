import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileProcessed: (content: string, fileName: string) => void;
  isProcessing: boolean;
}

const FileUploader = ({ onFileProcessed, isProcessing }: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processFile = useCallback(
    async (file: File) => {
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        toast.error("File too large. Maximum size is 20MB.");
        return;
      }

      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const isValid =
        validTypes.includes(file.type) ||
        file.name.endsWith(".csv") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");

      if (!isValid) {
        toast.error("Please upload a CSV or Excel file.");
        return;
      }

      setSelectedFile(file);
      setUploadProgress(30);

      try {
        const text = await file.text();
        setUploadProgress(80);
        onFileProcessed(text, file.name);
        setUploadProgress(100);
      } catch {
        toast.error("Failed to read file.");
        setSelectedFile(null);
        setUploadProgress(0);
      }
    },
    [onFileProcessed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? "border-primary bg-primary/10"
            : "border-white/20 hover:border-white/40"
        }`}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        <div className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          ) : (
            <Upload className="w-16 h-16 text-primary" />
          )}
          <div>
            <p className="text-lg font-semibold text-white">
              {isProcessing
                ? "Analyzing file structure..."
                : "Drop your CSV or Excel file here"}
            </p>
            <p className="text-sm text-white/60 mt-1">
              or click to browse (max 20MB)
            </p>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="glass-card p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-white/60 text-sm">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          {!isProcessing && (
            <Button variant="ghost" size="sm" onClick={clearFile}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Progress value={uploadProgress} className="h-2" />
      )}
    </div>
  );
};

export default FileUploader;
