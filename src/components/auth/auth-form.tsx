"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { Button } from "../ui/button";
import { SignUpForm } from "./sign-up-form";
import Link from "next/link";
import { ResetForm } from "./reset-form";
import { CheckEmail } from "./check-email";

type ModeType = "login" | "sign-up" | "reset" | "check-email";

const copy: Record<ModeType, { title: string; description: string }> = {
  login: {
    title: "登录",
    description: "请输入邮箱和密码以登录您的账户",
  },
  "sign-up": {
    title: "注册",
    description: "请输入您的邮箱进行注册账户",
  },
  reset: {
    title: "重置密码",
    description: "在重置密码之前请输入您的邮箱",
  },
  "check-email": {
    title: "检查你的邮箱",
    description: "还差一步即可完成注册",
  },
};

export const AuthForm = () => {
  const [mode, setMode] = useState<ModeType>("login");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSignUpSuccess = (email: string) => {
    setRegisteredEmail(email);
    setMode("check-email");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {copy[mode].title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {copy[mode].description}
        </p>
        <div>
          {mode === "login" && (
            <>
              <LoginForm />
              <div className="flex justify-between mt-2">
                <Button
                  variant="link"
                  className="text-sm p-0"
                  onClick={() => setMode("sign-up")}
                >
                  没有账号？注册一个～
                </Button>
                <Button
                  variant="link"
                  className="text-sm p-0"
                  onClick={() => setMode("reset")}
                >
                  忘记密码
                </Button>
              </div>
            </>
          )}
          {mode === "sign-up" && (
            <>
              <SignUpForm onSuccess={handleSignUpSuccess} />
              <div className="flex justify-center mt-2">
                <Button
                  variant="link"
                  className="text-sm p-0"
                  onClick={() => setMode("login")}
                >
                  已有账号？前往登录～
                </Button>
              </div>
              <p className="p-2 text-sm text-muted-foreground">
                注册时默认您已同意我们的{" "}
                <Link
                  href="/"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  服务条款
                </Link>
                和{" "}
                <Link
                  href="/"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  隐私协议
                </Link>
              </p>
            </>
          )}
          {mode === "reset" && (
            <>
              <ResetForm />
              <div className="flex justify-center mt-2">
                <Button
                  variant="link"
                  className="text-sm p-0"
                  onClick={() => setMode("login")}
                >
                  返回登录
                </Button>
              </div>
            </>
          )}
          {mode === "check-email" && (
            <CheckEmail
              email={registeredEmail}
              onBack={() => setMode("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
};
