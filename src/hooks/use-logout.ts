import { logout } from "@/app/actions/auth-actions";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useLogout = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const onLogout = async () => {
    setIsPending(true);
    await toast.promise(
      new Promise(async (resolve, reject) => {
        const { success, error } = await logout();
        if (success) {
          setIsPending(false);
          resolve(true);
          router.push("/login");
        } else {
          setIsPending(false);
          reject(error);
        }
      }),
      {
        loading: "正在退出登录...",
        success: "退出登录成功",
        error: (error) => `退出登录失败: ${error}`,
      },
    );
  };

  return {
    isPending,
    onLogout,
  };
};
