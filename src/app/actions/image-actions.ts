"use server";

import { ImageGenerationFormValues } from "@/components/image-generation/configurations";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Replicate from "replicate";
import { imageMeta } from "image-meta";
import { randomUUID } from "crypto";
import { Database } from "@database.types";
import { refresh } from "next/cache";

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

// 桶是私有的，只能用带签名的临时 URL 访问
const SIGNED_URL_EXPIRES_IN = 3600;

export type ImageRowType = {
  url: string | null; // 签名可能失败，允许为空
} & Database["public"]["Tables"]["generated_images"]["Row"];

// 获取图片
export async function getImages(
  limit?: number,
): Promise<ImageResponse<ImageRowType[]>> {
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

  let query = supabase
    .from("generated_images")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return {
      error: error.message,
      success: false,
      data: null,
    };
  }

  // image_name 为空的行没有对应文件，签不出 URL
  const rows = data.filter((row) => row.image_name !== null);

  if (rows.length === 0) {
    return { error: null, success: true, data: [] };
  }

  // 批量签名，避免每行一次请求
  const { data: signed, error: signError } = await supabase.storage
    .from("generated_images")
    .createSignedUrls(
      rows.map((row) => `${user.id}/${row.image_name}`),
      SIGNED_URL_EXPIRES_IN,
    );

  if (signError) {
    return {
      error: signError.message,
      success: false,
      data: null,
    };
  }

  // 按 path 建索引，不依赖返回顺序
  const urlByPath = new Map(signed.map((item) => [item.path, item.signedUrl]));

  const imagesWithUrl: ImageRowType[] = rows.map((row) => ({
    ...row,
    url: urlByPath.get(`${user.id}/${row.image_name}`) ?? null,
  }));

  return {
    error: null,
    success: true,
    data: imagesWithUrl,
  };
}

// 删除图片
export async function deleteImage(
  imageId: string,
): Promise<ImageResponse<ImageRowType[]>> {
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

  // 从postgresql中删除数据
  // user_id 过滤是 RLS 之外的第二道防线，避免越权删除别人的记录
  const { data, error } = await supabase
    .from("generated_images")
    .delete()
    .eq("id", imageId)
    .eq("user_id", user.id)
    .select();

  if (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      success: false,
      data: null,
    };
  }

  // 删不到行时 error 为 null、data 为空数组，不能当成删除成功
  const deleted = data?.[0];
  if (!deleted) {
    return {
      error: "图片不存在或无权删除",
      success: false,
      data: null,
    };
  }

  // 路径用数据库返回的 image_name 拼，不信任调用方传入的值
  if (deleted.image_name) {
    const { error: storageError } = await supabase.storage
      .from("generated_images")
      .remove([`${user.id}/${deleted.image_name}`]);

    // 数据库记录已经删掉，用户看不到这张图了；残留的文件只是占空间，
    // 不值得为它回滚删除操作，记下来交给后续的清理任务处理
    if (storageError) {
      console.error(
        `删除 storage 文件失败: ${user.id}/${deleted.image_name}`,
        storageError.message,
      );
    }
  }

  // 让 client router 重新拉一次 RSC payload，图片列表随之更新
  refresh();

  return {
    error: null,
    success: true,
    data,
  };
}
