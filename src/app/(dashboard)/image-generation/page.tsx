import { getModels } from "@/app/actions/model-actions";
import { Configurations } from "@/components/image-generation/configurations";
import { GeneratedImages } from "@/components/image-generation/generated-images";

interface Props {
  searchParams: Promise<{
    modelId?: string;
  }>;
}

const Page = async ({ searchParams }: Props) => {
  const { modelId } = await searchParams;
  const { data: userModels } = await getModels();

  // Replicate 只认 owner/name:version 形式，而 MODEL_OWNER 是服务端变量，
  // 所以引用在这里拼好再交给客户端组件
  const trainedModels = (userModels ?? [])
    .filter((model) => model.training_status === "succeeded" && model.version)
    .map((model) => ({
      ...model,
      label: model.model_name ?? model.model_id!,
      value: `${process.env.MODEL_OWNER}/${model.model_id}:${model.version}`,
    }));

  const selectedModel = trainedModels.find(
    (model) => String(model.id) === modelId,
  )?.value;

  return (
    <section className="container mx-auto w-full grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto h-full">
      {/* Form */}
      <Configurations model={selectedModel} trainedModels={trainedModels} />
      <div className="md:col-span-1 lg:col-span-2 mt-2.5 rounded-xl flex flex-col items-center">
        <GeneratedImages />
      </div>
    </section>
  );
};

export default Page;
