"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Model } from "@/lib/types";
import { Badge } from "../ui/badge";
import { GENDER_LABEL_MAP, TRAINING_STATUS_MAP } from "@/constants";

interface Props {
  models: Array<Model>;
}

export const RecentModels = ({ models }: Props) => {
  if (models.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>最近模型</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <p className="my-16 text-muted-foreground">还没有训练过模型</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近模型</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-6">
          {models.length === 0 ? (
            <p>还没有训练过模型</p>
          ) : (
            models
              .filter(
                (
                  model,
                ): model is Model & {
                  training_status: NonNullable<Model["training_status"]>;
                } => model.training_status !== null,
              )
              .map((model) => {
                const status = TRAINING_STATUS_MAP[model.training_status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={model.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{model.model_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {model.gender ? GENDER_LABEL_MAP[model.gender] : "未知"}
                      </p>
                    </div>
                    <Badge variant="secondary" className={status.className}>
                      <StatusIcon className="size-3" />
                      {status.label}
                    </Badge>
                  </div>
                );
              })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
