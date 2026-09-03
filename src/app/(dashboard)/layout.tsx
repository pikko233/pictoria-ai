import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="h-16 flex items-center px-4">
          <SidebarTrigger />
        </div>
        <main className="flex-1 flex flex-col gap-4 p-4 pt-0 ">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
