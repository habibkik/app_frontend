import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { ProductsManager } from "@/features/seller/components/ProductsManager";

export default function Products() {
  return (
    <DashboardLayout>
      <ProductsManager />
    </DashboardLayout>
  );
}
