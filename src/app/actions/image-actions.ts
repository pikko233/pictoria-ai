"use server";

import { ImageGenerationFormValues } from "@/components/image-generation/configurations";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Replicate from "replicate";
import { imageMeta } from "image-meta";
import { randomUUID } from "crypto";

interface ImageResponse<T> {
  error: string | null;
  success: boolean;
  data: T | null;
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  useFileOutput: false,
});

// useFileOutput 为 false 时，模型输出是一组图片 URL
function toImages(output: unknown): Array<{ url: string }> {
  if (!Array.isArray(output)) return [];

  return output
    .filter((item): item is string => typeof item === "string")
    .map((url) => ({ url }));
}

// AI生成图片
export async function generateImageAction(
  input: ImageGenerationFormValues,
): Promise<ImageResponse<Array<{ url: string }>>> {
  const { model, ...rest } = input;

  try {
    const output = await replicate.run(model as `${string}/${string}`, {
      input: { ...rest },
    });

    return {
      data: toImages(output),
      success: true,
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

type StorageImageInput = {
  url: string;
} & ImageGenerationFormValues;

type UploadResult =
  | { fileName: string; success: true; path: string }
  | { fileName: string | null; success: false; error: string };

// 仅供本模块使用：不能 export，"use server" 文件的每个导出都是公开的服务端入口
async function fetchImageBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  // Replicate 返回的 URL 有有效期，过期后拿到的是错误页而不是图片
  if (!res.ok) {
    throw new Error(`下载图片失败: ${res.status} ${res.statusText}`);
  }
  return res.arrayBuffer();
}

// 数据库存储图片
export async function storageImages(
  images: StorageImageInput[],
): Promise<ImageResponse<UploadResult[]>> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "用户未登录",
      success: false,
      data: null,
    };
  }

  const uploadResults: UploadResult[] = [];

  for (const img of images) {
    let fileName: string | null = null;

    try {
      const arrayBuffer = await fetchImageBuffer(img.url);
      const { width, height, type } = imageMeta(new Uint8Array(arrayBuffer));

      const ext = type ?? "png";
      fileName = `image_${randomUUID()}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from("generated_images")
        .upload(filePath, arrayBuffer, {
          // 传 ArrayBuffer 时必须显式指定，否则会存成 text/plain
          contentType: `image/${ext}`,
          cacheControl: "31536000", // 生成的图片不会再变，缓存一年
          upsert: false,
        });

      if (storageError) {
        uploadResults.push({
          fileName,
          success: false,
          error: storageError.message,
        });
        continue;
      }

      // 只挑表里存在的列，表单里的 go_fast/megapixels 等没有对应字段
      const { error: dbError } = await supabase
        .from("generated_images")
        .insert({
          user_id: user.id,
          image_name: fileName,
          width,
          height,
          model: img.model,
          prompt: img.prompt,
          guidance: img.guidance,
          aspect_ratio: img.aspect_ratio,
          output_format: img.output_format,
          num_inference_steps: img.num_inference_steps,
        });

      if (dbError) {
        uploadResults.push({
          fileName,
          success: false,
          error: dbError.message,
        });
        continue;
      }

      uploadResults.push({ fileName, success: true, path: filePath });
    } catch (e) {
      // 单张失败不影响后面的图片
      uploadResults.push({
        fileName,
        success: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const failed = uploadResults.filter(
    (item): item is Extract<UploadResult, { success: false }> => !item.success,
  );

  return {
    error: failed.length ? failed.map((item) => item.error).join("; ") : null,
    success: failed.length === 0,
    data: uploadResults,
  };
}
