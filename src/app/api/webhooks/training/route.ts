import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 额度在发起训练时就预扣了（见 /api/train），训练没能产出模型就得退回去
const refundTrainingCredit = async (userId: string) => {
  const { data: credit, error } = await supabaseAdmin
    .from("credits")
    .select("model_training_count, max_model_training_count")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("webhook 退还训练额度失败: 读取额度出错", error);
    return;
  }

  const current = credit.model_training_count ?? 0;
  const max = credit.max_model_training_count ?? 0;

  // 退到套餐上限为止，避免任何异常路径把额度刷高
  if (current >= max) {
    return;
  }

  const { error: refundError } = await supabaseAdmin
    .from("credits")
    .update({ model_training_count: current + 1 })
    .eq("user_id", userId);

  if (refundError) {
    console.error("webhook 退还训练额度失败:", refundError);
  }
};

export async function POST(req: NextRequest) {
  try {
    // 签名必须基于原始报文计算，先 req.json() 再拼接会得到 "[object Object]"
    const rawBody = await req.text();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") ?? "";
    // 这里是 bucket 内的完整路径（<userId>/<时间戳>_<文件名>），不是纯文件名
    const fileName = url.searchParams.get("fileName") ?? "";

    const id = req.headers.get("webhook-id") ?? "";
    const timestamp = req.headers.get("webhook-timestamp") ?? "";
    const webhookSignature = req.headers.get("webhook-signature") ?? "";

    const secret = process.env.REPLICATE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("REPLICATE_WEBHOOK_SECRET is missing");
    }

    const secretBytes = Buffer.from(secret.split("_")[1], "base64");
    const signature = crypto
      .createHmac("sha256", secretBytes)
      .update(`${id}.${timestamp}.${rawBody}`)
      .digest("base64");

    // webhook-signature 形如 "v1,<sig> v1,<sig>"，轮换期间会同时带多个
    const isValid = webhookSignature
      .split(" ")
      .map((sig) => sig.split(",")[1])
      .some(
        (expected) =>
          expected?.length === signature.length &&
          crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature)),
      );

    if (!isValid) {
      return NextResponse.json(
        {
          error: "webhook请求失败: 非法签名",
        },
        {
          status: 401,
        },
      );
    }

    const body = JSON.parse(rawBody);
    const supabase = supabaseAdmin;

    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    if (userError || !userData) {
      return NextResponse.json(
        {
          error: "用户不存在",
        },
        {
          status: 401,
        },
      );
    }

    const email = userData.user.email ?? "";
    const username = userData.user.user_metadata?.full_name ?? "";
    const isSucceeded = body.status === "succeeded";

    const { error: emailError } = await resend.emails.send({
      // 发信域名必须在 Resend 验证过，未验证的域名会被 403 拒绝
      from: process.env.RESEND_FROM_EMAIL!,
      to: [email],
      subject: isSucceeded
        ? "Model Training Completed"
        : `Model Training ${body.status}`,
      react: EmailTemplate({
        username,
        message: isSucceeded
          ? "Your model training has been completed!"
          : `Your model training has been ${body.status}`,
      }),
    });

    // 邮件发失败不应该影响状态回写，否则模型会永远停在 processing
    if (emailError) {
      console.error("webhook 发送邮件失败:", emailError);
    }

    // output.version 形如 "owner/name:hash"，删除模型时用到的是冒号后的版本号
    const version = isSucceeded
      ? (body.output?.version?.split(":")[1] ?? null)
      : null;

    // 用 training_id 定位记录：model_name 可以重复，会误伤同名模型
    const { data: updated, error: updateError } = await supabase
      .from("models")
      .update({
        training_status: body.status,
        training_time: body.metrics?.total_time
          ? String(body.metrics.total_time)
          : null,
        version,
      })
      .eq("training_id", body.id)
      // 只处理仍在训练中的记录：Replicate 会重投 webhook，
      // 这个条件让重复投递命中 0 行，从而不会重复退还额度
      .in("training_status", ["starting", "processing"])
      .select();

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 匹配不到记录时 update 不会报错，这里必须显式告警，
    // 否则模型会一直停在 starting 而看不出原因（重复投递也会走到这里）
    if (updated.length === 0) {
      console.warn(
        `webhook 未更新任何模型记录，training_id: ${body.id}（记录不存在或已处理过）`,
      );
    } else if (!isSucceeded) {
      // 训练失败或被取消，没有产出模型，把预扣的额度退回去
      await refundTrainingCredit(userId);
    }

    // 训练素材已经用不上了，无论成功失败都清理掉
    if (fileName) {
      const { error: removeError } = await supabase.storage
        .from("training_data")
        .remove([fileName]);

      if (removeError) {
        console.error("webhook 清理训练素材失败:", removeError);
      }
    }

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
      },
    );
  }
}
