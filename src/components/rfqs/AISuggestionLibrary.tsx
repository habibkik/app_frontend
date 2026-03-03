import { useState } from "react";
import { Brain, Search, Copy, Plus, Tag, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Snippet {
  id: string;
  title: string;
  content: string;
  tags: string[];
  usageCount: number;
  aiGenerated: boolean;
}

const MOCK_SNIPPETS: Snippet[] = [
  {
    id: "1", title: "Quality Assurance Requirement",
    content: "All products must comply with ISO 9001:2015 quality management standards. Supplier must provide a Certificate of Analysis (CoA) with each shipment and allow factory audits upon request.",
    tags: ["quality", "compliance"], usageCount: 18, aiGenerated: false,
  },
  {
    id: "2", title: "Payment Terms — Net 60",
    content: "Payment terms: Net 60 days from date of invoice. Early payment discount of 2% available for payment within 15 days. All invoices must reference the PO number.",
    tags: ["payment", "finance"], usageCount: 24, aiGenerated: false,
  },
  {
    id: "3", title: "Packaging Standard",
    content: "Products must be packed in anti-static ESD bags, placed in moisture barrier bags with desiccant, and shipped in double-wall corrugated boxes. Each box must be labeled with part number, quantity, lot number, and date of manufacture.",
    tags: ["packaging", "logistics"], usageCount: 12, aiGenerated: false,
  },
  {
    id: "4", title: "AI: Competitive Pricing Request",
    content: "We are evaluating multiple suppliers for this requirement. Please provide your most competitive pricing including volume discounts for quantities of 5K, 10K, and 25K units. Include any available cost optimization suggestions.",
    tags: ["pricing", "negotiation"], usageCount: 9, aiGenerated: true,
  },
  {
    id: "5", title: "AI: Lead Time Urgency",
    content: "This is a time-sensitive requirement. Priority will be given to suppliers who can deliver within the shortest lead time while maintaining quality standards. Please indicate your earliest possible delivery date and any expedite options.",
    tags: ["delivery", "urgent"], usageCount: 7, aiGenerated: true,
  },
  {
    id: "6", title: "Warranty & Returns",
    content: "Supplier must provide a minimum 12-month warranty from date of delivery. Defective products must be replaced at no cost within 30 days of RMA approval. Supplier bears return shipping costs for defective items.",
    tags: ["warranty", "returns"], usageCount: 15, aiGenerated: false,
  },
];

interface AISuggestionLibraryProps {
  onInsert?: (content: string) => void;
}

export function AISuggestionLibrary({ onInsert }: AISuggestionLibraryProps) {
  const [snippets] = useState<Snippet[]>(MOCK_SNIPPETS);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = [...new Set(snippets.flatMap((s) => s.tags))];

  const filtered = snippets.filter((s) => {
    const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || s.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search snippets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant={selectedTag === null ? "default" : "outline"} className="cursor-pointer text-xs"
          onClick={() => setSelectedTag(null)}>All</Badge>
        {allTags.map((tag) => (
          <Badge key={tag} variant={selectedTag === tag ? "default" : "outline"} className="cursor-pointer text-xs"
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}>
            <Tag className="h-3 w-3 mr-1" />{tag}
          </Badge>
        ))}
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-2">
          {filtered.map((snippet) => (
            <Card key={snippet.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {snippet.aiGenerated && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                    <p className="text-sm font-medium">{snippet.title}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">Used {snippet.usageCount}x</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-3">{snippet.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {snippet.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px] h-4">{t}</Badge>)}
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={() => handleCopy(snippet.content)}>
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                    {onInsert && (
                      <Button variant="default" size="sm" className="h-6 text-xs gap-1" onClick={() => { onInsert(snippet.content); toast.success("Inserted"); }}>
                        <Plus className="h-3 w-3" /> Insert
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No matching snippets</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
