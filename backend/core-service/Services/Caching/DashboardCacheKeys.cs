namespace BudgetlyAI.Services.Caching;

public static class DashboardCacheKeys
{
    public static string Full(string userId, string dashboardName)
    {
        return $"dashboard:{userId}:{Normalize(dashboardName)}:full";
    }

    public static string MonthlySummary(string userId, string dashboardName = "all")
    {
        return $"dashboard:{userId}:{Normalize(dashboardName)}:monthly-summary";
    }

    public static string CategoryBreakdown(string userId, string dashboardName = "all")
    {
        return $"dashboard:{userId}:{Normalize(dashboardName)}:category-breakdown";
    }

    public static string BudgetProgress(string userId, string dashboardName = "all")
    {
        return $"dashboard:{userId}:{Normalize(dashboardName)}:budget-progress";
    }

    public static string UserPattern(string userId)
    {
        return $"dashboard:{userId}:*";
    }

    private static string Normalize(string value)
    {
        return Uri.EscapeDataString(value.Trim());
    }
}
