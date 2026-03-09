/**
 * Dense dot-matrix world map SVG — Column.com style.
 * ~600 dots on a 12-px grid, placed only where land masses exist.
 */
const HeroDotMap = () => {
  // Each sub-array: [startX, startY, count, step] or raw [x,y] pairs
  // Generated to approximate continent outlines on a 1440×720 viewBox at ~12px spacing
  const dots: [number, number][] = [];

  // Helper: add a horizontal run of dots
  const run = (x0: number, y0: number, count: number, step = 12) => {
    for (let i = 0; i < count; i++) dots.push([x0 + i * step, y0]);
  };

  // ── North America ──
  // Canada / Alaska
  run(180, 96, 8); run(168, 108, 10); run(156, 120, 12); run(168, 132, 11);
  run(180, 144, 10); run(192, 156, 9); run(204, 168, 8);
  // USA
  run(192, 180, 10); run(204, 192, 9); run(216, 204, 8); run(228, 216, 7);
  run(240, 228, 5); run(204, 204, 3);
  // Mexico / Central America
  run(228, 240, 5); run(240, 252, 4); run(252, 264, 3); run(264, 276, 2);

  // ── South America ──
  run(300, 300, 4); run(288, 312, 5); run(276, 324, 6); run(276, 336, 5);
  run(276, 348, 5); run(276, 360, 4); run(276, 372, 4); run(276, 384, 3);
  run(276, 396, 3); run(276, 408, 3); run(288, 420, 2); run(276, 432, 3);
  run(276, 444, 2); run(276, 456, 2); run(276, 468, 2); run(276, 480, 1);

  // ── Europe ──
  run(600, 108, 8); run(612, 120, 9); run(600, 132, 10); run(612, 144, 9);
  run(612, 156, 8); run(624, 168, 6); run(624, 180, 5);

  // ── Africa ──
  run(624, 204, 5); run(612, 216, 7); run(612, 228, 7); run(612, 240, 8);
  run(624, 252, 7); run(624, 264, 7); run(636, 276, 6); run(636, 288, 5);
  run(648, 300, 4); run(648, 312, 4); run(648, 324, 3); run(648, 336, 3);
  run(660, 348, 2); run(660, 360, 2); run(660, 372, 2); run(672, 384, 1);

  // ── Middle East ──
  run(720, 168, 5); run(708, 180, 6); run(720, 192, 5); run(732, 204, 3);

  // ── Russia / Central Asia ──
  run(720, 96, 18); run(720, 108, 20); run(732, 120, 18); run(744, 132, 16);
  run(756, 144, 12); run(768, 156, 8);

  // ── South Asia / India ──
  run(840, 180, 5); run(828, 192, 6); run(828, 204, 5); run(840, 216, 4);
  run(852, 228, 3); run(852, 240, 2); run(864, 252, 2);

  // ── East Asia / China / Japan ──
  run(936, 132, 8); run(924, 144, 9); run(924, 156, 9); run(936, 168, 8);
  run(948, 180, 6); run(960, 192, 5); run(972, 204, 3);
  // Japan
  run(1044, 156, 2); run(1044, 168, 2); run(1056, 180, 2);

  // ── Southeast Asia ──
  run(960, 216, 4); run(948, 228, 5); run(960, 240, 4); run(972, 252, 3);
  run(984, 264, 3); run(996, 276, 2);

  // ── Indonesia / Philippines ──
  run(1008, 276, 5); run(996, 288, 6); run(1008, 300, 4); run(1020, 312, 3);

  // ── Australia ──
  run(1020, 372, 8); run(1008, 384, 9); run(1008, 396, 9); run(1020, 408, 7);
  run(1032, 420, 5); run(1044, 432, 3);

  // ── New Zealand ──
  run(1140, 432, 2); run(1140, 444, 2);

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 1440 720"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.4} fill="hsl(220, 60%, 15%)" />
      ))}
    </svg>
  );
};

export default HeroDotMap;
