"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@database.types";
import { cookies } from "next/headers";

type Response =
  | {
      signedUrl: string;
      error: null;
    }
  | {
      signedUrl: null;
      error: string;
    };

export async function getPresignedStorageUrl(
  filePath: string,
): Promise<Response> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { signedUrl: null, error: "用户未登录" };
  }

  const { data, error } = await supabase.storage
    .from("training_data")
    .createSignedUploadUrl(`${user.id}/${Date.now()}_${filePath}`);

  if (error || !data) {
    return {
      signedUrl: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    signedUrl: data.signedUrl,
    error: null,
  };
}
