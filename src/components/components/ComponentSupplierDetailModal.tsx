import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Linkedin,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  ExternalLink,
  Briefcase,
  Wrench,
  Factory,
  Headphones,
  UserCog,
  Star,
  Package,
  Clock,
} from "lucide-react";
import type { ComponentSupplierMatch } from "@/stores/componentSupplierStore";
import type { SupplierEmployee, EmployeeDepartment } from "@/data/suppliers";

interface ComponentSupplierDetailModalProps {
  supplier: ComponentSupplierMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onContact?: (supplier: ComponentSupplierMatch) => void;
}

const departmentConfig: Record<EmployeeDepartment, { icon: typeof Briefcase; label: string; color: string }> = {
  sales: { icon: Briefcase, label: "Sales Department", color: "text-blue-500" },
  after_sales: { icon: Headphones, label: "After Sales / Support", color: "text-purple-500" },
  technical: { icon: Wrench, label: "Technical Department", color: "text-orange-500" },
  production: { icon: Factory, label: "Production Department", color: "text-green-500" },
  management: { icon: UserCog, label: "Management", color: "text-indigo-500" },
  other: { icon: Users, label: "Other", color: "text-muted-foreground" },
};

function groupEmployeesByDepartment(employees: SupplierEmployee[]): Record<EmployeeDepartment, SupplierEmployee[]> {
  const grouped: Record<EmployeeDepartment, SupplierEmployee[]> = {
    sales: [],
    after_sales: [],
    technical: [],
    production: [],
    management: [],
    other: [],
  };

  employees.forEach((emp) => {
    const dept = emp.department || "other";
    grouped[dept].push(emp);
  });

  return grouped;
}

export function ComponentSupplierDetailModal({
  supplier,
  isOpen,
  onClose,
  onContact,
}: ComponentSupplierDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!supplier) return null;

  const groupedEmployees = groupEmployeesByDepartment(supplier.employees || []);
  const departmentsWithEmployees = Object.entries(groupedEmployees).filter(
    ([_, emps]) => emps.length > 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {supplier.logo}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {supplier.name}
                {supplier.verified && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                {supplier.location}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  {supplier.rating.toFixed(1)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  MOQ: {supplier.moq}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {supplier.leadTime}
                </Badge>
                <Badge variant="secondary" className="text-xs font-semibold">
                  ${supplier.unitPrice.toFixed(2)}/unit
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b px-6 h-12">
            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Contact
            </TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Business
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Team
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-4 m-0">
              {supplier.description && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{supplier.description}</p>
                </div>
              )}

              {supplier.specializations && supplier.specializations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {supplier.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {supplier.certifications.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {supplier.certifications.map((cert) => (
                      <Badge key={cert} variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {supplier.geoLocation && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Location</h3>
                  <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p>{supplier.geoLocation.formattedAddress}</p>
                      <p className="text-muted-foreground">
                        {supplier.geoLocation.city}, {supplier.geoLocation.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => onContact?.(supplier)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Request Quote
                </Button>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="p-6 space-y-3 m-0">
              {supplier.contact?.email && (
                <a
                  href={`mailto:${supplier.contact.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{supplier.contact.email}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                </a>
              )}

              {supplier.contact?.phone && (
                <a
                  href={`tel:${supplier.contact.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Phone className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{supplier.contact.phone}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                </a>
              )}

              {supplier.contact?.website && (
                <a
                  href={supplier.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Website</p>
                    <p className="text-sm text-muted-foreground">{supplier.contact.website}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                </a>
              )}

              {supplier.contact?.linkedIn && (
                <a
                  href={supplier.contact.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                  <div>
                    <p className="text-sm font-medium">LinkedIn</p>
                    <p className="text-sm text-muted-foreground">Company Page</p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                </a>
              )}

              {!supplier.contact && (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No contact information available</p>
                </div>
              )}
            </TabsContent>

            {/* Business Tab */}
            <TabsContent value="business" className="p-6 space-y-4 m-0">
              <div className="grid grid-cols-2 gap-4">
                {supplier.businessProfile?.annualRevenue && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Annual Revenue</span>
                      </div>
                      <p className="text-lg font-semibold">{supplier.businessProfile.annualRevenue}</p>
                    </CardContent>
                  </Card>
                )}

                {supplier.businessProfile?.companySize && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Employees</span>
                      </div>
                      <p className="text-lg font-semibold">{supplier.businessProfile.companySize}</p>
                    </CardContent>
                  </Card>
                )}

                {supplier.yearEstablished && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-xs text-muted-foreground">Established</span>
                      </div>
                      <p className="text-lg font-semibold">{supplier.yearEstablished}</p>
                    </CardContent>
                  </Card>
                )}

                {supplier.industry && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-orange-500" />
                        <span className="text-xs text-muted-foreground">Industry</span>
                      </div>
                      <p className="text-lg font-semibold">{supplier.industry}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Stock Status */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Stock Status</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {supplier.inStock ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </div>
                    {supplier.stockQuantity && (
                      <span className="text-sm text-muted-foreground">
                        {supplier.stockQuantity.toLocaleString()} units available
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="p-6 space-y-6 m-0">
              {departmentsWithEmployees.length > 0 ? (
                departmentsWithEmployees.map(([dept, employees]) => {
                  const config = departmentConfig[dept as EmployeeDepartment];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={dept}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <h3 className="text-sm font-semibold">{config.label}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {employees.length}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {employees.map((employee, index) => (
                          <motion.div
                            key={employee.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <a
                              href={employee.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {employee.avatar || employee.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{employee.name}</p>
                                <p className="text-xs text-muted-foreground">{employee.role}</p>
                              </div>
                              <Linkedin className="h-4 w-4 text-[#0A66C2] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No team information available</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
