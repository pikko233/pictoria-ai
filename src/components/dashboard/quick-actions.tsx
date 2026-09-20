"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { CreditCard, PlusIcon, Wand2Icon } from "lucide-react";

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>快捷操作</CardTitle>
        <CardDescription>快速开始常用操作</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Link href={`/image-generation`}>
          <Button size="lg" className={"w-full"}>
            <Wand2Icon className="size-4" />
            生成图片
          </Button>
        </Link>
        <Link href={`/model-training`}>
          <Button size="lg" variant={"destructive"} className={"w-full"}>
            <PlusIcon className="size-4" />
            训练新模型
          </Button>
        </Link>
        <Link href={`/billing`}>
          <Button size="lg" variant={"secondary"} className={"w-full"}>
            <CreditCard className="size-4" />
            账单与套餐
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
