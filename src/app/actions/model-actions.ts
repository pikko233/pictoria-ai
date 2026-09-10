"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@database.types";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// 获取当前用户的所有模型
export async function getModels(): Promise<
  | {
      error: null;
      success: boolean;
      data: Database["public"]["Tables"]["models"]["Row"][];
      count: number;
    }
  | {
      error: string;
      success: boolean;
      data: null;
      count: number;
    }
> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "用户未登录",
      success: false,
      count: 0,
    };
  }

  const { data, error, count } = await supabase
    .from("models")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      success: false,
      data: null,
      count: 0,
    };
  }

  return {
    error: null,
    success: true,
    data,
    count: count ?? 0,
  };
}

// 删除指定模型
export async function deleteModel(
  id: string,
  modelId: string,
  modelVersion: string,
) {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "用户未登录",
      success: false,
    };
  }

  try {
    const fetchUrl = modelVersion
      ? `https://api.replicate.com/v1/models/${process.env.MODEL_OWNER}/${modelId}/versions/${modelVersion}`
      : `https://api.replicate.com/v1/models/${process.env.MODEL_OWNER}/${modelId}`;

    // 删除replicate上的模型
    const res = await fetch(fetchUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    // 404 说明 replicate 上已经没有这个模型了，此时仍要接着清理本地记录，否则脏数据永远删不掉
    if (!res.ok && res.status !== 404) {
      const detail = await res.text();
      throw new Error(
        `replicate平台删除模型失败 (${res.status}): ${detail || res.statusText}`,
      );
    }

    // 删除supabase上的模型，限定 user_id 避免删掉别人的模型
    const { data, error } = await supabase
      .from("models")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    if (data.length === 0) {
      throw new Error("模型不存在或无权删除");
    }

    // /models 是 server component，不主动失效缓存的话已删除的卡片仍会留在页面上
    revalidatePath("/models");

    return {
      error: null,
      success: true,
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);

    console.error(error);
    return {
      error,
      success: false,
    };
  }
}
