import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Fuel, Handbag, ShoppingBasket, Utensils } from "lucide-react";

export default function SimpleTable() {
  return (
    <div>
      <div className="flex flex-col gap-2 pb-4">
        <div className="grid grid-cols-[1fr_3fr_1fr] items-center">
          <div className="p-3 rounded-full dark:bg-blue-400 bg-blue-200 w-fit">
            <Utensils size={20} />
          </div>
          <div>Dinning and takeouts</div>
          <div>R1299.52</div>
        </div>
      </div>
    </div>
  );
}
