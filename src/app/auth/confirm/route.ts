import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (!tokenHash || !type) {
    redirectTo.pathname = "/error";
    return NextResponse.redirect(redirectTo);
  }

  const supabase = createClient(await cookies());
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (verifyError) {
    redirectTo.pathname = "/error";
    return NextResponse.redirect(redirectTo);
  }

  // 重置密码要靠 verifyOtp 建立的这个 session 去调 updateUser，
  // 在这里登出的话，/reset-password 提交新密码时会拿不到用户。
  // 注册确认则相反，登出后让用户走一次正常登录。
  if (type === "recovery") {
    redirectTo.pathname = "/reset-password";
    return NextResponse.redirect(redirectTo);
  }

  const { error: signOutError } = await supabase.auth.signOut({
    scope: "local",
  });

  if (signOutError) {
    redirectTo.pathname = "/error";
    return NextResponse.redirect(redirectTo);
  }

  redirectTo.pathname = "/register-success";
  return NextResponse.redirect(redirectTo);
}
