import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Key, Smartphone, History, AlertTriangle, Check, X } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function SecuritySection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sessions] = useState<Session[]>([
    {
      id: "1",
      device: "Chrome on Windows",
      location: "New York, US",
      lastActive: "Now",
      current: true,
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "New York, US",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: "3",
      device: "Firefox on MacOS",
      location: "San Francisco, US",
      lastActive: "1 day ago",
      current: false,
    },
  ]);

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: t("security.passwordsDontMatch"),
        description: t("security.passwordsDontMatchDesc"),
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: t("security.passwordTooShort"),
        description: t("security.passwordTooShortDesc"),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("security.passwordChanged"),
      description: t("security.passwordChangedDesc"),
    });
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleRevokeSession = (sessionId: string) => {
    toast({
      title: t("security.sessionRevoked"),
      description: t("security.sessionRevokedDesc"),
    });
  };

  const handleRevokeAllSessions = () => {
    toast({
      title: t("security.allSessionsRevoked"),
      description: t("security.allSessionsRevokedDesc"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t("security.password", "Password")}
          </CardTitle>
          <CardDescription>{t("security.passwordDesc", "Password Description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("security.password", "Password")}</Label>
              <p className="text-sm text-muted-foreground">{t("security.lastChanged", "Last Changed")}</p>
            </div>
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>{t("security.changePassword", "Change Password")}</Button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                {t("security.twoFactor", "Two Factor")}
                {settings.twoFactorEnabled ? (
                  <Badge className="bg-success/10 text-success">{t("security.enabled")}</Badge>
                ) : (
                  <Badge variant="outline">{t("security.disabled", "Disabled")}</Badge>
                )}
              </Label>
              <p className="text-sm text-muted-foreground">{t("security.twoFactorDesc", "Two Factor Description")}</p>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => {
                setSettings(prev => ({ ...prev, twoFactorEnabled: checked }));
                toast({
                  title: checked ? t("security.twoFaEnabled") : t("security.twoFaDisabled"),
                  description: checked 
                    ? t("security.twoFaEnabledDesc") 
                    : t("security.twoFaDisabledDesc"),
                });
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>{t("security.loginNotifications", "Login Notifications")}</Label>
              <p className="text-sm text-muted-foreground">{t("security.loginNotificationsDesc", "Login Notifications Description")}</p>
            </div>
            <Switch
              checked={settings.loginNotifications}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, loginNotifications: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t("security.activeSessions", "Active Sessions")}
            </CardTitle>
            <CardDescription>{t("security.activeSessionsDesc", "Active Sessions Description")}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRevokeAllSessions}>{t("security.revokeAllOthers", "Revoke All Others")}</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {session.device}
                      {session.current && <Badge className="bg-success/10 text-success">{t("security.current", "Current")}</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.location} • {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t("security.revoke", "Revoke")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t("security.dangerZone", "Danger Zone")}
          </CardTitle>
          <CardDescription>{t("security.dangerZoneDesc", "Danger Zone Description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("security.deleteAccount", "Delete Account")}</Label>
              <p className="text-sm text-muted-foreground">{t("security.deleteAccountDesc", "Delete Account Description")}</p>
            </div>
            <Button variant="destructive">{t("security.deleteAccount", "Delete Account")}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("security.changePasswordTitle")}</DialogTitle>
            <DialogDescription>{t("security.changePasswordDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t("security.currentPassword")}</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t("security.newPassword")}</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("security.confirmNewPassword")}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangingPassword(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleChangePassword}>
              <Check className="h-4 w-4 mr-2" />
              {t("security.changePassword")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
