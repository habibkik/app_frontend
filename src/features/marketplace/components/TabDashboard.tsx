import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Eye, MessageSquare, TrendingUp, Package, Star, Archive, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function TabDashboard() {
  const queryClient = useQueryClient();

  const { data: published, isLoading: pubLoading } = useQuery({
    queryKey: ["marketplace-published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_published")
        .select("*, marketplace_listings(title, price, currency)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: messages, isLoading: msgLoading } = useQuery({
    queryKey: ["marketplace-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketplace_messages").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["marketplace-messages"] }),
  });

  const totalViews = (published || []).reduce((sum: number, p: any) => sum + (p.views || 0), 0);
  const totalInquiries = (published || []).reduce((sum: number, p: any) => sum + (p.inquiries || 0), 0);
  const totalListings = published?.length || 0;
  const totalRevenue = (published || []).reduce((sum: number, p: any) => sum + (p.revenue || 0), 0);

  // Platform breakdown for chart
  const platformStats: Record<string, { views: number; inquiries: number }> = {};
  (published || []).forEach((p: any) => {
    if (!platformStats[p.platform_name]) platformStats[p.platform_name] = { views: 0, inquiries: 0 };
    platformStats[p.platform_name].views += p.views || 0;
    platformStats[p.platform_name].inquiries += p.inquiries || 0;
  });
  const chartData = Object.entries(platformStats).map(([name, stats]) => ({ name, ...stats }));

  const unreadCount = (messages || []).filter((m: any) => !m.is_read).length;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Listings", value: totalListings, icon: Package, color: "text-blue-500" },
          { label: "Total Views", value: totalViews, icon: Eye, color: "text-emerald-500" },
          { label: "Inquiries", value: totalInquiries, icon: MessageSquare, color: "text-amber-500" },
          { label: "Revenue", value: `$${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Views by Platform</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Inquiries by Platform</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="inquiries" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Published Listings Table */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Published Listings</CardTitle></CardHeader>
        <CardContent>
          {pubLoading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (published || []).length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No published listings yet. Publish your first product from the Connections tab.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Inquiries</TableHead>
                  <TableHead>Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(published || []).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{(p as any).marketplace_listings?.title || "—"}</TableCell>
                    <TableCell>{p.platform_name}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "published" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.views}</TableCell>
                    <TableCell>{p.inquiries}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Unified Inbox */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" /> Unified Inbox
            {unreadCount > 0 && <Badge variant="destructive" className="text-[10px] h-4 px-1.5">{unreadCount}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {msgLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (messages || []).length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">No messages yet</p>
          ) : (
            <Accordion type="single" collapsible className="space-y-1">
              {(messages || []).map((m: any) => (
                <AccordionItem key={m.id} value={m.id} className={!m.is_read ? "bg-primary/5 rounded-md" : ""}>
                  <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                    <div className="flex items-center gap-2 text-left flex-1">
                      <Badge variant="outline" className="text-[10px] shrink-0">{m.platform_name}</Badge>
                      <span className="font-medium">{m.customer_name || "Unknown"}</span>
                      <span className="text-muted-foreground truncate flex-1">{m.message_text}</span>
                      {m.is_starred && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <p className="text-sm mb-2">{m.message_text}</p>
                    <div className="flex gap-2">
                      {!m.is_read && (
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => markReadMutation.mutate(m.id)}>Mark Read</Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-xs"><Archive className="w-3 h-3 mr-1" /> Archive</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
