import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import LogoMarquee from "@/components/landing/LogoMarquee";
import Features from "@/components/landing/Features";
import RoleCards from "@/components/landing/RoleCards";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import ParallaxSection from "@/components/landing/ParallaxSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-column overflow-x-hidden">
      <Navigation />
      <Hero />

      <LogoMarquee />

      <ParallaxSection offsetY={[30, -30]} scale={[0.98, 1]}>
        <InteractiveDemo />
      </ParallaxSection>

      <ParallaxSection offsetY={[50, -20]} opacity={[0.7, 1]}>
        <Features />
      </ParallaxSection>

      <ParallaxSection offsetY={[40, -40]} scale={[0.96, 1]}>
        <RoleCards />
      </ParallaxSection>

      <ParallaxSection offsetY={[30, -30]} opacity={[0.75, 1]}>
        <HowItWorks />
      </ParallaxSection>

      <ParallaxSection offsetY={[50, -20]} scale={[0.97, 1]}>
        <Testimonials />
      </ParallaxSection>

      <ParallaxSection offsetY={[40, -10]} opacity={[0.8, 1]}>
        <CTA />
      </ParallaxSection>

      <Footer />
    </div>
  );
};

export default Index;
