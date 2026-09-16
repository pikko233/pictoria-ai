"use server";

import { LoginFormValues } from "@/components/auth/login-form";
import {
  passwordSchema,
  signUpSchema,
  updateProfileSchema,
  type SignUpValues,
  type UpdateProfileValues,
} from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface AuthResponse {
  error: null | string;
  success: boolean;
  data: unknown | null;
}

// 表单里的 zod 规则只在浏览器跑，action 本身是个可以直接 POST 的端点，
// 所以凡是带用户输入的 action 都要在入口自己校验一次。
const invalid = (message: string): AuthResponse => ({
  data: null,
  error: message,
  success: false,
});

export async function signUp(values: SignUpValues): Promise<AuthResponse> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) {
    return invalid(parsed.error.issues[0]?.message ?? "注册信息格式不正确");
  }

  const supabase = createClient(await cookies());

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
      },
    },
  });

  return {
    data,
    error: error?.message ?? null,
    success: !error,
  };
}

export async function login(values: LoginFormValues): Promise<AuthResponse> {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  return {
    data,
    error: error?.message ?? null,
    success: !error,
  };
}

export async function logout(): Promise<AuthResponse> {
  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signOut();
  return {
    data: null,
    error: error?.message ?? null,
    success: !error,
  };
}

export async function updateProfile(
  values: UpdateProfileValues,
): Promise<AuthResponse> {
  const parsed = updateProfileSchema.safeParse(values);
  if (!parsed.success) {
    return invalid(parsed.error.issues[0]?.message ?? "用户名格式不正确");
  }

  const supabase = createClient(await cookies());
  const { data: profileData, error } = await supabase.auth.updateUser({
    data: {
      full_name: parsed.data.fullName,
    },
  });

  return {
    data: profileData || null,
    error: error?.message ?? null,
    success: !error,
  };
}

export async function resetPassword(email: string): Promise<AuthResponse> {
  const supabase = createClient(await cookies());
  const { data: resetPasswordData, error } =
    await supabase.auth.resetPasswordForEmail(email);

  return {
    data: resetPasswordData || null,
    error: error?.message ?? null,
    success: !error,
  };
}

export async function changePassword(
  newPassword: string,
): Promise<AuthResponse> {
  // 只校验密码本身，两次输入是否一致纯粹是表单的事，服务端也拿不到第二个值。
  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return invalid(parsed.error.issues[0]?.message ?? "密码格式不正确");
  }

  const supabase = createClient(await cookies());
  const { data: resetPasswordData, error } = await supabase.auth.updateUser({
    password: parsed.data,
  });

  return {
    data: resetPasswordData || null,
    error: error?.message ?? null,
    success: !error,
  };
}
