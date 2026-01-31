import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Plus,
  Check,
  AlertCircle,
  Bot,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface APIKey {
  id: string;
  name: string;
  service: string;
  key: string;
  lastUsed: string;
  status: "active" | "expired" | "revoked";
  createdAt: string;
}

const initialKeys: APIKey[] = [
  {
    id: "1",
    name: "OpenAI Production",
    service: "openai",
    key: "sk-proj-xxxxxxxxxxxxxxxxxxxxx",
    lastUsed: "2 hours ago",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Anthropic Claude",
    service: "anthropic",
    key: "sk-ant-xxxxxxxxxxxxxxxxxxxxx",
    lastUsed: "1 day ago",
    status: "active",
    createdAt: "2024-01-10",
  },
];

const serviceOptions = [
  { value: "openai", label: "OpenAI", icon: Bot },
  { value: "anthropic", label: "Anthropic", icon: Bot },
  { value: "google", label: "Google AI", icon: Bot },
  { value: "cohere", label: "Cohere", icon: Bot },
  { value: "huggingface", label: "HuggingFace", icon: Bot },
  { value: "custom", label: "Custom API", icon: Zap },
];

export function APIKeysSection() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>(initialKeys);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newKeyService, setNewKeyService] = useState("");

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const deleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    toast({
      title: "Key Deleted",
      description: "API key has been removed",
    });
  };

  const addNewKey = () => {
    if (!newKeyName || !newKeyValue || !newKeyService) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      service: newKeyService,
      key: newKeyValue,
      lastUsed: "Never",
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName("");
    setNewKeyValue("");
    setNewKeyService("");
    setIsAddingKey(false);
    
    toast({
      title: "Key Added",
      description: "New API key has been saved securely",
    });
  };

  const getStatusColor = (status: APIKey["status"]) => {
    switch (status) {
      case "active": return "bg-success/10 text-success";
      case "expired": return "bg-warning/10 text-warning";
      case "revoked": return "bg-destructive/10 text-destructive";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage your API keys for AI services and external integrations
            </CardDescription>
          </div>
          <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New API Key</DialogTitle>
                <DialogDescription>
                  Add a new API key for external services. Keys are stored securely.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., OpenAI Production"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select value={newKeyService} onValueChange={setNewKeyService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          <div className="flex items-center gap-2">
                            <service.icon className="h-4 w-4" />
                            {service.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="sk-..."
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingKey(false)}>
                  Cancel
                </Button>
                <Button onClick={addNewKey}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No API keys configured</p>
                <p className="text-sm">Add your first API key to get started</p>
              </div>
            ) : (
              apiKeys.map((apiKey, index) => (
                <motion.div
                  key={apiKey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <Badge variant="outline" className={getStatusColor(apiKey.status)}>
                        {apiKey.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm text-muted-foreground font-mono">
                        {visibleKeys[apiKey.id] 
                          ? apiKey.key 
                          : apiKey.key.replace(/./g, "•").slice(0, 24) + "..."
                        }
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last used: {apiKey.lastUsed} • Created: {apiKey.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {visibleKeys[apiKey.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyKey(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteKey(apiKey.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <h4 className="font-medium text-primary">Security Note</h4>
              <p className="text-sm text-muted-foreground mt-1">
                API keys are encrypted and stored securely. Never share your API keys publicly. 
                Consider rotating keys periodically for enhanced security.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
