import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function InfoBudgetView() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost">
          <Info size={14} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Budget spent amounts are based on the current month. </p>
      </TooltipContent>
    </Tooltip>
  );
}
