export function incomePercentageSpentMessage(incomePercentage: number) {
  switch (true) {
    case incomePercentage < 70:
      return "Good";
    case incomePercentage >= 70 && incomePercentage < 90:
      return "Caution";
    case incomePercentage >= 90 && incomePercentage < 999:
      return "Needs Work";
    case incomePercentage >= 999:
      return "Not Available";
    default:
      return "n/a";
  }
}
