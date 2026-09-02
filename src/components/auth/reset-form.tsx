"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const formSchema = z.object({
  email: z.email("邮箱格式不正确"),
});

type Props = {
  className?: string;
};

export const ResetForm = ({ className }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
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
        <Button type="submit" className="w-full">
          重置密码
        </Button>
      </form>
    </div>
  );
};
