import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NavUser } from "./nav-user";
import { getSubscription, getUser } from "@/lib/supabase/queries";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const supabase = createClient(await cookies());
  const { data } = await supabase.auth.getUser();
  const user = {
    email: data.user?.user_metadata.email,
    name: data.user?.user_metadata.full_name,
  };
  const subscription = await getSubscription(supabase);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Pictoria AI</span>
            <span className="truncate text-xs">
              {subscription.prices?.products?.name ?? "Free"}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
