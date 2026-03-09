import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Search, Package, TrendingUp, Check, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import demoBuyerImg from "@/assets/demo-product-buyer.png";
import demoProducerImg from "@/assets/demo-product-producer.png";
import demoSellerImg from "@/assets/demo-product-seller.png";

type AnalysisMode = "buyer" | "producer" | "seller";

/* ── Animated count-up hook ── */
const useCountUp = (end: number, duration = 2000, startCounting: boolean) => {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);
  useEffect(() => {
    if (!startCounting || hasRun.current) return;
    hasRun.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(end);
    };
    requestAnimationFrame(step);
  }, [startCounting, end, duration]);
  return count;
};

const AnimatedStat = ({ value, label, inView }: { value: string; label: string; inView: boolean }) => {
  const numMatch = value.match(/([$<]?)([0-9.]+)([A-Za-z+%]*)/);
  const prefix = numMatch?.[1] || "";
  const numericVal = parseFloat(numMatch?.[2] || "0");
  const suffix = numMatch?.[3] || "";
  const isDecimal = numMatch?.[2]?.includes(".") ?? false;
  const count = useCountUp(isDecimal ? numericVal * 10 : numericVal, 1800, inView);
  const display = isDecimal ? (count / 10).toFixed(1) : count;

  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-[hsl(var(--accent))] tracking-tight">
        {prefix}{display}{suffix}
      </div>
      <div className="text-xs text-white/50 mt-0.5">{label}</div>
    </div>
  );
};

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>("buyer");
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const modeConfig: Record<AnalysisMode, { icon: React.ElementType; label: string; description: string; color: string; demoLabel: string; features: string[]; actionTitle: string; actionDesc: string; productImg: string }> = {
    buyer: {
      icon: Search, label: t("hero.modes.buyer"), description: t("hero.modes.buyerDesc"),
      color: "text-blue-400", demoLabel: t("hero.modes.buyerResult"),
      features: ["AI Supplier Matching", "Instant Quote System", "Price Comparison", "Order Tracking"],
      actionTitle: "Find Suppliers", actionDesc: "Get matched suppliers & instant quotes", productImg: demoBuyerImg,
    },
    producer: {
      icon: Package, label: t("hero.modes.producer"), description: t("hero.modes.producerDesc"),
      color: "text-amber-400", demoLabel: t("hero.modes.producerResult"),
      features: ["BOM Generation", "Cost Optimization", "Feasibility Analysis", "Dynamic Pricing"],
      actionTitle: "Generate BOM", actionDesc: "Get cost breakdown & feasibility analysis", productImg: demoProducerImg,
    },
    seller: {
      icon: TrendingUp, label: t("hero.modes.seller"), description: t("hero.modes.sellerDesc"),
      color: "text-emerald-400", demoLabel: t("hero.modes.sellerResult"),
      features: ["Market Intelligence", "Competitor Monitor", "Demand Signals", "Content Studio"],
      actionTitle: "Analyze Market", actionDesc: "Get competitive pricing & insights", productImg: demoSellerImg,
    },
  };

  const config = modeConfig[selectedMode];
  const ModeIcon = config.icon;

  const stats = [
    { value: "$2.5B+", label: t("hero.stats.tradeVolume") },
    { value: "50K+", label: t("hero.stats.suppliers") },
    { value: "99.2%", label: t("hero.stats.accuracy") },
    { value: "<2s", label: t("hero.stats.analysisTime") },
  ];

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* World map dots */}
      <div className="absolute inset-0 opacity-[0.07]">
        <svg className="w-full h-full" viewBox="0 0 1440 720" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          {[[280,140],[260,150],[240,160],[270,180],[290,160],[310,160],[300,180],[280,200],[260,220],[230,190],[255,190],[275,200],[315,180],[335,185],[305,200]].map(([x,y],i)=>(
            <circle key={`na${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {[[310,320],[300,340],[290,360],[290,380],[300,400],[295,430],[280,460],[285,490],[315,320],[310,370],[305,420]].map(([x,y],i)=>(
            <circle key={`sa${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {[[620,130],[640,130],[660,140],[680,140],[700,140],[660,145],[680,155],[650,150],[630,150],[625,165],[645,165]].map(([x,y],i)=>(
            <circle key={`eu${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {[[650,220],[670,240],[690,260],[670,280],[650,300],[670,320],[660,350],[650,380],[640,370],[630,260],[640,250]].map(([x,y],i)=>(
            <circle key={`af${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {[[750,130],[780,135],[810,130],[840,145],[870,140],[900,145],[930,150],[960,145],[990,160],[810,185],[840,200],[870,195],[930,205],[960,210]].map(([x,y],i)=>(
            <circle key={`as${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {[[1040,380],[1060,390],[1080,390],[1100,405],[1060,415],[1050,425]].map(([x,y],i)=>(
            <circle key={`au${i}`} cx={x} cy={y} r={1.8} fill="hsl(160,84%,39%)" />
          ))}
          {[
            "M 950,170 C 870,120 780,110 680,140",
            "M 620,145 C 530,130 430,135 310,155",
            "M 290,210 C 295,250 300,280 310,320",
            "M 650,165 C 650,185 650,200 650,220",
            "M 970,205 C 1000,260 1020,320 1040,375",
          ].map((d, i) => (
            <path key={`route${i}`} d={d} stroke="hsl(160,84%,39%)" strokeWidth="1" fill="none" strokeDasharray="6 4" opacity="0.6" />
          ))}
          {[[280,170],[650,145],[830,165],[950,170],[1050,395],[310,320]].map(([x,y],i)=>(
            <circle key={`hub${i}`} cx={x} cy={y} r={3.5} fill="hsl(160,84%,39%)" opacity="0.8" />
          ))}
        </svg>
      </div>

      <div className="relative container mx-auto px-6 pt-28 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <span className="column-pill-light">
                  <Sparkles className="w-3 h-3" />
                  {t("hero.badge")}
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-2 tracking-tight">
                {t("hero.title1")}{" "}
                <span className="text-[hsl(var(--accent))]">{t("hero.title2")}</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-lg md:text-xl text-white/60 max-w-xl mb-8">
                {t("hero.subtitle")}
              </motion.p>

              {/* Mode tabs */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex flex-wrap gap-2 mb-6">
                {(Object.keys(modeConfig) as AnalysisMode[]).map((mode) => {
                  const cfg = modeConfig[mode]; const Icon = cfg.icon; const isActive = selectedMode === mode;
                  return (
                    <button key={mode} onClick={() => setSelectedMode(mode)} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200", isActive ? "bg-white/10 border border-white/20" : "hover:bg-white/5 border border-transparent")}>
                      <Icon className={cn("w-4 h-4", isActive ? cfg.color : "text-white/50")} />
                      <span className={cn("text-sm font-medium", isActive ? "text-white" : "text-white/50")}>{cfg.label}</span>
                    </button>
                  );
                })}
              </motion.div>

              {/* Trust pills */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex flex-wrap gap-3 mb-10">
                {[t("hero.pills.noSignup"), t("hero.pills.instant"), t("hero.pills.free")].map((text) => (
                  <span key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-xs text-white/60">
                    <Check className="w-3 h-3 text-[hsl(var(--accent))]" /> {text}
                  </span>
                ))}
              </motion.div>

              {/* Inline Stats */}
              <motion.div
                ref={statsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex items-center gap-6 flex-wrap"
              >
                {stats.map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-6">
                    <AnimatedStat value={stat.value} label={stat.label} inView={statsVisible} />
                    {i < stats.length - 1 && (
                      <div className="hidden sm:block w-px h-10 bg-white/15" />
                    )}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right column — Demo card */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-[hsl(var(--card))] rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] p-6 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedMode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex gap-5">
                      {/* Left — Product image + action */}
                      <div className="flex flex-col items-center w-36 shrink-0">
                        <div className="w-28 h-28 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 flex items-center justify-center overflow-hidden mb-3">
                          <img src={config.productImg} alt={config.actionTitle} className="w-24 h-24 object-contain" />
                        </div>
                        <h4 className="text-sm font-bold text-[hsl(var(--foreground))] text-center leading-tight">{config.actionTitle}</h4>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-center mt-1 leading-tight">{config.actionDesc}</p>
                        <button
                          onClick={() => navigate("/dashboard")}
                          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[hsl(var(--foreground))] text-white font-medium text-xs transition-all hover:opacity-90 group"
                        >
                          Try Demo
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>

                      {/* Right — Demo data */}
                      <div className="flex-1 min-w-0">
                        {selectedMode === "buyer" && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider px-2 pb-0.5">
                              <span className="flex-1">Supplier</span>
                              <span className="w-12 text-center">Match</span>
                              <span className="w-16 text-right">Price</span>
                            </div>
                            {[
                              { name: "SteelMax GmbH", flag: "🇩🇪", match: "97.2%", price: "$12.40/kg" },
                              { name: "ZhongTai Parts", flag: "🇨🇳", match: "94.8%", price: "$8.20/kg" },
                              { name: "Atlas Industrial", flag: "🇺🇸", match: "91.5%", price: "$15.60/kg" },
                              { name: "Konya Metals", flag: "🇹🇷", match: "89.1%", price: "$9.80/kg" },
                            ].map((row) => (
                              <div key={row.name} className="flex items-center justify-between px-2 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                                <span className="flex items-center gap-1.5 flex-1 text-xs font-medium text-[hsl(var(--foreground))] truncate">
                                  <span>{row.flag}</span> {row.name}
                                </span>
                                <span className="w-12 text-center text-[11px] font-semibold text-[hsl(var(--accent))]">{row.match}</span>
                                <span className="w-16 text-right text-[11px] text-[hsl(var(--muted-foreground))]">{row.price}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedMode === "producer" && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider px-2 pb-0.5">
                              <span className="flex-1">Component</span>
                              <span className="w-8 text-center">Qty</span>
                              <span className="w-14 text-center">Unit</span>
                              <span className="w-14 text-right">Total</span>
                            </div>
                            {[
                              { name: "Steel Frame", qty: 2, unit: "$24.50", total: "$49.00" },
                              { name: "PCB Board", qty: 1, unit: "$18.30", total: "$18.30" },
                              { name: "LED Module", qty: 4, unit: "$3.20", total: "$12.80" },
                              { name: "Housing", qty: 1, unit: "$31.00", total: "$31.00" },
                            ].map((row) => (
                              <div key={row.name} className="flex items-center justify-between px-2 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                                <span className="flex-1 text-xs font-medium text-[hsl(var(--foreground))] truncate">{row.name}</span>
                                <span className="w-8 text-center text-[11px] text-[hsl(var(--muted-foreground))]">×{row.qty}</span>
                                <span className="w-14 text-center text-[11px] text-[hsl(var(--muted-foreground))]">{row.unit}</span>
                                <span className="w-14 text-right text-[11px] font-semibold text-[hsl(var(--foreground))]">{row.total}</span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[hsl(var(--accent))]/10">
                              <span className="text-xs font-bold text-[hsl(var(--foreground))]">Total BOM</span>
                              <span className="text-xs font-bold text-[hsl(var(--accent))]">$111.10</span>
                            </div>
                          </div>
                        )}

                        {selectedMode === "seller" && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider px-2 pb-0.5">
                              <span className="flex-1">Metric</span>
                              <span className="w-16 text-center">Value</span>
                              <span className="w-14 text-right">Trend</span>
                            </div>
                            {[
                              { metric: "Market Price", value: "$45.20", trend: "↑ +8.2%", trendColor: "text-emerald-400" },
                              { metric: "Competitors", value: "23 found", trend: "—", trendColor: "text-[hsl(var(--muted-foreground))]" },
                              { metric: "Demand Score", value: "87/100", trend: "↑ High", trendColor: "text-emerald-400" },
                              { metric: "Best Channel", value: "Amazon EU", trend: "★", trendColor: "text-amber-400" },
                            ].map((row) => (
                              <div key={row.metric} className="flex items-center justify-between px-2 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                                <span className="flex-1 text-xs font-medium text-[hsl(var(--foreground))]">{row.metric}</span>
                                <span className="w-16 text-center text-[11px] font-semibold text-[hsl(var(--foreground))]">{row.value}</span>
                                <span className={cn("w-14 text-right text-[11px] font-medium", row.trendColor)}>{row.trend}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-[hsl(var(--border))]">
                  <p className="text-center text-sm font-semibold text-[hsl(var(--foreground))] tracking-wide">
                    One Image. <span className="text-[hsl(var(--accent))]">Infinite Insights.</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
