import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

const useCountUp = (end: number, duration = 2000, startCounting: boolean) => {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!startCounting || hasRun.current) return;
    hasRun.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
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
    <div className="text-center px-8 py-4">
      <div className="text-3xl md:text-5xl font-bold text-column-teal tracking-tight">
        {prefix}{display}{suffix}
      </div>
      <div className="text-sm text-column-muted mt-1">{label}</div>
    </div>
  );
};

const StatsBar = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { value: "$2.5B+", label: t("hero.stats.tradeVolume") },
    { value: "50K+", label: t("hero.stats.suppliers") },
    { value: "99.2%", label: t("hero.stats.accuracy") },
    { value: "<2s", label: t("hero.stats.analysisTime") },
  ];

  return (
    <section className="py-20 bg-column">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center">
                <AnimatedStat value={stat.value} label={stat.label} inView={inView} />
                {index < stats.length - 1 && (
                  <div className="hidden md:block w-px h-12 bg-gray-300/50" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsBar;
