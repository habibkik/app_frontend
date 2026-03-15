import { useState, useEffect } from "react";
import { Brain, Plus, Search, Loader2, BookOpen, FileText, ScrollText, Handshake, Tag, Lightbulb, DollarSign, AlertTriangle, Users, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface KnowledgeEntry {
  id: string;
  type: string;
  title: string;
  content_summary: string;
  tags: string[];
  metadata_json: any;
  source_id: string | null;
  created_at: string;
}

interface QuerySuggestions {
  explanation: string;
  terms: string[];
  pricing: string | null;
  suppliers: string[];
  risks: string[];
}

interface QueryResult {
  matches: KnowledgeEntry[];
  suggestions: QuerySuggestions;
}

const TYPE_OPTIONS = [
  { value: "rfq", label: "RFQ", icon: FileText },
  { value: "contract", label: "Contract", icon: ScrollText },
  { value: "bid", label: "Bid / Proposal", icon: Handshake },
  { value: "policy", label: "Policy", icon: BookOpen },
];

const typeIcon = (type: string) => {
  const opt = TYPE_OPTIONS.find(o => o.value === type);
  return opt ? opt.icon : FileText;
};

export function ProcurementKnowledgeBrain() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryText, setQueryText] = useState("");
  const [querying, setQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: "", content: "", type: "rfq", tags: "" });
  const [filterType, setFilterType] = useState<string>("all");

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("procurement_knowledge")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      toast.error("Failed to load knowledge base");
    } else {
      setEntries((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleAdd = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setAdding(true);
    try {
      const { data, error } = await supabase.functions.invoke("procurement-knowledge", {
        body: {
          action: "store",
          title: newEntry.title,
          content: newEntry.content,
          type: newEntry.type,
          tags: newEntry.tags.split(",").map(t => t.trim()).filter(Boolean),
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to store");
      toast.success("Knowledge entry added and summarized by AI");
      setAddOpen(false);
      setNewEntry({ title: "", content: "", type: "rfq", tags: "" });
      fetchEntries();
    } catch (err: any) {
      toast.error(err.message || "Failed to add entry");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("procurement_knowledge").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success("Entry deleted");
    }
  };

  const handleQuery = async () => {
    if (!queryText.trim()) return;
    setQuerying(true);
    setQueryResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("procurement-knowledge", {
        body: {
          action: "query",
          query_text: queryText,
          type_filter: filterType !== "all" ? filterType : undefined,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Query failed");
      setQueryResult({ matches: data.matches, suggestions: data.suggestions });
      if (typeof data.suggestions === "string") {
        toast.info(data.suggestions);
        setQueryResult(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Query failed");
    } finally {
      setQuerying(false);
    }
  };

  const filteredEntries = filterType === "all" ? entries : entries.filter(e => e.type === filterType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Procurement Knowledge Brain
          </h2>
          <p className="text-muted-foreground mt-1">
            AI learns from your past RFQs, contracts, bids, and policies to make new procurements smarter.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Knowledge</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Procurement Knowledge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title</Label>
                <Input placeholder="e.g. Steel Pipes RFQ Q3 2025" value={newEntry.title} onChange={e => setNewEntry(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={newEntry.type} onValueChange={v => setNewEntry(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content (paste full document, specs, or notes)</Label>
                <Textarea rows={8} placeholder="Paste the full RFQ, contract terms, bid response, or procurement notes…" value={newEntry.content} onChange={e => setNewEntry(p => ({ ...p, content: e.target.value }))} />
                <p className="text-xs text-muted-foreground mt-1">AI will summarize this automatically.</p>
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input placeholder="steel, pipes, Algeria, supplier-xyz" value={newEntry.tags} onChange={e => setNewEntry(p => ({ ...p, tags: e.target.value }))} />
              </div>
              <Button onClick={handleAdd} disabled={adding} className="w-full">
                {adding ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Summarizing & Storing…</> : "Add to Knowledge Base"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Query */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Ask Your Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. What pricing did we get for steel pipes last time?"
              value={queryText}
              onChange={e => setQueryText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleQuery()}
              className="flex-1"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleQuery} disabled={querying || !queryText.trim()}>
              {querying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Query Results */}
          <AnimatePresence>
            {queryResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-4">
                {/* Suggestions */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                  <p className="text-sm text-foreground font-medium">{queryResult.suggestions.explanation}</p>

                  {queryResult.suggestions.terms.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Suggested Terms</p>
                      <div className="flex flex-wrap gap-1.5">
                        {queryResult.suggestions.terms.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {queryResult.suggestions.pricing && (
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground">{queryResult.suggestions.pricing}</p>
                    </div>
                  )}

                  {queryResult.suggestions.suppliers.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {queryResult.suggestions.suppliers.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {queryResult.suggestions.risks.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-destructive mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Risk Warnings
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {queryResult.suggestions.risks.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Matched entries */}
                {queryResult.matches.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Related Past Records ({queryResult.matches.length})</p>
                    <div className="space-y-2">
                      {queryResult.matches.map(entry => {
                        const Icon = typeIcon(entry.type);
                        return (
                          <div key={entry.id} className="p-3 rounded-lg border bg-card">
                            <div className="flex items-start gap-2">
                              <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground">{entry.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.content_summary}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">{entry.type}</Badge>
                                  <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Knowledge Base Entries */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Knowledge Base ({filteredEntries.length} entries)</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchEntries} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No knowledge entries yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add past RFQs, contracts, and bids to start building your procurement intelligence.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add First Entry
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-2">
                {filteredEntries.map((entry, i) => {
                  const Icon = typeIcon(entry.type);
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm text-foreground">{entry.title}</p>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.content_summary}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">{entry.type}</Badge>
                            {(entry.tags || []).slice(0, 3).map((tag, ti) => (
                              <Badge key={ti} variant="secondary" className="text-xs">
                                <Tag className="h-2.5 w-2.5 mr-0.5" />{tag}
                              </Badge>
                            ))}
                            <span className="text-xs text-muted-foreground ml-auto">{new Date(entry.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
