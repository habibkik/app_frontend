import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, Download, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function TabSettings() {
  const [profile, setProfile] = useState({
    businessName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    currency: "USD",
    bio: "",
  });

  const usageCount = 3;
  const usageLimit = 5;
  const currentPlan = "Free";

  const plans = [
    { name: "Free", products: "5", platforms: "2", ai: "Limited", analytics: "Basic", automation: false, inbox: false, price: "$0" },
    { name: "Pro", products: "50", platforms: "All", ai: "Full", analytics: "Full", automation: true, inbox: true, price: "$29/mo" },
    { name: "Business", products: "Unlimited", platforms: "All", ai: "Full + Priority", analytics: "Full + Export", automation: true, inbox: true, price: "$79/mo" },
  ];

  return (
    <div className="space-y-6">
      {/* Seller Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seller Profile</CardTitle>
          <CardDescription>Your business information for marketplace listings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} placeholder="Your business name" />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 234 567 890" />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} placeholder="United States" />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="New York" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Currency</Label>
              <Select value={profile.currency} onValueChange={(v) => setProfile({ ...profile, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["USD", "EUR", "GBP", "MAD", "DZD", "TND", "EGP", "SAR", "AED", "TRY", "INR", "BRL", "PKR", "IDR", "NGN", "KES"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio / About</Label>
            <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell buyers about your business..." rows={3} />
          </div>
          <Button onClick={() => toast.success("Profile saved")}><Save className="w-4 h-4 mr-1" /> Save Profile</Button>
        </CardContent>
      </Card>

      {/* Platform Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Default Auto-Publish Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {["Facebook Marketplace", "Instagram Shopping", "TikTok Shop", "WooCommerce", "Shopify"].map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <Checkbox />
                  <span className="text-sm">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label className="mb-2 block">Notification Preferences</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead className="text-center">Push</TableHead>
                  <TableHead className="text-center">In-App</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {["New message", "Listing expired", "Stock low", "Publishing error"].map((event) => (
                  <TableRow key={event}>
                    <TableCell className="text-sm">{event}</TableCell>
                    <TableCell className="text-center"><Checkbox /></TableCell>
                    <TableCell className="text-center"><Checkbox /></TableCell>
                    <TableCell className="text-center"><Checkbox defaultChecked /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription & Quota</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1">{currentPlan} Plan</Badge>
            <div className="flex-1">
              <p className="text-sm">{usageCount}/{usageLimit} products published this month</p>
              <Progress value={(usageCount / usageLimit) * 100} className="mt-1 h-2" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                {plans.map((p) => (
                  <TableHead key={p.name} className="text-center">
                    <div>{p.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">{p.price}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Products</TableCell>
                {plans.map((p) => <TableCell key={p.name} className="text-center text-sm">{p.products}</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell>Platforms</TableCell>
                {plans.map((p) => <TableCell key={p.name} className="text-center text-sm">{p.platforms}</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell>AI Tools</TableCell>
                {plans.map((p) => <TableCell key={p.name} className="text-center text-sm">{p.ai}</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell>Analytics</TableCell>
                {plans.map((p) => <TableCell key={p.name} className="text-center text-sm">{p.analytics}</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell>Automation</TableCell>
                {plans.map((p) => <TableCell key={p.name} className="text-center">{p.automation ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell>Unified Inbox</TableCell>
                {plans.map((p) => <TableCell key={p.name} className="text-center">{p.inbox ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}</TableCell>)}
              </TableRow>
            </TableBody>
          </Table>

          <Button>Upgrade Plan</Button>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline"><Download className="w-4 h-4 mr-1" /> Export All Data</Button>
          <div>
            <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-1" /> Delete Account</Button>
            <p className="text-xs text-muted-foreground mt-1">This will permanently delete all your data.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
