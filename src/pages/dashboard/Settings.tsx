import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Key, 
  MessageSquare, 
  Mail, 
  Share2,
  Shield,
  Bell,
  User,
  Building2,
  CreditCard,
  Plug,
  Database,
} from "lucide-react";

import { DashboardLayout } from "@/features/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { APIKeysSection } from "@/components/settings/APIKeysSection";
import { SocialMediaSection } from "@/components/settings/SocialMediaSection";
import { EmailIntegrationSection } from "@/components/settings/EmailIntegrationSection";
import { MessagingSection } from "@/components/settings/MessagingSection";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { NotificationSection } from "@/components/settings/NotificationSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { CompanySection } from "@/components/settings/CompanySection";
import { BillingSection } from "@/components/settings/BillingSection";
import { IntegrationsSection } from "@/components/settings/IntegrationsSection";
import { ERPIntegrationSection } from "@/components/settings/ERPIntegrationSection";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("api-keys");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground flex items-center gap-2"
          >
            <SettingsIcon className="h-6 w-6" />
            Settings
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys, integrations, and account settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:grid-cols-11 gap-2 h-auto p-1">
            <TabsTrigger value="api-keys" className="flex items-center gap-2 py-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="social-media" className="flex items-center gap-2 py-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Social Media</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2 py-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2 py-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messaging</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 py-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 py-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 py-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2 py-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2 py-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2 py-2">
              <Plug className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="erp" className="flex items-center gap-2 py-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">ERP</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys"><APIKeysSection /></TabsContent>
          <TabsContent value="social-media"><SocialMediaSection /></TabsContent>
          <TabsContent value="email"><EmailIntegrationSection /></TabsContent>
          <TabsContent value="messaging"><MessagingSection /></TabsContent>
          <TabsContent value="profile"><ProfileSection /></TabsContent>
          <TabsContent value="notifications"><NotificationSection /></TabsContent>
          <TabsContent value="security"><SecuritySection /></TabsContent>
          <TabsContent value="company"><CompanySection /></TabsContent>
          <TabsContent value="billing"><BillingSection /></TabsContent>
          <TabsContent value="integrations"><IntegrationsSection /></TabsContent>
          <TabsContent value="erp"><ERPIntegrationSection /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
