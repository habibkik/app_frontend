import { useState } from "react";
import { FileText, Download, Printer, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface PurchaseOrderGeneratorProps {
  rfqId: string;
  rfqTitle: string;
  supplierName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  toolingCost: number;
  logisticsCost: number;
  leadTimeDays: number;
}

export function PurchaseOrderGenerator({
  rfqId, rfqTitle, supplierName, unitPrice, quantity, unit, toolingCost, logisticsCost, leadTimeDays,
}: PurchaseOrderGeneratorProps) {
  const [poNumber] = useState(`PO-${Date.now().toString().slice(-8)}`);
  const [generated, setGenerated] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("123 Main Street, Warehouse A, City, Country");

  const subtotal = unitPrice * quantity;
  const total = subtotal + toolingCost + logisticsCost;
  const deliveryDate = new Date(Date.now() + leadTimeDays * 86400000).toLocaleDateString();

  const handleGenerate = () => {
    setGenerated(true);
    toast.success("Purchase Order generated successfully");
  };

  if (!generated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Purchase Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-xs text-muted-foreground">Supplier</p>
              <p className="font-medium">{supplierName}</p>
            </div>
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="font-medium">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Delivery Address</label>
            <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
          </div>
          <Button onClick={handleGenerate} className="w-full gap-2">
            <FileText className="h-4 w-4" /> Generate PO
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Check className="h-5 w-5 text-success" />
            Purchase Order — {poNumber}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.info("PDF download coming soon")}>
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.info("Print feature coming soon")}>
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div><p className="text-xs text-muted-foreground">PO Number</p><p className="font-medium">{poNumber}</p></div>
          <div><p className="text-xs text-muted-foreground">RFQ Reference</p><p className="font-medium">{rfqId}</p></div>
          <div><p className="text-xs text-muted-foreground">Issue Date</p><p className="font-medium">{new Date().toLocaleDateString()}</p></div>
          <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium">{supplierName}</p></div>
          <div><p className="text-xs text-muted-foreground">Expected Delivery</p><p className="font-medium">{deliveryDate}</p></div>
          <div><p className="text-xs text-muted-foreground">Status</p><Badge className="text-xs bg-success/10 text-success border-success/30">Issued</Badge></div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">{rfqTitle}</TableCell>
              <TableCell className="text-right">{quantity.toLocaleString()} {unit}</TableCell>
              <TableCell className="text-right">${unitPrice.toFixed(2)}</TableCell>
              <TableCell className="text-right">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
            </TableRow>
            {toolingCost > 0 && (
              <TableRow>
                <TableCell className="text-muted-foreground">Tooling Cost</TableCell>
                <TableCell className="text-right">1</TableCell>
                <TableCell className="text-right">${toolingCost.toLocaleString()}</TableCell>
                <TableCell className="text-right">${toolingCost.toLocaleString()}</TableCell>
              </TableRow>
            )}
            {logisticsCost > 0 && (
              <TableRow>
                <TableCell className="text-muted-foreground">Logistics / Shipping</TableCell>
                <TableCell className="text-right">1</TableCell>
                <TableCell className="text-right">${logisticsCost.toLocaleString()}</TableCell>
                <TableCell className="text-right">${logisticsCost.toLocaleString()}</TableCell>
              </TableRow>
            )}
            <TableRow className="font-bold border-t-2">
              <TableCell colSpan={3} className="text-right">Total</TableCell>
              <TableCell className="text-right">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="text-sm">
          <p className="text-xs text-muted-foreground mb-1">Delivery Address</p>
          <p>{deliveryAddress}</p>
        </div>
      </CardContent>
    </Card>
  );
}
