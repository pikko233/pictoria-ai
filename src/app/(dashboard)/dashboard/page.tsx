import { getCredits } from "@/app/actions/credit-actions";
import { getImages } from "@/app/actions/image-actions";
import { getModels } from "@/app/actions/model-actions";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentImages } from "@/components/dashboard/recent-images";
import { RecentModels } from "@/components/dashboard/recent-models";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  const supabase = createClient(await cookies());
  const [
    {
      data: { user },
    },
    { data: models, count: modelCount },
    { data: credits },
    { data: images },
  ] = await Promise.all([
    supabase.auth.getUser(),
    getModels(),
    getCredits(),
    getImages(),
  ]);
  const imageCount = images?.length || 0;

  return (
    <section className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">
          欢迎回来，{user?.user_metadata.full_name}
        </h1>
      </div>
      <StatsCards
        modelCount={modelCount}
        imageCount={imageCount}
        credits={credits}
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <RecentImages
          images={images?.slice(0, 6) || []}
          className="lg:col-span-3"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          <QuickActions />

          <RecentModels models={models?.slice(0, 1) || []} />
        </div>
      </div>
    </section>
  );
}
