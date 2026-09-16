"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signUp } from "@/app/actions/auth-actions";
import { toast } from "../ui/toast";
import { signUpSchema, type SignUpValues } from "@/lib/schemas";

type Props = {
  className?: string;
  onSuccess: (email: string) => void;
};

export const SignUpForm = ({ className, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignUpValues) => {
    setLoading(true);

    const request = signUp(values).then(({ success, error }) => {
      if (!success) throw new Error(error ?? "注册失败");
    });

    toast.promise(request, {
      loading: "正在创建账户...",
      success: "确认邮件已发送，请查收邮箱",
      error: (error) =>
        `注册失败: ${error instanceof Error ? error.message : error}`,
    });

    try {
      await request;
      onSuccess(values.email);
    } catch {
      // The toast already presents the registration error to the user.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          control={form.control}
          name="full_name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="full_name">用户名</FieldLabel>
              <Input {...field} id="full_name" placeholder="请输入用户名" />
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
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">密码确认</FieldLabel>
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
          {!loading && "注册"}
        </Button>
      </form>
    </div>
  );
};
