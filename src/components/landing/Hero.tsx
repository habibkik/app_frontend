import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Upload, 
  Camera, 
  Sparkles, 
  Search, 
  Package, 
  TrendingUp,
  Check,
  ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HeroButton } from "@/components/ui/hero-button";
import { cn } from "@/lib/utils";

type AnalysisMode = "buyer" | "producer" | "seller";

const modeConfig: Record<AnalysisMode, { 
  icon: React.ElementType; 
  label: string; 
  description: string;
  color: string;
  result: string;
}> = {
  buyer: {
    icon: Search,
    label: "Find Suppliers",
    description: "Discover verified suppliers & get quotes",
    color: "text-blue-400",
    result: "3 suppliers found",
  },
  producer: {
    icon: Package,
    label: "Generate BOM",
    description: "Reverse-engineer components & costs",
    color: "text-amber-400",
    result: "12 components identified",
  },
  seller: {
    icon: TrendingUp,
    label: "Analyze Market",
    description: "Get competitive pricing & insights",
    color: "text-emerald-400",
    result: "Market analysis ready",
  },
};

const Hero = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>("producer");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      // Simulate analysis
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 2000);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const resetDemo = () => {
    setUploadedImage(null);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
  };

  const config = modeConfig[selectedMode];
  const ModeIcon = config.icon;

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/50 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative container mx-auto px-6 pt-28 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary-foreground/80">
                AI-Powered Trade Intelligence
              </span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground text-center leading-tight mb-4"
          >
            One Image.{" "}
            <span className="bg-gradient-to-r from-blue-400 via-primary to-blue-300 bg-clip-text text-transparent">
              Infinite Insights.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/70 text-center max-w-2xl mx-auto mb-10"
          >
            Upload any product image. Get instant supplier matches, 
            production costs, or market intelligence — powered by AI.
          </motion.p>

          {/* Interactive Demo Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            {/* Mode Selector */}
            <div className="flex justify-center gap-2 mb-6">
              {(Object.keys(modeConfig) as AnalysisMode[]).map((mode) => {
                const cfg = modeConfig[mode];
                const Icon = cfg.icon;
                const isActive = selectedMode === mode;
                
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      setSelectedMode(mode);
                      resetDemo();
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-white/10 border border-white/20 shadow-lg" 
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? cfg.color : "text-primary-foreground/50")} />
                    <span className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary-foreground" : "text-primary-foreground/50"
                    )}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Upload Zone */}
            <div
              className={cn(
                "relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden",
                "bg-white/5 backdrop-blur-sm",
                isDragging 
                  ? "border-primary bg-primary/10 scale-[1.02]" 
                  : "border-white/20 hover:border-white/40",
                uploadedImage && "border-solid border-white/10"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <AnimatePresence mode="wait">
                {!uploadedImage ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-8 text-center"
                  >
                    <motion.div 
                      className={cn(
                        "h-20 w-20 rounded-2xl flex items-center justify-center mb-6",
                        "bg-gradient-to-br from-white/10 to-white/5"
                      )}
                      animate={{ 
                        scale: isDragging ? 1.1 : 1,
                        rotate: isDragging ? 5 : 0,
                      }}
                    >
                      <ModeIcon className={cn("h-10 w-10", config.color)} />
                    </motion.div>
                    
                    <h3 className="text-xl font-semibold text-primary-foreground mb-2">
                      Drop a product image here
                    </h3>
                    <p className="text-primary-foreground/60 mb-6 max-w-sm">
                      {config.description}
                    </p>
                    
                    <div className="flex items-center gap-3 pointer-events-auto relative z-20">
                      <HeroButton 
                        variant="primary" 
                        size="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </HeroButton>
                      <HeroButton 
                        variant="outline" 
                        size="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Demo with placeholder
                          setUploadedImage("/placeholder.svg");
                          setIsAnalyzing(true);
                          setTimeout(() => {
                            setIsAnalyzing(false);
                            setAnalysisComplete(true);
                          }, 2000);
                        }}
                      >
                        <Sparkles className="w-4 h-4" />
                        Try Demo
                      </HeroButton>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    {/* Image Preview */}
                    <div className="relative h-64 md:h-80 flex items-center justify-center bg-black/20">
                      <img
                        src={uploadedImage}
                        alt="Product"
                        className="max-h-full max-w-full object-contain"
                      />
                      
                      {/* Analysis Overlay */}
                      <AnimatePresence>
                        {isAnalyzing && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
                          >
                            <div className="relative">
                              <motion.div
                                className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                            </div>
                            <p className="mt-4 text-sm font-medium text-primary-foreground">
                              AI analyzing your product...
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Success State */}
                      <AnimatePresence>
                        {analysisComplete && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "h-10 w-10 rounded-lg flex items-center justify-center",
                                  "bg-emerald-500/20"
                                )}>
                                  <Check className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-primary-foreground">
                                    Analysis Complete
                                  </p>
                                  <p className="text-xs text-primary-foreground/60">
                                    {config.result}
                                  </p>
                                </div>
                              </div>
                              <HeroButton
                                variant="primary"
                                size="sm"
                                onClick={() => navigate("/dashboard")}
                              >
                                View Results
                                <ArrowRight className="w-4 h-4" />
                              </HeroButton>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Reset Button */}
                    {!isAnalyzing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetDemo();
                        }}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 hover:bg-black/60 text-primary-foreground/80 transition-colors z-20"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mt-6"
            >
              {["No signup required", "Instant results", "100% free demo"].map((text) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-primary-foreground/70"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  {text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {[
              { value: "$2.5B+", label: "Trade Volume" },
              { value: "50K+", label: "Suppliers" },
              { value: "99.2%", label: "Accuracy" },
              { value: "<2s", label: "Analysis Time" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-primary-foreground/50">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
