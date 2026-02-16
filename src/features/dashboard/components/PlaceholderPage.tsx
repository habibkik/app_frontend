import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LucideIcon, Construction } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "./DashboardLayout";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
  children?: ReactNode;
}

export function PlaceholderPage({ 
  title, 
  description, 
  icon: Icon, 
  features = [],
  children 
}: PlaceholderPageProps) {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-dashed">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Construction className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>{t("pages.placeholder.comingSoon")}</CardTitle>
              <CardDescription>
                {t("pages.placeholder.underDevelopment")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {features.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-center">{t("pages.placeholder.plannedFeatures")}</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary/50" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <Button variant="outline" disabled>
                  {t("pages.placeholder.enableFeature")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {children}
      </div>
    </DashboardLayout>
  );
}
