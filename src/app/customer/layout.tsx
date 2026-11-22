import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardLayout role="renter">{children}</DashboardLayout>;
}
