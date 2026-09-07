"use client";

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
import { Button } from "../ui/button";
import { Loader, Trash2 } from "lucide-react";
import { toast } from "../ui/toast";
import { deleteImage } from "@/app/actions/image-actions";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  imageId: string;
  onDelete?: () => void;
  className?: string;
  imageName: string;
}

export const DeleteImage = ({
  imageId,
  onDelete,
  className,
  imageName,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    toast.promise(
      new Promise(async (resolve, reject) => {
        const { success, error } = await deleteImage(imageId, imageName);
        setLoading(false);
        if (success) {
          onDelete?.();
          resolve(true);
        } else {
          reject(error);
        }
      }),
      {
        loading: "正在删除图片...",
        success: "删除成功～",
        error: (error) => `删除失败: ${error}`,
      },
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button size="icon" variant="destructive" className={cn(className)}>
            <Trash2 className="size-4" />
          </Button>
        }
      ></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>你确定删除该图片吗?</AlertDialogTitle>
          <AlertDialogDescription>该操作无法撤回</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <Loader className="size-4 animate-spin" /> : "确定"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
