import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

const RESEND_COOLDOWN = 45;

export default function EmailVerificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = useCallback(async (value: string) => {
    if (value.length !== 6) return;
    setIsVerifying(true);
    // Simulate verification delay
    await new Promise((r) => setTimeout(r, 1500));
    setIsVerifying(false);
    toast({ title: t("emailVerification.successTitle"), description: t("emailVerification.successDesc") });
    navigate("/dashboard");
  }, [navigate, toast, t]);

  const handleResend = () => {
    setCountdown(RESEND_COOLDOWN);
    setCanResend(false);
    toast({ title: t("emailVerification.resentTitle"), description: t("emailVerification.resentDesc") });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left gradient panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <span className="text-2xl font-bold">T</span>
              </div>
              <span className="text-2xl font-bold">TradePlatform</span>
            </div>
            <MailCheck className="w-16 h-16 mb-6 text-accent" />
            <h1 className="text-4xl font-bold mb-4">{t("emailVerification.heroTitle")}</h1>
            <p className="text-lg text-primary-foreground/70 max-w-md">{t("emailVerification.heroDesc")}</p>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md text-center">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold">TradePlatform</span>
          </div>

          <MailCheck className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold text-foreground mb-2">{t("emailVerification.title")}</h2>
          <p className="text-muted-foreground mb-8">{t("emailVerification.subtitle")}</p>

          <div className="flex justify-center mb-8">
            <InputOTP maxLength={6} value={otp} onChange={(val) => { setOtp(val); if (val.length === 6) handleVerify(val); }}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {isVerifying && (
            <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("emailVerification.verifying")}</span>
            </div>
          )}

          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleResend} disabled={!canResend}>
              {canResend
                ? t("emailVerification.resendCode")
                : t("emailVerification.resendIn", { seconds: countdown })}
            </Button>

            <Link to="/signup" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeft className="w-4 h-4" />
              {t("emailVerification.wrongEmail")}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
