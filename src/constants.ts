// webhook 是外部服务的无 cookie 回调，必须绕开 proxy 的登录重定向，

import { LoaderCircle, CheckCircle2, XCircle, Ban } from "lucide-react";

// 各 handler 自行用签名验证请求合法性
export const PUBLIC_ROUTES = [
  "/login",
  "/register-success",
  "/auth",
  "/api/webhooks",
  "/",
];

export const GENDER_LABEL_MAP = {
  man: "男",
  woman: "女",
};

export const INTERVAL_LABEL_MAP: Record<
  "month" | "year" | "day" | "week",
  string
> = {
  month: "月",
  year: "年",
  week: "周",
  day: "天",
};

export const TRAINING_STATUS_MAP = {
  starting: { label: "排队中", icon: LoaderCircle, className: "text-blue-500" },
  processing: {
    label: "训练中",
    icon: LoaderCircle,
    className: "text-blue-500",
  },
  succeeded: {
    label: "训练完成",
    icon: CheckCircle2,
    className: "text-green-500",
  },
  failed: { label: "训练失败", icon: XCircle, className: "text-destructive" },
  canceled: { label: "已取消", icon: Ban, className: "text-muted-foreground" },
} as const;
