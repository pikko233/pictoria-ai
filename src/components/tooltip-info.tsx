import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const TooltipInfo = ({ text }: { text: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger render={<Info className="size-4" />} />
      <TooltipContent>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};
