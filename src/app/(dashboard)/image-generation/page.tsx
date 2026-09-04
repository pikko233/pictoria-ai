import { Configurations } from "@/components/image-generation/configurations";
import { GeneratedImages } from "@/components/image-generation/generated-images";

const Page = () => {
  return (
    <section className="container mx-auto w-full grid gap-4 md:grid-cols-3 overflow-y-auto h-full">
      {/* Form */}
      <Configurations />
      <div className="md:col-span-2 mt-2.5 rounded-xl flex flex-col items-center">
        <GeneratedImages />
      </div>
    </section>
  );
};

export default Page;
