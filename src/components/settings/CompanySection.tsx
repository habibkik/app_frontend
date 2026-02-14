import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function CompanySection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    website: "",
    timezone: "UTC",
    currency: "USD",
  });

  const handleSave = () => {
    toast({ title: t("common.success"), description: t("settings.company.saved") });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {t("settings.company.title")}
        </CardTitle>
        <CardDescription>{t("settings.company.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" />{t("settings.company.uploadLogo")}</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t("settings.company.companyName")}</label>
            <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t("settings.company.website")}</label>
            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t("settings.company.industry")}</label>
            <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
              <SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger>
              <SelectContent>
                {["Manufacturing", "Retail", "Wholesale", "Technology", "Agriculture", "Other"].map((i) => (
                  <SelectItem key={i} value={i.toLowerCase()}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t("settings.company.companySize")}</label>
            <Select value={form.companySize} onValueChange={(v) => setForm({ ...form, companySize: v })}>
              <SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger>
              <SelectContent>
                {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
                  <SelectItem key={s} value={s}>{s} {t("settings.company.employees")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t("settings.company.timezone")}</label>
            <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["UTC", "America/New_York", "Europe/London", "Europe/Paris", "Asia/Dubai", "Asia/Shanghai"].map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t("settings.company.currency")}</label>
            <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["USD", "EUR", "GBP", "AED", "CNY", "INR"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave}>{t("common.save")}</Button>
      </CardContent>
    </Card>
  );
}
