import { useTranslation } from "react-i18next";
import { CreditCard, Download, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const BILLING_HISTORY = [
  { date: "2025-01-15", description: "Pro Plan - Monthly", amount: "$49.00", invoice: "#INV-2025-001" },
  { date: "2024-12-15", description: "Pro Plan - Monthly", amount: "$49.00", invoice: "#INV-2024-012" },
  { date: "2024-11-15", description: "Pro Plan - Monthly", amount: "$49.00", invoice: "#INV-2024-011" },
];

export function BillingSection() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t("settings.billing.title")}
          </CardTitle>
          <CardDescription>{t("settings.billing.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted rounded-lg mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{t("settings.billing.proPlan")}</h3>
                <Badge className="bg-primary/10 text-primary border-primary/20">{t("settings.billing.active")}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">$49/{t("settings.billing.month")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.billing.nextBilling")}: Feb 15, 2025</p>
            </div>
            <Button variant="outline">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              {t("settings.billing.upgradePlan")}
            </Button>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">{t("settings.billing.expires")} 12/26</p>
              </div>
            </div>
            <Button variant="outline" size="sm">{t("settings.billing.updateCard")}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.billing.history")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("settings.billing.date")}</TableHead>
                <TableHead>{t("settings.billing.descriptionCol")}</TableHead>
                <TableHead>{t("settings.billing.amount")}</TableHead>
                <TableHead>{t("settings.billing.invoiceCol")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BILLING_HISTORY.map((item) => (
                <TableRow key={item.invoice}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="font-medium">{item.amount}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />{item.invoice}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
