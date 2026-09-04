"use client";

import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { TooltipInfo } from "../tooltip-info";
import { toast } from "../ui/toast";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import useGeneratedImageStore from "@/stores/generated-image";

// 图片比例
const ASPECT_RATIO_ARR = [
  "1:1",
  "16:9",
  "21:9",
  "3:2",
  "2:3",
  "4:5",
  "5:4",
  "3:4",
  "4:3",
  "9:16",
  "9:21",
];

// 图片格式
const OUTPUT_FORMAT_ARR = ["webp", "jpg", "png"];

type ModelValueType =
  | "black-forest-labs/flux-dev"
  | "black-forest-labs/flux-schnell";

type ModelType = {
  label: string;
  value: ModelValueType;
  maxSteps: number;
};

// 模型
const MODELS: ModelType[] = [
  {
    label: "flux-dev",
    value: "black-forest-labs/flux-dev",
    maxSteps: 50,
  },
  {
    label: "flux-schnell",
    value: "black-forest-labs/flux-schnell",
    maxSteps: 4,
  },
];

const formSchema = z.object({
  model: z.string().trim().min(1, "模型不能为空"),
  prompt: z.string().trim().min(1, "提示词不能为空"),
  go_fast: z.boolean(),
  guidance: z.number().min(0, "指导性不能小于 0").max(10, "指导性不能大于 10"),
  megapixels: z.enum(["0.25", "0.5", "1"]),
  num_outputs: z
    .number()
    .int()
    .min(1, "至少生成 1 张图片")
    .max(4, "最多生成 4 张图片"),
  aspect_ratio: z.enum(ASPECT_RATIO_ARR),
  output_format: z.enum(OUTPUT_FORMAT_ARR),
  output_quality: z
    .number()
    .int()
    .min(0, "图片质量不能小于 0")
    .max(100, "图片质量不能大于 100"),
  prompt_strength: z
    .number()
    .min(0, "提示词强度不能小于 0")
    .max(1, "提示词强度不能大于 1"),
  num_inference_steps: z
    .number()
    .int()
    .min(1, "推理步数不能小于 1")
    .max(50, "推理步数不能大于 50"),
});

export type ImageGenerationFormValues = z.infer<typeof formSchema>;

export const Configurations = () => {
  const generateImage = useGeneratedImageStore((state) => state.generateImage);
  const loading = useGeneratedImageStore((state) => state.loading);

  const form = useForm<ImageGenerationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "black-forest-labs/flux-dev",
      prompt: "",
      go_fast: true,
      guidance: 3.5,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: "1:1",
      output_format: "jpg",
      output_quality: 80,
      prompt_strength: 0.8,
      num_inference_steps: 28,
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "model") {
        let newSteps;
        if (value.model === "black-forest-labs/flux-schnell") {
          newSteps = 4;
        } else {
          newSteps = 28;
        }

        if (newSteps !== undefined) {
          form.setValue("num_inference_steps", newSteps);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: ImageGenerationFormValues) => {
    try {
      await toast.promise(generateImage(values), {
        loading: "图片生成中请稍等片刻...",
        success: "图片生成成功~",
        error: (error) =>
          `图片生成失败: ${error instanceof Error ? error.message : String(error)}`,
      });

      // 图片生成成功但存档失败时 promise 不会 reject，需要单独提示
      const storageError = useGeneratedImageStore.getState().error;
      if (storageError) {
        toast.add({
          type: "error",
          title: "图片保存失败",
          description: storageError,
        });
      }
    } catch (error) {
      console.error("图片生成失败", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset className="bg-background rounded-xl border px-6 py-7.5">
        <legend className="text-sm font-semibold">图片生成设定</legend>
        <FieldGroup>
          <Controller
            name="model"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  模型
                  <TooltipInfo text="选择用于生成图片的 AI 模型，不同模型在生成速度和细节表现上有所差异。" />
                </FieldLabel>

                <Select
                  items={MODELS}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="请选择模型" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      {MODELS.map((model) => (
                        <SelectItem value={model.value} key={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="aspect_ratio"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    图片比例
                    <TooltipInfo text="设置生成图片的宽高比例，以适配头像、海报或横幅等不同场景。" />
                  </FieldLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="请选择比例" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {ASPECT_RATIO_ARR.map((ratio) => (
                          <SelectItem value={ratio} key={ratio}>
                            {ratio}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="num_outputs"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    生成图片数量
                    <TooltipInfo text="设置单次生成的图片数量，数量越多通常需要更长时间并消耗更多额度。" />
                  </FieldLabel>

                  <Input
                    type="number"
                    min={1}
                    max={4}
                    placeholder="请输入1~4之间的正整数"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Controller
            name="guidance"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel>
                    指导性
                    <TooltipInfo text="控制生成结果遵循提示词的程度，数值越高通常越贴近提示词。" />
                  </FieldLabel>
                  <span className="text-sm font-semibold">{field.value}</span>
                </div>

                <Slider
                  value={field.value}
                  onValueChange={field.onChange}
                  min={0}
                  max={10}
                  step={0.5}
                  className="w-full"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="num_inference_steps"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel>
                    推理步数
                    <TooltipInfo text="设置生成过程的迭代次数，步数越多通常细节越丰富，但生成时间也越长。" />
                  </FieldLabel>
                  <span className="text-sm font-semibold">{field.value}</span>
                </div>

                <Slider
                  value={field.value}
                  onValueChange={field.onChange}
                  min={1}
                  max={
                    MODELS.find(
                      (model) => model.value === form.getValues("model"),
                    )?.maxSteps
                  }
                  step={1}
                  className="w-full"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="output_quality"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel>
                    图片质量
                    <TooltipInfo text="设置导出图片的压缩质量，数值越高细节保留越多，文件也通常越大。" />
                  </FieldLabel>
                  <span className="text-sm font-semibold">{field.value}</span>
                </div>

                <Slider
                  value={field.value}
                  onValueChange={field.onChange}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="output_format"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  图片格式
                  <TooltipInfo text="选择导出图片的文件格式；WebP 通常体积较小，PNG 支持无损保存。" />
                </FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="请选择比例" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      {OUTPUT_FORMAT_ARR.map((format) => (
                        <SelectItem value={format} key={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="prompt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  提示词
                  <TooltipInfo text="描述希望生成的主体、场景、构图、光线和风格，信息越具体越容易得到预期结果。" />
                </FieldLabel>

                <Textarea
                  rows={6}
                  placeholder="请输入提示词用于生成图片"
                  {...field}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-1" />
              <span>生成中</span>
            </>
          ) : (
            <span>生成图片</span>
          )}
        </Button>
      </fieldset>
    </form>
  );
};
