import {
  generateImageAction,
  storageImages,
} from "@/app/actions/image-actions";
import { ImageGenerationFormValues } from "@/components/image-generation/configurations";
import { create } from "zustand";

interface GeneratedImageState {
  loading: boolean;
  images: Array<{ url: string }>;
  error: string | null;
  generateImage: (values: ImageGenerationFormValues) => Promise<void>;
}

const useGeneratedImageStore = create<GeneratedImageState>((set) => ({
  loading: false,
  images: [],
  error: null,

  generateImage: async (values: ImageGenerationFormValues) => {
    set({ loading: true, error: null });

    try {
      const { error, success, data } = await generateImageAction(values);
      if (!success || !(Array.isArray(data) && data?.length > 0)) {
        throw new Error(error ?? "图片生成失败");
      }

      set({ loading: false, images: data ?? [] });

      const dataWithUrl = data.map((item) => ({
        url: item.url,
        ...values,
      }));
      // 图片已经生成出来了，存档失败不该覆盖已展示的结果，只记录错误
      const storageResult = await storageImages(dataWithUrl);
      if (!storageResult.success) {
        set({ error: storageResult.error ?? "图片保存失败" });
      }
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : String(e),
      });
      // 抛给调用方，让 toast.promise 能感知失败
      throw e;
    }
  },
}));

export default useGeneratedImageStore;
