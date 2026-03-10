import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Y offset range in px — positive = moves down as you scroll */
  offsetY?: [number, number];
  /** Opacity range */
  opacity?: [number, number];
  /** Scale range */
  scale?: [number, number];
  id?: string;
}

const ParallaxSection = ({
  children,
  className,
  offsetY = [40, -40],
  opacity = [0.85, 1],
  scale = [0.97, 1],
  id,
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], offsetY);
  const opacityVal = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [opacity[0], 1, 1, opacity[1]]);
  const scaleVal = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [scale[0], 1, 1, scale[0]]);

  return (
    <div ref={ref} className={className} id={id}>
      <motion.div style={{ y, opacity: opacityVal, scale: scaleVal }}>
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxSection;
