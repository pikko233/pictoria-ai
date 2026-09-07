import { getImages } from "@/app/actions/image-actions";
import { GalleryImages } from "@/components/gallery/gallery-images";

const Page = async () => {
  const { data: images } = await getImages();

  return (
    <section className="container mx-auto">
      <h1 className="text-2xl font-semibold mb-2">我的图片</h1>
      <p className="text-sm text-muted-foreground mb-6">
        在这里你可以看见你生成的所有图片，点击图片可以查看详情信息
      </p>
      <GalleryImages images={images || []} />
    </section>
  );
};

export default Page;
