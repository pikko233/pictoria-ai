"use client";

import { Database } from "@database.types";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  ImageOff,
  Loader2,
  LoaderCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import Link from "next/link";
import { GENDER_LABEL_MAP } from "@/constants";
import { cn } from "@/lib/utils";
import { toast } from "../ui/toast";
import { deleteModel } from "@/app/actions/model-actions";
import { useState } from "react";

type TrainingStatus = Database["public"]["Enums"]["training_status"];

const TRAINING_STATUS_MAP = {
  starting: { label: "排队中", icon: LoaderCircle, className: "text-blue-500" },
  processing: {
    label: "训练中",
    icon: LoaderCircle,
    className: "text-blue-500",
  },
  succeeded: {
    label: "训练完成",
    icon: CheckCircle2,
    className: "text-green-500",
  },
  failed: { label: "训练失败", icon: XCircle, className: "text-destructive" },
  canceled: { label: "已取消", icon: Ban, className: "text-muted-foreground" },
} as const;

const TrainingStatusBadge = ({ status }: { status: TrainingStatus | null }) => {
  if (!status) return null;

  const { label, icon: Icon, className } = TRAINING_STATUS_MAP[status];
  const isRunning = status === "starting" || status === "processing";

  return (
    <div className={cn("flex items-center gap-1 text-sm", className)}>
      <Icon className={cn("size-4", isRunning && "animate-spin")} />
      <span>{label}</span>
    </div>
  );
};

interface Props {
  models: Database["public"]["Tables"]["models"]["Row"][] | null;
  count: number;
}

export const ModelList = ({ models, count }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (
    id: string,
    modelId: string,
    modelVersion: string,
  ) => {
    setLoading(true);
    const run = async () => {
      const { success, error } = await deleteModel(id, modelId, modelVersion);
      if (error) {
        throw new Error(error);
      }
      if (success) {
        return success;
      }
    };

    toast.promise(
      run().finally(() => setLoading(false)),
      {
        loading: "正在删除模型...",
        success: "删除成功～",
        error: (error) => `删除失败: ${error}`,
      },
    );
  };

  if (!models || models.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageOff />
            </EmptyMedia>
            <EmptyTitle>暂无模型</EmptyTitle>
            <EmptyDescription>快去训练你的第一个模型吧～</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Link href="/model-training">
              <Button nativeButton>前往训练模型</Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    );
  }
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {models.map((model) => (
        <Card key={model.id} className="relative flex flex-col overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-2xl font-bold">
                {model.model_name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <TrainingStatusBadge status={model.training_status} />

                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button variant="ghost" size="icon" />}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>你确定删除吗？</AlertDialogTitle>
                      <AlertDialogDescription>
                        该操作无法撤回
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={loading}>
                        取消
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() =>
                          handleDelete(
                            model.id.toString(),
                            model.model_id!,
                            model.version ?? "",
                          )
                        }
                        disabled={loading}
                      >
                        {loading && <Loader2 className="size-4 animate-spin" />}
                        确定
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <CardDescription>
              {formatDistanceToNow(model.created_at, {
                locale: zhCN,
                addSuffix: true,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid gap-3 grid-cols-2">
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    <span>训练时长</span>
                  </div>
                  <p className="mt-1 font-medium">
                    {Math.round(Number(model.training_time) / 60) || NaN} 分钟
                  </p>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    <span>性别</span>
                  </div>
                  <p className="mt-1 font-medium">
                    {model.gender ? GENDER_LABEL_MAP[model.gender] : "无"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="px-4 pt-0">
            <Link
              href={
                model.training_status === "succeeded"
                  ? `/image-generation?modelId=${model.id}`
                  : "#"
              }
              className={cn(
                "group",
                model.training_status !== "succeeded" &&
                  "pointer-events-none cursor-not-allowed",
              )}
            >
              <Button
                nativeButton
                size="lg"
                className="inline-flex w-full"
                disabled={model.training_status !== "succeeded"}
              >
                生成图片
                <ArrowRight className="ml-1 size-4 group-hover:translate-x-2 transition-all duration-300" />
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
};
