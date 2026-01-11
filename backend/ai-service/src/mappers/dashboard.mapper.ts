type OverviewInput = {
  month: string;
  moneyIn: number;
  moneyOut: number;
  startingBalance: number;
};

type MonthlyTransactionsInput = {
  month: string;
  transactions: any[];
  startingBalance?: number;
};

type CategoryExpenditureInput = {
  month: string;
  category: string;
  totalSpend: number;
};

export function mapOverview(o: OverviewInput) {
  return {
    month: o.month,
    moneyIn: o.moneyIn,
    moneyOut: o.moneyOut,
    startingBalance: o.startingBalance,
  };
}

export function mapMonthly(
  items: MonthlyTransactionsInput[] = [],
  userId: string,
  dashboardName: string,
  includeStartingBalance = false
) {
  return items.map((m) => ({
    userId,
    dashboardName,
    month: m.month,
    ...(includeStartingBalance && {
      startingBalance: m.startingBalance ?? 0,
    }),
    transactions: m.transactions,
  }));
}

export function mapCategory(
  items: CategoryExpenditureInput[] = [],
  userId: string,
  dashboardName: string
) {
  return items.map((c) => ({
    userId,
    dashboardName,
    month: c.month,
    category: c.category,
    totalSpend: c.totalSpend,
  }));
}

export function buildDashboardDocument(
  userId: string,
  dashboardName: string,
  data: any
) {
  return {
    userId,
    name: dashboardName,
    overview: (data.overviewData ?? []).map(mapOverview),
    userMonthlyTransactions: mapMonthly(
      data.userMonthlyTransactionsData,
      userId,
      dashboardName
    ),
    userMonthlyIncomeExpenseTransactions: mapMonthly(
      data.userMonthlyIncomeExpenseTransactionsData,
      userId,
      dashboardName,
      true
    ),
    userMonthlyCategoryExpenditure: mapCategory(
      data.userMonthlyCategoryExpenditureData,
      userId,
      dashboardName
    ),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function buildDashboardUpdate(
  userId: string,
  dashboardName: string,
  data: any
) {
  const push: any = {};

  if (data.overviewData?.length)
    push.overview = { $each: data.overviewData.map(mapOverview) };

  if (data.userMonthlyTransactionsData?.length)
    push.userMonthlyTransactions = {
      $each: mapMonthly(
        data.userMonthlyTransactionsData,
        userId,
        dashboardName
      ),
    };

  if (data.userMonthlyIncomeExpenseTransactionsData?.length)
    push.userMonthlyIncomeExpenseTransactions = {
      $each: mapMonthly(
        data.userMonthlyIncomeExpenseTransactionsData,
        userId,
        dashboardName,
        true
      ),
    };

  if (data.userMonthlyCategoryExpenditureData?.length)
    push.userMonthlyCategoryExpenditure = {
      $each: mapCategory(
        data.userMonthlyCategoryExpenditureData,
        userId,
        dashboardName
      ),
    };

  return {
    $set: { updatedAt: new Date() },
    ...(Object.keys(push).length ? { $push: push } : {}),
  };
}
