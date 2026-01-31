import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/features/dashboard/components";
import { useDashboardMode } from "@/features/dashboard";
import { modeConfig } from "@/features/dashboard/config/navigation";

function DashboardContent() {
  const { mode } = useDashboardMode();
  const config = modeConfig[mode];

  // Stats based on mode
  const stats = {
    buyer: [
      { title: "Active RFQs", value: "24", change: "+12%", positive: true, icon: FileText },
      { title: "Suppliers Found", value: "156", change: "+8%", positive: true, icon: Users },
      { title: "Saved This Month", value: "$12.4K", change: "+23%", positive: true, icon: DollarSign },
      { title: "Response Rate", value: "89%", change: "+5%", positive: true, icon: TrendingUp },
    ],
    producer: [
      { title: "Active Orders", value: "18", change: "+4%", positive: true, icon: FileText },
      { title: "Components Sourced", value: "342", change: "+15%", positive: true, icon: Users },
      { title: "Production Value", value: "$84.2K", change: "+12%", positive: true, icon: DollarSign },
      { title: "On-Time Delivery", value: "96%", change: "+2%", positive: true, icon: TrendingUp },
    ],
    seller: [
      { title: "Active Listings", value: "89", change: "+6%", positive: true, icon: FileText },
      { title: "Total Buyers", value: "1,247", change: "+18%", positive: true, icon: Users },
      { title: "Revenue MTD", value: "$45.8K", change: "-3%", positive: false, icon: DollarSign },
      { title: "Conversion Rate", value: "4.2%", change: "+0.8%", positive: true, icon: TrendingUp },
    ],
  };

  const currentStats = stats[mode];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <motion.h1 
          key={mode}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          {config.label} Dashboard
        </motion.h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your {config.label.toLowerCase()} activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {currentStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs mt-1">
                  {stat.positive ? (
                    <ArrowUpRight className="h-3 w-3 text-success mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
                  )}
                  <span className={stat.positive ? "text-success" : "text-destructive"}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest {mode} activities</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {mode === "buyer" && "New quote received from Supplier #" + (1000 + item)}
                      {mode === "producer" && "Production order #" + (2000 + item) + " updated"}
                      {mode === "seller" && "New inquiry from buyer #" + (3000 + item)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item} hour{item > 1 ? "s" : ""} ago
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for {config.label.toLowerCase()}s</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mode === "buyer" && (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New RFQ
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Find Suppliers
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Market Trends
                </Button>
              </>
            )}
            {mode === "producer" && (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Start BOM Analysis
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Source Components
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Check Feasibility
                </Button>
              </>
            )}
            {mode === "seller" && (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Add New Listing
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Update Pricing
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Launch Campaign
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
