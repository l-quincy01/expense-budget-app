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

export default function SimpleTableManual() {
  return (
    <div>
      {/* 
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>30 Sep</TableCell>
            <TableCell>Salary</TableCell>
            <TableCell>R250.00</TableCell>
          </TableRow>
        </TableBody>
      </Table> */}

      <div className="flex flex-col gap-2 pb-4">
        <div className="grid grid-cols-[1fr_3fr_1fr] items-center border p-3 rounded-xl">
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
