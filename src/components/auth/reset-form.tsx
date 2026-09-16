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
import { resetPassword } from "@/app/actions/auth-actions";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.email("邮箱格式不正确"),
});

type Props = {
  className?: string;
};

export const ResetForm = ({ className }: Props) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    // server action 返回 { success, error } 而不是 reject，
    // 不显式抛错的话 toast.promise 会无条件走 success 分支，把真实错误吞掉。
    const task = resetPassword(values.email)
      .then(({ success, error }) => {
        if (!success) throw new Error(error ?? "未知错误");
      })
      .finally(() => setLoading(false));

    // base-ui 的 toast.promise 展示完 error toast 后会把 rejection 原样抛回，
    // 不接住会变成 unhandled rejection，dev 下弹错误浮层。
    toast
      .promise(task, {
        loading: "加载中...",
        success: "重置密码的邮件已发送，请注意查看邮箱～",
        error: (error) => `邮件发送失败: ${error}`,
      })
      .catch(() => {});
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          重置密码
        </Button>
      </form>
    </div>
  );
};
