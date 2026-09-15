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

  const { data: creditData, error } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      data: null,
    };
  }

  return {
    success: true,
    error: null,
    data: creditData,
  };
}
