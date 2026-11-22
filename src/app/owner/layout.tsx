import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function OwnerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardLayout role="owner">{children}</DashboardLayout>;
}
