import { MailCheck } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
  email: string;
  onBack: () => void;
};

export const CheckEmail = ({ email, onBack }: Props) => {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-primary/10 p-3 text-primary">
        <MailCheck className="size-6" />
      </div>
      <p className="text-sm text-muted-foreground">
        确认链接已发送至
        <span className="block font-medium text-foreground">{email}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        请点击邮件中的链接完成注册。如果没有收到，请检查垃圾邮件。
      </p>
      <Button variant="link" className="p-0" onClick={onBack}>
        返回登录
      </Button>
    </div>
  );
};
