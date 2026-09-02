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
