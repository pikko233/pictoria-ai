import { AccountForm } from "@/components/settings/account-form";
import { SecurityForm } from "@/components/settings/security-form";
import { getUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const Page = async () => {
  const supabase = createClient(await cookies());
  const user = await getUser(supabase);

  if (!user) {
    return redirect("/login");
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">设置</h1>
        <p className="text-sm text-muted-foreground mt-2">
          管理你的个人资料与账户安全
        </p>
      </div>

      <div className="grid gap-8">
        <AccountForm user={user} />
        <SecurityForm user={user} />
      </div>
    </section>
  );
};

export default Page;
