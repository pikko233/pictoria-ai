"use server";

import { LoginFormValues } from "@/components/auth/login-form";
import { SignUpValues } from "@/components/auth/sign-up-form";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface AuthResponse {
  error: null | string;
  success: boolean;
  data: unknown | null;
}

export async function signUp(values: SignUpValues): Promise<AuthResponse> {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.full_name,
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

export async function updateProfile(values: {
  fullName: string;
}): Promise<AuthResponse> {
  const supabase = createClient(await cookies());
  const { data: profileData, error } = await supabase.auth.updateUser({
    data: {
      full_name: values.fullName,
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
  const supabase = createClient(await cookies());
  const { data: resetPasswordData, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return {
    data: resetPasswordData || null,
    error: error?.message ?? null,
    success: !error,
  };
}
