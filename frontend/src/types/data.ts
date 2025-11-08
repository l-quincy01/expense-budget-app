import {
  budgets,
  userMonthlyCategoryExpenditure,
  userMonthlyIncomeExpenseTransactions,
  userMonthlyTransactions,
} from "./types";

export const userBudgets: budgets[] = [
  { category: "GeneralRetail", budgetAmount: 5000, spentAmount: 2000 },
];

export const userMonthlyTransactionsData: userMonthlyTransactions[] = [
  {
    month: "September",
    transactions: [
      { day: "30", amount: 59.5 },
      { day: "30", amount: 9782.33 },
      { day: "30", amount: 135.0 },
    ],
  },
  {
    month: "October",
    transactions: [
      { day: "01", amount: -53.0 },
      { day: "01", amount: -74.0 },
      { day: "01", amount: -112.0 },
      { day: "01", amount: -400.0 },
      { day: "01", amount: -410.41 },
      { day: "01", amount: -2.0 },
      { day: "02", amount: -250.0 },
      { day: "02", amount: 1557.86 },
      { day: "04", amount: -515.87 },
      { day: "04", amount: -1.99 },
      { day: "07", amount: -1569.0 },
      { day: "07", amount: -379.0 },
      { day: "07", amount: -467.91 },
      { day: "07", amount: -529.0 },
      { day: "07", amount: -7000.0 },
      { day: "10", amount: -159.3 },
      { day: "10", amount: -115.71 },
      { day: "11", amount: -9.72 },
      { day: "11", amount: -9.72 },
      { day: "11", amount: -73.5 },
      { day: "11", amount: -0.55 },
      { day: "11", amount: -1.21 },
    ],
  },
];

export const userMonthlyIncomeExpenseTransactionsData: userMonthlyIncomeExpenseTransactions[] =
  [
    {
      month: "September",
      startingBalance: 2500,
      transactions: [
        { day: "30", income: 0, expense: 59.5 },
        { day: "30", income: 9782.33, expense: 0 },
        { day: "30", income: 0, expense: 135.0 },
        { day: "30", income: 0, expense: 0.0 },
      ],
    },
    {
      month: "October",
      startingBalance: 1800,
      transactions: [
        { day: "01", income: 0, expense: 53.0 },
        { day: "01", income: 0, expense: 53.0 },
      ],
    },
  ];

export const userMonthlyCategoryExpenditureData: userMonthlyCategoryExpenditure[] =
  [
    { month: "January", category: "Groceries", totalSpend: 520.35 },
    { month: "January", category: "Transport", totalSpend: 240.5 },
    { month: "January", category: "EatingOutAndTreats", totalSpend: 310.2 },
    { month: "January", category: "GeneralRetail", totalSpend: 180.0 },
    { month: "January", category: "Fuel", totalSpend: 350.75 },
    { month: "January", category: "ProfessionalServices", totalSpend: 120.0 },
    { month: "January", category: "PharmaciesAndWellbeing", totalSpend: 95.6 },
    { month: "January", category: "MusicGamingApps", totalSpend: 29.99 },

    { month: "February", category: "Groceries", totalSpend: 480.1 },
    { month: "February", category: "Transport", totalSpend: 262.9 },
    { month: "February", category: "EatingOutAndTreats", totalSpend: 282.0 },
    { month: "February", category: "GeneralRetail", totalSpend: 210.0 },
    { month: "February", category: "Fuel", totalSpend: 330.4 },
    { month: "February", category: "ProfessionalServices", totalSpend: 90.0 },
    { month: "February", category: "HomewareAndAppliances", totalSpend: 150.0 },
    { month: "February", category: "DonationsAndGiving", totalSpend: 50.0 },
  ];
