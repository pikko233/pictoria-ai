import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const requestSchema = z.object({
  modelName: z.string("请输入模型名称"),
  gender: z.enum(["man", "woman"]),
  fileKey: z.string("缺少fileKey"),
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is missing");
    }

    const supabase = createClient(await cookies());

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "用户未登录",
        },
        {
          status: 401,
        },
      );
    }

    const params = await request.json();
    const res = z.safeParse(requestSchema, params);

    if (!res.success) {
      return NextResponse.json(
        {
          error: "请求参数错误",
        },
        {
          status: 400,
        },
      );
    }

    const { modelName, gender, fileKey } = res.data;

    const fileName = fileKey.replace("training_data/", "");

    const { data, error } = await supabase.storage
      .from("training_data")
      .createSignedUrl(fileName, 3600);

    if (!data?.signedUrl) {
      return NextResponse.json({
        error,
      });
    }

    // replicate 的模型名只接受 [a-zA-Z0-9._-]，中文、空格等字符必须先规整掉，
    // 全部被替换掉时（例如纯中文名）退回 "model" 兜底
    const modelSlug =
      modelName
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "_")
        .replace(/^_+|_+$/g, "") || "model";
    const modelId = `${user.id}_${Date.now()}_${modelSlug}`;

    // 创建模型
    await replicate.models.create(process.env.MODEL_OWNER!, modelId, {
      visibility: "private",
      hardware: "gpu-a100-large",
    });

    const WEBHOOK_URL =
      process.env.NODE_ENV === "development"
        ? process.env.NGROK_URL
        : process.env.NEXT_PUBLIC_APP_URL;

    // 开始训练模型
    const training = await replicate.trainings.create(
      "ostris",
      "flux-dev-lora-trainer",
      "26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2",
      {
        // You need to create a model on Replicate that will be the destination for the trained version.
        destination: `${process.env.MODEL_OWNER}/${modelId}`,
        input: {
          steps: 1000,
          resolution: 1024,
          input_images: data.signedUrl,
          trigger_word: "ohwx",
        },
        webhook: `${WEBHOOK_URL}/api/webhooks/training?userId=${user.id}&fileName=${encodeURIComponent(fileName)}`,
        webhook_events_filter: ["completed"],
      },
    );

    // 保存模型
    const { error: insertError } = await supabase.from("models").insert({
      model_id: modelId,
      user_id: user.id,
      model_name: modelName,
      gender,
      training_status: training.status,
      trigger_word: "ohwx",
      training_steps: 1000,
      training_id: training.id,
    });

    // supabase 的 insert 不抛异常，错误只在返回值里，不检查就会静默丢记录
    if (insertError) {
      await replicate.trainings.cancel(training.id);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log(training);

    return NextResponse.json(
      {
        ok: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "训练模型请求失败";

    return NextResponse.json(
      {
        error: errMsg,
      },
      { status: 500 },
    );
  }
}
