import { createClient } from "@/lib/supabase/server";
import { getURL } from "@/lib/helpers";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

import Replicate from "replicate";
import { supabaseAdmin } from "@/lib/supabase/admin";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const requestSchema = z.object({
  modelName: z.string("请输入模型名称"),
  gender: z.enum(["man", "woman"]),
  fileKey: z.string("缺少fileKey"),
});

const validateUserCredits = async (userId: string) => {
  const { data: userCredits, error } = await supabaseAdmin
    .from("credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error("获取用户额度信息失败");
  }

  const credits = userCredits.model_training_count ?? 0;

  if (credits <= 0) {
    throw new Error("用于训练模型的额度不足");
  }

  return credits;
};

// 扣 1 次训练额度。读-改-写之间可能有并发请求插进来，
// 所以更新时带上读到的旧值做乐观锁：值被改过就重新读一次再试。
const debitTrainingCredit = async (userId: string) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: credit, error: readError } = await supabaseAdmin
      .from("credits")
      .select("model_training_count")
      .eq("user_id", userId)
      .single();

    if (readError) {
      return readError.message;
    }

    const current = credit.model_training_count ?? 0;

    if (current <= 0) {
      return "用于训练模型的额度不足";
    }

    const { data: debited, error: updateError } = await supabaseAdmin
      .from("credits")
      .update({ model_training_count: current - 1 })
      .eq("user_id", userId)
      // 额度仍是刚读到的值才更新，命中 0 行说明有并发请求抢先扣过了
      .eq("model_training_count", current)
      .select("id");

    if (updateError) {
      return updateError.message;
    }

    if (debited.length > 0) {
      return null;
    }
  }

  return "并发冲突，重试多次仍未扣除额度";
};

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

    // 先挡掉额度不足的请求，避免白白在 Replicate 上创建模型和训练
    await validateUserCredits(user.id);

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

    const WEBHOOK_URL = getURL();

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

    // 扣除额度。必须等模型记录落库之后再扣：提前扣费而 insert 失败的话，
    // 训练会被取消，webhook 也找不到记录来退款，额度就凭空少了一次。
    // 训练此时已经在跑，扣费失败只记录告警，不再回滚打断用户。
    const creditError = await debitTrainingCredit(user.id);

    if (creditError) {
      console.error("扣除训练额度失败:", creditError);
    }

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
