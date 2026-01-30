import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-lg font-bold">TradePlatform</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-muted-foreground">
              This is your dashboard. Connect your backend to unlock full functionality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  Dashboard Ready
                </CardTitle>
                <CardDescription>
                  Your authentication is working correctly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The login and signup flow is complete. Connect your backend API 
                  to persist user data and unlock full functionality.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Account</CardTitle>
                <CardDescription>Account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
                {user?.companyName && (
                  <div>
                    <span className="text-xs text-muted-foreground">Company</span>
                    <p className="text-sm font-medium">{user.companyName}</p>
                  </div>
                )}
                {user?.industry && (
                  <div>
                    <span className="text-xs text-muted-foreground">Role</span>
                    <p className="text-sm font-medium capitalize">{user.industry}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Backend integration</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Update API_BASE_URL in auth-api.ts</li>
                  <li>• Implement /api/auth/login endpoint</li>
                  <li>• Implement /api/auth/register endpoint</li>
                  <li>• Add JWT token verification</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
