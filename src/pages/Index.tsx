import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import LogoMarquee from "@/components/landing/LogoMarquee";
import Features from "@/components/landing/Features";
import RoleCards from "@/components/landing/RoleCards";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";

const Index = () => {
  return (
    <div className="min-h-screen bg-column">
      <Navigation />
      <Hero />
      <StatsBar />
      <LogoMarquee />
      <InteractiveDemo />
      <Features />
      <RoleCards />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
