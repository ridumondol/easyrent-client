import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PublicPageFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-[65vh]">{children}</main>
      <Footer />
    </>
  );
}
