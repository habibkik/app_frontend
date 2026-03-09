import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Upload, Sparkles, Search, Package, TrendingUp, Check, ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroButton } from "@/components/ui/hero-button";
import { cn } from "@/lib/utils";

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
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Realistic world map dots + trade routes */}
      <div className="absolute inset-0 opacity-[0.07]">
        <svg className="w-full h-full" viewBox="0 0 1440 720" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          {/* North America */}
          {[[280,140],[260,150],[240,160],[250,170],[260,180],[270,180],[280,170],[290,160],[300,150],[310,160],[320,170],[300,180],[290,190],[280,200],[270,210],[260,220],[250,210],[240,200],[230,190],[220,180],[210,190],[230,170],[250,150],[270,140],[290,140],[310,150],[320,160],[330,170],[340,160],[330,150],[310,140],[300,130],[280,130],[260,140],[240,150],[230,160],[220,170],[235,180],[255,190],[275,200],[295,190],[315,180],[325,175],[335,185],[320,195],[305,200],[285,210],[265,220],[250,225],[240,215],[235,205],[245,195],[265,185],[285,175],[305,165],[325,155]].map(([x,y],i)=>(
            <circle key={`na${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {/* South America */}
          {[[310,320],[305,330],[300,340],[295,350],[290,360],[285,370],[290,380],[295,390],[300,400],[305,410],[300,420],[295,430],[290,440],[285,450],[280,460],[275,470],[280,480],[285,490],[280,500],[310,310],[315,320],[320,330],[325,340],[320,350],[315,360],[310,370],[305,380],[310,390],[315,400],[310,410],[305,420],[300,430],[295,440],[290,455],[285,465],[300,305],[295,315],[290,325],[285,335],[280,345],[275,355]].map(([x,y],i)=>(
            <circle key={`sa${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {/* Europe */}
          {[[620,130],[630,125],[640,130],[650,135],[660,140],[670,135],[680,140],[690,145],[700,140],[710,135],[660,145],[670,150],[680,155],[690,150],[700,145],[650,150],[640,155],[630,150],[620,145],[610,140],[625,135],[635,140],[645,145],[655,140],[665,145],[675,150],[685,145],[695,140],[705,135],[715,140],[620,155],[630,160],[640,160],[650,155],[660,155],[670,160],[680,160],[690,155],[700,150],[625,165],[635,170],[645,165],[655,160]].map(([x,y],i)=>(
            <circle key={`eu${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {/* Africa */}
          {[[650,220],[660,230],[670,240],[680,250],[690,260],[680,270],[670,280],[660,290],[650,300],[660,310],[670,320],[680,330],[670,340],[660,350],[650,360],[640,370],[650,380],[660,390],[650,400],[640,390],[630,380],[640,370],[650,360],[640,350],[630,340],[640,330],[650,320],[640,310],[630,300],[640,290],[650,280],[640,270],[630,260],[640,250],[650,240],[640,230],[630,220],[640,210],[650,210],[660,215],[670,225],[680,235],[690,245],[700,255],[690,270],[680,285],[670,295],[660,305],[670,315]].map(([x,y],i)=>(
            <circle key={`af${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {/* Asia */}
          {[[750,130],[760,125],[770,130],[780,135],[790,140],[800,135],[810,130],[820,135],[830,140],[840,145],[850,140],[860,135],[870,140],[880,145],[890,150],[900,145],[910,140],[920,145],[930,150],[940,155],[950,150],[960,145],[970,150],[980,155],[990,160],[1000,155],[1010,160],[1020,165],[750,145],[760,150],[770,155],[780,160],[790,165],[800,160],[810,155],[820,160],[830,165],[840,170],[850,165],[860,170],[870,175],[880,170],[890,165],[900,170],[910,175],[920,180],[930,185],[940,180],[950,175],[960,180],[970,185],[980,190],[800,180],[810,185],[820,190],[830,195],[840,200],[850,205],[860,200],[870,195],[880,200],[890,205],[900,200],[910,195],[920,200],[930,205],[940,210],[950,215],[960,210],[970,205]].map(([x,y],i)=>(
            <circle key={`as${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {/* Australia */}
          {[[1020,380],[1030,375],[1040,380],[1050,385],[1060,390],[1070,395],[1080,390],[1090,385],[1100,390],[1110,395],[1020,395],[1030,400],[1040,405],[1050,410],[1060,415],[1070,410],[1080,405],[1090,400],[1100,405],[1110,410],[1040,420],[1050,425],[1060,430],[1070,425],[1080,420]].map(([x,y],i)=>(
            <circle key={`au${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}

          {/* Trade route lines */}
          {[
            "M 950,170 C 870,120 780,110 680,140",
            "M 620,145 C 530,130 430,135 310,155",
            "M 290,210 C 295,250 300,280 310,320",
            "M 650,165 C 650,185 650,200 650,220",
            "M 970,205 C 1000,260 1020,320 1040,375",
            "M 700,255 C 720,230 740,200 780,160",
            "M 330,150 C 420,100 520,100 620,130",
            "M 320,340 C 420,310 520,280 630,260",
          ].map((d, i) => (
            <path key={`route${i}`} d={d} stroke="hsl(160,84%,39%)" strokeWidth="1" fill="none" strokeDasharray="6 4" opacity="0.6" />
          ))}

          {/* Trade hub dots (larger) */}
          {[[280,170],[310,150],[650,145],[680,250],[830,165],[950,170],[1050,395],[310,320]].map(([x,y],i)=>(
            <circle key={`hub${i}`} cx={x} cy={y} r={3.5} fill="hsl(160,84%,39%)" opacity="0.8" />
          ))}
        </svg>
      </div>

      <div className="relative container mx-auto px-6 pt-28 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <span className="column-pill-light">
                  <Sparkles className="w-3 h-3" />
                  {t("hero.badge")}
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 tracking-tight">
                {t("hero.title1")}{" "}
                <span className="text-column-teal">{t("hero.title2")}</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-white/60 max-w-xl mb-8">
                {t("hero.subtitle")}
              </motion.p>

              {/* Mode tabs */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 mb-8">
                {(Object.keys(modeConfig) as AnalysisMode[]).map((mode) => {
                  const cfg = modeConfig[mode]; const Icon = cfg.icon; const isActive = selectedMode === mode;
                  return (
                    <button key={mode} onClick={() => { setSelectedMode(mode); resetDemo(); }} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200", isActive ? "bg-white/10 border border-white/20" : "hover:bg-white/5 border border-transparent")}>
                      <Icon className={cn("w-4 h-4", isActive ? cfg.color : "text-white/50")} />
                      <span className={cn("text-sm font-medium", isActive ? "text-white" : "text-white/50")}>{cfg.label}</span>
                    </button>
                  );
                })}
              </motion.div>

              {/* Trust pills */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-3">
                {[t("hero.pills.noSignup"), t("hero.pills.instant"), t("hero.pills.free")].map((text) => (
                  <span key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-xs text-white/60">
                    <Check className="w-3 h-3 text-column-teal" /> {text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Upload card */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className={cn(
                "column-card p-6",
                "relative overflow-hidden"
              )}>
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
