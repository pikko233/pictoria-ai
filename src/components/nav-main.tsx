"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Frame,
  Image,
  Images,
  Layers,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    title: "仪表盘",
    url: "/dashboard",
    icon: SquareTerminal,
  },
  {
    title: "图片生成",
    url: "/image-generation",
    icon: Image,
  },
  {
    title: "我的模型",
    url: "/models",
    icon: Frame,
  },
  {
    title: "训练模型",
    url: "/model-training",
    icon: Layers,
  },
  {
    title: "我的图片",
    url: "/gallery",
    icon: Images,
  },
  {
    title: "账单",
    url: "/billing",
    icon: CreditCard,
  },
  {
    title: "设置",
    url: "/settings",
    icon: Settings2,
  },
];

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <Link
            href={item.url}
            key={item.title}
            className={cn(
              pathname === item.url
                ? "text-primary bg-primary/5 rounded-md"
                : "text-muted-foreground",
            )}
          >
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Link>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
