import { Download, FileSpreadsheet, FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { BOMComponent } from "@/data/bom";

interface BOMExportActionsProps {
  components: BOMComponent[];
  productName: string;
}

export function BOMExportActions({ components, productName }: BOMExportActionsProps) {
  const { toast } = useToast();

  const exportToCSV = () => {
    const headers = ["Component", "Category", "Quantity", "Unit", "Unit Cost", "Total Cost", "Specifications"];
    const rows = components.map((c) => [
      c.name,
      c.category,
      c.quantity,
      c.unit,
      c.unitCost.toFixed(2),
      c.totalCost.toFixed(2),
      c.specifications || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-bom.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "BOM exported as CSV file",
    });
  };

  const exportToJSON = () => {
    const data = {
      productName,
      exportedAt: new Date().toISOString(),
      totalCost: components.reduce((sum, c) => sum + c.totalCost, 0),
      components: components.map((c) => ({
        name: c.name,
        category: c.category,
        quantity: c.quantity,
        unit: c.unit,
        unitCost: c.unitCost,
        totalCost: c.totalCost,
        specifications: c.specifications,
        material: c.material,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-bom.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "BOM exported as JSON file",
    });
  };

  const copyShareLink = () => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={exportToCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToJSON}>
            <FileText className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" onClick={copyShareLink}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  );
}
