import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ChartCardProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export function ChartCard({
  title,
  description,
  actions,
  children,
  className = "w-full",
  headerClassName = "flex flex-row justify-between items-center",
  contentClassName,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className={headerClassName}>
        <div>
          <CardTitle className="line-clamp-1">{title}</CardTitle>
          <CardDescription className="line-clamp-1">
            {description}
          </CardDescription>
        </div>
        {actions}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
