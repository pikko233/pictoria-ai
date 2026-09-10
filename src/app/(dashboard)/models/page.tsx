import { getModels } from "@/app/actions/model-actions";
import { ErrorCard } from "@/components/error-card";
import { ModelList } from "@/components/models/model-list";

const Page = async () => {
  const { data: models, count, success, error } = await getModels();

  return (
    <section className="container mx-auto">
      <h1 className="text-2xl font-semibold">我的模型</h1>
      <p className="text-sm text-muted-foreground mt-2 mb-8">
        查看并管理你的模型
      </p>
      {success ? (
        <ModelList models={models} count={count} />
      ) : (
        <div className="flex justify-center items-center h-[50vh]">
          <ErrorCard
            description="没能获取到你的模型列表，请稍后重试。"
            message={error ?? undefined}
          />
        </div>
      )}
    </section>
  );
};

export default Page;
