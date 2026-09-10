import { ModelTrainingForm } from "@/components/model-training/model-training-form";

const Page = () => {
  return (
    <section className="container mx-auto">
      <h1 className="text-2xl font-semibold mb-2">训练模型</h1>
      <p className="text-sm text-muted-foreground mb-6">
        使用图片来训练你的模型
      </p>
      <ModelTrainingForm />
    </section>
  );
};

export default Page;
