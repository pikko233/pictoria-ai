"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "../ui/toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/app/actions/auth-actions";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "密码至少需要 8 位")
      .max(32, "密码最多 32 位")
      .regex(/[A-Za-z]/, "密码至少需要包含一个字母")
      .regex(/\d/, "密码至少需要包含一个数字")
      .regex(
        /^[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/,
        "密码包含不支持的字符",
      ),
    confirmPassword: z.string().min(1, "请再次输入密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type Props = {
  className?: string;
};

export const ChangePasswordForm = ({ className }: Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    // server action 返回 { success, error } 而不是 reject，
    // 不显式抛错的话 toast.promise 会无条件走 success 分支，把真实错误吞掉。
    const task = changePassword(values.password)
      .then(({ success, error }) => {
        if (!success) throw new Error(error ?? "未知错误");
        router.push("/dashboard");
      })
      .finally(() => setLoading(false));

    // base-ui 的 toast.promise 展示完 error toast 后会把 rejection 原样抛回，
    // 不接住会变成 unhandled rejection，dev 下弹错误浮层。
    toast
      .promise(task, {
        loading: "加载中...",
        success: "密码修改成功",
        error: (error) => `密码修改失败: ${error}`,
      })
      .catch(() => {});
  };

  return (
    <div className={cn("grid gap-6", className)}>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">修改密码</h1>
        <p className="text-sm text-muted-foreground">请输入你的新密码</p>
      </div>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">密码</FieldLabel>
              <Input
                {...field}
                id="password"
                type="password"
                placeholder="请输入密码"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">确认密码</FieldLabel>
              <Input
                {...field}
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && "修改密码"}
        </Button>
      </form>
    </div>
  );
};
