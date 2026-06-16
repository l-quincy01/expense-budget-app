"use client";

import { FormEvent, useMemo, useState } from "react";
import { IconRefresh, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardContext } from "@/features/dashboard/components/providers/dashboard-provider";
import { useApi } from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import {
  transactionSearchApi,
  type TransactionSearchFilters,
  type TransactionSearchResult,
} from "@/features/transactions/services/transaction-search-api";

const allValue = "__all__";

function monthToRange(month: string) {
  if (!month) return { from: "", to: "" };

  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return { from: "", to: "" };

  const lastDay = new Date(year, monthNumber, 0).getDate();
  return {
    from: `${year}-${String(monthNumber).padStart(2, "0")}-01`,
    to: `${year}-${String(monthNumber).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function TransactionSearchView() {
  const api = useApi();
  const { dashboardNames } = useDashboardContext();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [dashboardName, setDashboardName] = useState("");
  const [results, setResults] = useState<TransactionSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo<TransactionSearchFilters>(() => {
    const range = monthToRange(month);
    return {
      query,
      category,
      from: range.from,
      to: range.to,
      minAmount,
      maxAmount,
      transactionType,
      dashboardName,
    };
  }, [
    query,
    category,
    month,
    minAmount,
    maxAmount,
    transactionType,
    dashboardName,
  ]);

  const runSearch = async (event?: FormEvent) => {
    event?.preventDefault();

    try {
      setLoading(true);
      setError(null);
      const response = await transactionSearchApi.search(api, filters);
      setResults(response.results ?? []);
      setTotal(response.total ?? 0);
      setSearched(true);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to search transactions"));
      setResults([]);
      setTotal(0);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setMonth("");
    setMinAmount("");
    setMaxAmount("");
    setTransactionType("");
    setDashboardName("");
    setResults([]);
    setTotal(0);
    setSearched(false);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-normal">
          Transactions Search
        </h1>
        <p className="text-sm text-muted-foreground">
          Search extracted statement transactions across your dashboards.
        </p>
      </div>

      <form
        className="grid gap-3 rounded-md border bg-background p-4 md:grid-cols-6"
        onSubmit={runSearch}
      >
        <div className="md:col-span-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search description, merchant, category"
          />
        </div>
        <Input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category"
        />
        <Input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
        <Input
          type="number"
          inputMode="decimal"
          value={minAmount}
          onChange={(event) => setMinAmount(event.target.value)}
          placeholder="Min amount"
        />
        <Input
          type="number"
          inputMode="decimal"
          value={maxAmount}
          onChange={(event) => setMaxAmount(event.target.value)}
          placeholder="Max amount"
        />
        <Select
          value={transactionType || allValue}
          onValueChange={(value) =>
            setTransactionType(value === allValue ? "" : value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allValue}>All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={dashboardName || allValue}
          onValueChange={(value) =>
            setDashboardName(value === allValue ? "" : value)
          }
        >
          <SelectTrigger className="w-full md:col-span-2">
            <SelectValue placeholder="Dashboard" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allValue}>All dashboards</SelectItem>
            {dashboardNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 md:col-span-3">
          <Button type="submit" disabled={loading}>
            <IconSearch size={16} />
            {loading ? "Searching" : "Search"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            disabled={loading}
          >
            <IconRefresh size={16} />
            Clear
          </Button>
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-md border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-medium">
            {searched ? `${total} result${total === 1 ? "" : "s"}` : "Results"}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Dashboard</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell className="min-w-64 whitespace-normal">
                  {transaction.description}
                </TableCell>
                <TableCell>{transaction.merchant || "-"}</TableCell>
                <TableCell>{transaction.category || "-"}</TableCell>
                <TableCell>{transaction.dashboardName}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
            {!loading && searched && results.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
            {!loading && !searched && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Run a search to view indexed statement transactions.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Searching transactions...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
