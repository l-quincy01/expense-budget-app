import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { userMonthlyTransactions } from "@/types/types";

type StatementTableProps = {
  monthlyTransactions?: userMonthlyTransactions[];
};

export function StatementTable({
  monthlyTransactions = [],
}: StatementTableProps) {
  const rows = monthlyTransactions
    .flatMap((month) =>
      (month.transactions ?? []).map((transaction) => ({
        date: `${month.month} ${transaction.day.padStart(2, "0")}`,
        description: `Transaction on ${transaction.day}`,
        amount: transaction.amount,
      }))
    )
    .sort((a, b) => {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    })
    .slice(0, 50);

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(value);

  if (rows.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No statement data for this dashboard yet.
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Your latest transactions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="">Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, idx) => (
          <TableRow key={`${row.date}-${idx}`}>
            <TableCell className="font-medium">{row.date}</TableCell>
            <TableCell>{row.description}</TableCell>
            <TableCell className={row.amount < 0 ? "text-red-500" : ""}>
              {formatAmount(row.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
