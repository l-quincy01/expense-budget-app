import { ReactNode } from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoveRight } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  meta: ReactNode;
  trend: string;
};

export function MetricCard({
  title,
  value,
  icon,
  meta,
  trend,
}: MetricCardProps) {
  return (
    <Card className="@container/card w-full">
      <CardHeader>
        <CardDescription>
          <p className="text-sm font-semibold">{title}</p>
        </CardDescription>
        <CardTitle>
          <p className="font-bold text-2xl">{value}</p>
        </CardTitle>
        <CardAction>{icon}</CardAction>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">{meta}</div>
        <div className="line-clamp-1 gap-2 font-medium items-center flex">
          {trend} <MoveRight className="size-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
