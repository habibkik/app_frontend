import { useState, useEffect } from "react";
import { BREAKPOINTS } from "@/utils/constants";

const MOBILE_BREAKPOINT = BREAKPOINTS.MD;

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<keyof typeof BREAKPOINTS | "XS">("XS");

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= BREAKPOINTS["2XL"]) setBreakpoint("2XL");
      else if (width >= BREAKPOINTS.XL) setBreakpoint("XL");
      else if (width >= BREAKPOINTS.LG) setBreakpoint("LG");
      else if (width >= BREAKPOINTS.MD) setBreakpoint("MD");
      else if (width >= BREAKPOINTS.SM) setBreakpoint("SM");
      else setBreakpoint("XS");
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}
