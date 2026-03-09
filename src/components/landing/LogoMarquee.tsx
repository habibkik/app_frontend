const logos = [
  "TechCorp Industries",
  "Rodriguez Manufacturing",
  "Global Retail Co",
  "Brex",
  "Mercury",
  "Ramp",
  "Best Egg",
];

const LogoMarquee = () => {
  return (
    <section className="bg-column py-8 overflow-hidden">
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="marquee-track hover:[animation-play-state:paused]">
          {[0, 1].map((set) => (
            <div key={set} className="flex shrink-0 items-center" style={{ gap: 60 }}>
              {logos.map((name) => (
                <span
                  key={`${set}-${name}`}
                  className="whitespace-nowrap text-base font-medium shrink-0"
                  style={{ color: "#6B7280" }}
                >
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
