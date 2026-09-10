import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// webhook 这类没有用户会话的服务端场景要用 service role key：
// admin API 和绕过 RLS 的读写都不接受 anon key。切勿在客户端引入。
export const createAdminClient = () =>
  createSupabaseClient<Database>(supabaseUrl!, serviceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
