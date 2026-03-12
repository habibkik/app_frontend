import { DashboardLayout } from "@/features/dashboard";
import { RFQTemplatesLibrary } from "@/components/rfqs/RFQTemplatesLibrary";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function RFQTemplates() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {t("pages.rfqTemplates.title")}
          </motion.h1>
          <p className="text-muted-foreground mt-1">{t("pages.rfqTemplates.subtitle")}</p>
        </div>
        <RFQTemplatesLibrary />
      </div>
    </DashboardLayout>
  );
}
