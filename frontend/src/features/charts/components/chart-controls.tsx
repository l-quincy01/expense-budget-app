import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid } from "lucide-react";

type ChartView = "trends" | "categories";

type ChartControlsProps = {
  view: ChartView;
  onViewChange: (value: ChartView) => void;
  gridLayout: boolean;
  onToggleGridLayout: () => void;
};

export function ChartControls({
  view,
  onViewChange,
  gridLayout,
  onToggleGridLayout,
}: ChartControlsProps) {
  return (
    <div className="w-full flex flex-row justify-between">
      <Select
        value={view}
        onValueChange={(value) => onViewChange(value as ChartView)}
      >
        <SelectTrigger
          className="flex w-fit @4xl/main:hidden"
          size="sm"
          id="view-selector"
        >
          <SelectValue placeholder="Select a view" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="trends">Spending Trends</SelectItem>
          <SelectItem value="categories">Spending Categories</SelectItem>
        </SelectContent>
      </Select>

      <div
        className={`hover:bg-accent p-2 rounded-full ${
          !gridLayout ? "bg-transparent" : "bg-accent"
        }`}
        onClick={onToggleGridLayout}
      >
        <LayoutGrid />
      </div>
    </div>
  );
}
