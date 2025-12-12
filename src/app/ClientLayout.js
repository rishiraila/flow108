"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Components/Sidebar";
import Navbar from "./Components/Navbar";
import { AlertProvider } from "./utils/alertcontxt";
import { ConfirmProvider } from "./utils/confirmContext";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const isAuthPage = [
    "/adminlogin",
    "/signup",
    "/forgot",
    "/privacy",
    "/shipping-delivery",
    "/terms",
    "/contact",
    "/cancellation-refund",
  ].includes(pathname?.toLowerCase() || "");

  return (
    <AlertProvider>
      <ConfirmProvider>
        {isAuthPage ? (
          children
        ) : (
          <div className="layout-wrapper layout-content-navbar">
            <div className="layout-container">
              <Sidebar />
              <div className="layout-page">
                <Navbar />
                <div className="content-wrapper">{children}</div>
              </div>
            </div>
          </div>
        )}
      </ConfirmProvider>
    </AlertProvider>
  );
}
