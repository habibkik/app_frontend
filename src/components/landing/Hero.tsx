import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Upload, Sparkles, Search, Package, TrendingUp, Check, ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroButton } from "@/components/ui/hero-button";
import { cn } from "@/lib/utils";
import HeroDotMap from "@/components/landing/HeroDotMap";

type AnalysisMode = "buyer" | "producer" | "seller";

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>("producer");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modeConfig: Record<AnalysisMode, { icon: React.ElementType; label: string; description: string; color: string; result: string }> = {
    buyer: { icon: Search, label: t("hero.modes.buyer"), description: t("hero.modes.buyerDesc"), color: "text-blue-400", result: t("hero.modes.buyerResult") },
    producer: { icon: Package, label: t("hero.modes.producer"), description: t("hero.modes.producerDesc"), color: "text-amber-400", result: t("hero.modes.producerResult") },
    seller: { icon: TrendingUp, label: t("hero.modes.seller"), description: t("hero.modes.sellerDesc"), color: "text-emerald-400", result: t("hero.modes.sellerResult") },
  };

  const handleDrag = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true); else if (e.type === "dragleave") setIsDragging(false); }, []);
  const processFile = useCallback((file: File) => { if (!file.type.startsWith("image/")) return; const reader = new FileReader(); reader.onload = (e) => { setUploadedImage(e.target?.result as string); setIsAnalyzing(true); setTimeout(() => { setIsAnalyzing(false); setAnalysisComplete(true); }, 2000); }; reader.readAsDataURL(file); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) processFile(file); }, [processFile]);
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) processFile(file); }, [processFile]);
  const resetDemo = () => { setUploadedImage(null); setIsAnalyzing(false); setAnalysisComplete(false); };

  const config = modeConfig[selectedMode];
  const ModeIcon = config.icon;

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: "#F7F7F6" }}>
      {/* Dense dot-matrix world map */}
      <div className="absolute inset-0 opacity-[0.18]">
        <HeroDotMap />
      </div>

      <div className="relative container mx-auto px-6 pt-28 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <span className="column-pill-dark">
                  <Sparkles className="w-3 h-3" />
                  {t("hero.badge")}
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-bold text-column-navy leading-tight mb-4 tracking-tight">
                {t("hero.title1")}{" "}
                <span className="text-column-teal">{t("hero.title2")}</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-column-body max-w-xl mb-8">
                {t("hero.subtitle")}
              </motion.p>

              {/* Mode tabs */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 mb-8">
                {(Object.keys(modeConfig) as AnalysisMode[]).map((mode) => {
                  const cfg = modeConfig[mode]; const Icon = cfg.icon; const isActive = selectedMode === mode;
                  return (
                    <button key={mode} onClick={() => { setSelectedMode(mode); resetDemo(); }} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200", isActive ? "bg-column-navy/10 border border-column-navy/20" : "hover:bg-column-navy/5 border border-transparent")}>
                      <Icon className={cn("w-4 h-4", isActive ? "text-column-navy" : "text-column-muted")} />
                      <span className={cn("text-sm font-medium", isActive ? "text-column-navy" : "text-column-muted")}>{cfg.label}</span>
                    </button>
                  );
                })}
              </motion.div>

              {/* Trust pills */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-3">
                {[t("hero.pills.noSignup"), t("hero.pills.instant"), t("hero.pills.free")].map((text) => (
                  <span key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-column-navy/15 text-xs text-column-body">
                    <Check className="w-3 h-3 text-column-teal" /> {text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Upload card */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className={cn("column-card p-6", "relative overflow-hidden")}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                <AnimatePresence mode="wait">
                  {!uploadedImage ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-10 transition-all duration-200 cursor-pointer text-center",
                        isDragging ? "border-column-teal bg-column-teal/5 scale-[1.02]" : "border-gray-200 hover:border-gray-300"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="h-16 w-16 rounded-xl border border-gray-200 flex items-center justify-center mx-auto mb-4">
                        <ModeIcon className="h-8 w-8 text-column-navy" />
                      </div>
                      <h3 className="text-lg font-semibold text-column-navy mb-2">{t("hero.uploadZone.dropHere")}</h3>
                      <p className="text-column-body text-sm mb-6">{config.description}</p>
                      <div className="flex items-center justify-center gap-3">
                        <HeroButton variant="columnPrimary" size="default" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                          <Upload className="w-4 h-4" /> {t("hero.uploadZone.uploadBtn")}
                        </HeroButton>
                        <HeroButton variant="columnOutline" size="default" className="border-column-navy/20 text-column-navy hover:bg-column-navy/5" onClick={(e) => { e.stopPropagation(); setUploadedImage("/placeholder.svg"); setIsAnalyzing(true); setTimeout(() => { setIsAnalyzing(false); setAnalysisComplete(true); }, 2000); }}>
                          <Sparkles className="w-4 h-4" /> {t("hero.uploadZone.tryDemo")}
                        </HeroButton>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                      <div className="relative h-64 md:h-72 flex items-center justify-center bg-gray-50 rounded-xl">
                        <img src={uploadedImage} alt="Product" className="max-h-full max-w-full object-contain" />
                        <AnimatePresence>
                          {isAnalyzing && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                              <div className="relative">
                                <motion.div className="h-16 w-16 rounded-full border-4 border-column-teal/30 border-t-column-teal" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-column-teal" />
                              </div>
                              <p className="mt-4 text-sm font-medium text-column-navy">{t("hero.uploadZone.analyzing")}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <AnimatePresence>
                          {analysisComplete && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 bg-column-navy rounded-xl p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-column-teal/20"><Check className="h-5 w-5 text-column-teal" /></div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{t("hero.uploadZone.analysisComplete")}</p>
                                    <p className="text-xs text-white/60">{config.result}</p>
                                  </div>
                                </div>
                                <HeroButton variant="columnPrimary" size="sm" onClick={() => navigate("/dashboard")}>
                                  {t("hero.uploadZone.viewResults")} <ArrowRight className="w-4 h-4" />
                                </HeroButton>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {!isAnalyzing && (
                        <button onClick={(e) => { e.stopPropagation(); resetDemo(); }} className="absolute top-3 right-3 p-2 rounded-lg bg-white/80 hover:bg-white text-column-navy transition-colors z-20">
                          <ImageIcon className="h-4 w-4" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
