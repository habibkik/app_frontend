import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Upload, FileImage, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BOMUploadZoneProps {
  onAnalyze: (files: File[]) => void;
  isAnalyzing: boolean;
}

export function BOMUploadZone({ onAnalyze, isAnalyzing }: BOMUploadZoneProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <FileImage className="h-4 w-4 text-primary" />;
    }
    return <FileText className="h-4 w-4 text-primary" />;
  };

  const handleAnalyze = () => {
    if (files.length > 0) {
      onAnalyze(files);
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          isAnalyzing && "pointer-events-none opacity-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isAnalyzing}
        />
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {t("bomComponents.uploadProductFiles")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("bomComponents.dropFiles")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("bomComponents.supportsFormats")}
          </p>
        </div>
      </motion.div>

      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {t("bomComponents.filesSelected", { count: files.length })}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiles([])}
              disabled={isAnalyzing}
            >
              {t("bomComponents.clearAll")}
            </Button>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                {getFileIcon(file)}
                <span className="flex-1 text-sm text-foreground truncate">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-muted rounded"
                  disabled={isAnalyzing}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("bomComponents.analyzingProduct")}
              </>
            ) : (
              t("bomComponents.analyzeGenerateBOM")
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
