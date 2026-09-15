import { createClient } from "@/lib/supabase/server";
import { Credit } from "@/lib/types";
import { cookies } from "next/headers";

type Response<T> =
  | {
      success: boolean;
      error: null;
      data: T;
    }
  | {
      success: boolean;
      error: string;
      data: null;
    };

export async function getCredits(): Promise<Response<Credit>> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "用户未登录",
      data: null,
    };
  }

  // 用 maybeSingle：用户可能还没有额度记录，single 在 0 行时会直接报错
  const { data: creditData, error } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !creditData) {
    return {
      success: false,
      error: error?.message ?? "未找到该用户的额度记录",
      data: null,
    };
  }

  return {
    success: true,
    error: null,
    data: creditData,
  };
}
