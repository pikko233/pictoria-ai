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
import { login } from "@/app/actions/auth-actions";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.email("邮箱格式不正确"),
  password: z.string().min(8, "密码不小于8位数"),
});

export type LoginFormValues = z.infer<typeof formSchema>;

type Props = {
  className?: string;
};

export const LoginForm = ({ className }: Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setLoading(true);
    toast.promise(
      // 成功时不复位 loading：router.push 要等 /dashboard 渲染完才切页，
      // 提前停掉按钮转圈会让这段等待看起来像卡死
      login(values).then(({ success, error }) => {
        if (!success) {
          setLoading(false);
          throw new Error(error ?? "登录失败");
        }
        router.push("/dashboard");
      }),
      {
        loading: "登录中请稍后...",
        success: "登录成功",
        error: (error) => `登录失败: ${error}`,
      },
    );
  };

  return (
    <div className={cn("grid gap-6", className)}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">邮箱</FieldLabel>
              <Input {...field} id="email" placeholder="请输入邮箱" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && "登录"}
        </Button>
      </form>
    </div>
  );
};
