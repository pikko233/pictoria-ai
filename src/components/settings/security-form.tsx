"use client";

import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "../ui/toast";
import { resetPassword } from "@/app/actions/auth-actions";
import { Button } from "../ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  user: User;
}

export const SecurityForm = ({ user }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleResetPassword = () => {
    setLoading(true);
    // server action 返回的是 { success, error } 而不是 reject，
    // 不显式抛错的话 toast.promise 会无条件走 success 分支，把真实错误吞掉。
    const task = resetPassword(user.email || "")
      .then(({ success, error }) => {
        if (!success) throw new Error(error ?? "未知错误");
      })
      .finally(() => setLoading(false));

    // base-ui 的 toast.promise 展示完 error toast 后会把 rejection 原样抛回
    // (store.js promiseToast)，不接住会变成 unhandled rejection，dev 下弹错误浮层。
    toast
      .promise(task, {
        loading: "加载中...",
        success: "修改密码的邮件已发送，请检查您的邮箱~",
        error: (error) => `发送失败: ${error}`,
      })
      .catch(() => {});
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>账户安全</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h1 className="text-base font-medium">密码</h1>
          <p className="text-sm text-muted-foreground">
            修改你的密码以保证账户安全
          </p>
          <Button
            variant={"secondary"}
            className="max-w-sm w-full"
            size="lg"
            disabled={loading}
            onClick={handleResetPassword}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            修改密码
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
