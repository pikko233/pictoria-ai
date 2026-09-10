"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { toast } from "../ui/toast";
import { getPresignedStorageUrl } from "@/app/actions/file-actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const ACCEPTED_ZIP_FILES = ["application/x-zip-compressed", "application/zip"];
const MAX_FILE_SIZE = 45 * 1024 * 1024;

const formSchema = z.object({
  modelName: z.string("请输入模型名称"),
  gender: z.enum(["man", "woman"]),
  zipFiles: z
    .any()
    .refine((files) => files?.[0] instanceof File, "请选择合法格式的文件")
    .refine(
      (files) =>
        files?.[0]?.type && ACCEPTED_ZIP_FILES.includes(files?.[0]?.type),
      "仅支持选择zip文件",
    )
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `文件最大不能超过${MAX_FILE_SIZE / 1024 / 1024}mb`,
    ), // 45mb
});

export const ModelTrainingForm = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelName: "",
      gender: "man",
      zipFiles: undefined,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    setLoading(true);
    const run = async () => {
      // 由于bucket私有，所以上传文件前需要获取签名
      const { signedUrl, error } = await getPresignedStorageUrl(
        values.zipFiles[0].name,
      );

      if (error || !signedUrl) {
        throw new Error(error ?? "上传文件时获取签名失败");
      }

      // 上传文件
      const res = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": values.zipFiles[0].type,
        },
        body: values.zipFiles[0],
      });

      if (!res.ok) {
        throw new Error("上传文件失败");
      }

      const resJson = await res.json();

      // 训练模型
      const res2 = await fetch("/api/train", {
        method: "POST",
        body: JSON.stringify({
          modelName: values.modelName,
          gender: values.gender,
          fileKey: resJson.Key,
        }),
      });

      const res2Json = await res2.json();

      if (!res2.ok) {
        throw new Error(res2Json.error ?? "训练模型失败");
      }

      return res2Json;
    };
    toast.promise(
      run().finally(() => setLoading(false)),
      {
        loading: "正在加载中...",
        success: "训练模型成功",
        error: (error) => `训练模型失败: ${error}`,
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <fieldset className="border rounded-lg px-8 py-4 grid max-w-3xl gap-6">
        {/* <legend className="font-semibold">训练模型</legend> */}
        <Controller
          control={form.control}
          name="modelName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>模型名称</FieldLabel>
              <Input placeholder="请输入模型名称" {...field} />
              <FieldDescription>这将作为你训练出的模型的名称</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="gender"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>请选择照片中人物的性别</FieldLabel>
              {/* Base UI 的 RadioGroup 只认 onValueChange，展开 field 的 onChange
                  不会被调用，会导致 gender 永远提交默认值 */}
              <RadioGroup
                className="w-fit"
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              >
                <Field orientation="horizontal">
                  <RadioGroupItem value="man" id="desc-r1" />
                  <FieldContent>
                    <FieldLabel htmlFor="desc-r1">男</FieldLabel>
                  </FieldContent>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="woman" id="desc-r2" />
                  <FieldContent>
                    <FieldLabel htmlFor="desc-r2">女</FieldLabel>
                  </FieldContent>
                </Field>
              </RadioGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="zipFiles"
          render={({ field: { onChange, onBlur, name, ref }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="zipFiles">
                训练数据 (Zip 文件)
                <span className="text-destructive">| 请阅读以下要求</span>
              </FieldLabel>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>总共提供12张图片或以上</li>
                <li>
                  12 张图片的理想配比：
                  <ul className="mt-1 list-[circle] space-y-1 pl-5">
                    <li>6 张面部特写</li>
                    <li>3~4 张半身照 (拍到腹部)</li>
                    <li>2~3 张全身照</li>
                  </ul>
                </li>
                <li>面部/头部尽量不要佩戴配饰</li>
                <li>图片中不要出现其他人</li>
                <li>包含不同表情、服装和背景，且光线良好</li>
                <li>图片为 1:1 比例 (1024x1024 或更高)</li>
                <li>使用相近年龄段的照片（最好是近几个月内拍摄的）</li>
                <li>
                  只能上传 zip 文件 (小于 {MAX_FILE_SIZE / 1024 / 1024}MB)
                </li>
              </ul>
              <Input
                id="zipFiles"
                type="file"
                accept=".zip"
                name={name}
                ref={ref}
                onBlur={onBlur}
                onChange={(event) => onChange(event.target.files)}
                className="h-auto py-2 cursor-pointer"
              />
              <FieldDescription>
                上传包含训练图片的 zip 文件 (最大 {MAX_FILE_SIZE / 1024 / 1024}
                MB)。
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button type="submit" size="lg" className="w-fit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          训练模型
        </Button>
      </fieldset>
    </form>
  );
};
