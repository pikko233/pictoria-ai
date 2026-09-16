"use client";

import { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { toast } from "../ui/toast";
import { updateProfile } from "@/app/actions/auth-actions";
import { Button } from "../ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  user: User;
}

const formSchema = z.object({
  fullName: z.string("用户名不能为空").min(2).max(50),
  email: z.email("请输入正确的邮箱格式"),
});

export const AccountForm = ({ user }: Props) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || "",
      email: user?.email || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    // server action 返回 { success, error } 而不是 reject，
    // 不显式抛错的话 toast.promise 会无条件走 success 分支，把真实错误吞掉。
    const task = updateProfile(values)
      .then(({ success, error }) => {
        if (!success) throw new Error(error ?? "未知错误");
      })
      .finally(() => setLoading(false));

    // base-ui 的 toast.promise 展示完 error toast 后会把 rejection 原样抛回，
    // 不接住会变成 unhandled rejection，dev 下弹错误浮层。
    toast
      .promise(task, {
        loading: "保存中...",
        success: "用户信息更新成功",
        error: (error) => `保存失败: ${error}`,
      })
      .catch(() => {});
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
        <CardDescription>更新你的个人信息</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4"
        >
          <Controller
            control={form.control}
            name="fullName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="fullName">用户名</FieldLabel>
                <Input
                  id="fullName"
                  className="max-w-sm"
                  placeholder={user?.user_metadata?.full_name || ""}
                  {...field}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">邮箱</FieldLabel>
                <Input
                  id="email"
                  className="max-w-sm"
                  placeholder={user.email}
                  disabled
                  {...field}
                />
                <FieldDescription>
                  你的邮箱将用于登录账号以及接收邮件通知
                </FieldDescription>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Button
            className="max-w-sm w-full"
            size="lg"
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            保存
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
