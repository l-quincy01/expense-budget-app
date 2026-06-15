import { useCallback, useEffect, useState } from "react";

export type ChartRange = "1m" | "3m" | "max";

function getMonthsToShow(range: ChartRange, totalMonths: number) {
  const rawMonthsToShow =
    range === "1m" ? 1 : range === "3m" ? 3 : totalMonths;
  return Math.min(rawMonthsToShow, totalMonths);
}

export function useChartWindowRange(totalMonths: number) {
  const [range, setRange] = useState<ChartRange>("max");
  const [windowStart, setWindowStart] = useState(0);

  useEffect(() => {
    if (!totalMonths || range === "max") {
      setWindowStart(0);
      return;
    }

    const monthsToShow = getMonthsToShow(range, totalMonths);
    setWindowStart(Math.max(0, totalMonths - monthsToShow));
  }, [range, totalMonths]);

  const monthsToShow = getMonthsToShow(range, totalMonths);
  const maxStartIndex = Math.max(0, totalMonths - monthsToShow);
  const canGoPrev = range !== "max" && windowStart > 0;
  const canGoNext = range !== "max" && windowStart < maxStartIndex;

  const handlePrev = useCallback(() => {
    if (!canGoPrev) return;
    setWindowStart((prev) => Math.max(0, prev - 1));
  }, [canGoPrev]);

  const handleNext = useCallback(() => {
    if (!canGoNext) return;
    setWindowStart((prev) => Math.min(maxStartIndex, prev + 1));
  }, [canGoNext, maxStartIndex]);

  return {
    range,
    setRange,
    windowStart,
    monthsToShow,
    maxStartIndex,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  };
}
