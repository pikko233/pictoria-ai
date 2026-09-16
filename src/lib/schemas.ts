import z from "zod";

// 表单和 server action 共用的校验规则。
//
// 客户端那份只管即时提示：server action 编译后就是一个可以直接 POST 的端点，
// 绕开表单调用完全做得到，所以每个 action 入口都要再 parse 一次。
// 密码强度的最终强制执行在 Supabase 的 Password Requirements
// (Authentication → Policies)，那里才对所有入口生效；这里管的是错误文案。

export const passwordSchema = z
  .string()
  .min(8, "密码至少需要 8 位")
  .max(32, "密码最多 32 位")
  .regex(/[A-Za-z]/, "密码至少需要包含一个字母")
  .regex(/\d/, "密码至少需要包含一个数字")
  .regex(
    /^[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/,
    "密码包含不支持的字符",
  );

export const signUpSchema = z
  .object({
    full_name: z.string().min(3, "用户名至少包含3个字符"),
    email: z.email("邮箱格式不正确"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "请再次输入密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "请再次输入密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "用户名至少需要 2 个字符")
    .max(50, "用户名最多 50 个字符"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
