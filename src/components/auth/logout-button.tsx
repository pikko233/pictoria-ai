"use client";

import { logout } from "@/app/actions/auth-actions";
import { Button } from "../ui/button";
import { toast } from "../ui/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export const LogoutButton = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    await toast.promise(
      new Promise(async (resolve, reject) => {
        const { success, error } = await logout();
        if (success) {
          setLoading(false);
          resolve(true);
          router.push("/login");
        } else {
          setLoading(false);
          reject(error);
        }
      }),
      {
        loading: "正在退出登录...",
        success: "退出登录成功",
        error: (error) => `退出登录失败: ${error}`,
      },
    );
  };

  return (
    <Button onClick={onLogout} disabled={loading}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && "退出登录"}
    </Button>
  );
};
