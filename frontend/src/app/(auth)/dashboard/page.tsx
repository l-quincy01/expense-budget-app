"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { ChartRadarDots } from "@/components/charts/radar-chart";
import { DataTable } from "@/components/data-table";
import { data } from "./data";
import SimpleTable from "@/components/table/simple-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SimpleTableManual from "@/components/table/simple-table-manual";
import { Button } from "@/components/ui/button";
import {
  ArrowDownWideNarrow,
  BanknoteArrowDown,
  BanknoteArrowUp,
  Pencil,
  Plus,
  Utensils,
  Wallet,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddTransactionDialog from "@/components/table/Dialog/add-transaction-dialog";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Headline from "@/components/dashboard/headline";
import BudgetView from "@/components/dashboard/budget-view";
import ChartsView from "@/components/dashboard/charts-view";
import TableView from "@/components/dashboard/table-view";

export default function Dashboard() {
  const api = useApi();
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api("/api/profile").then(setMe).catch(console.error);
  }, [api]);

  return (
    <div className="flex flex-col gap-8 px-16">
      <Headline />
      <BudgetView />
      <ChartsView />
      <TableView />
    </div>
  );
}
